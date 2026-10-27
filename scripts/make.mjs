#!/usr/bin/env node
/* Prepare the photo, and compose the share image once the pop-up picture is there:
     node scripts/make.mjs popup-pages/<slug> [--prepare-only] [--force]
   1. Turns photo.heic into JPEG, keeps the date the photo was taken (EXIF DateTimeOriginal, the date only: no time, no
      place) in photo-meta.json for the share card's DATE line, then cleans the photo: re-encodes it in place without
      its metadata (GPS position, camera, …) and scales it to at most 1600 px on the long side. The rendered share card uses the cleaned copy.
   2. If page.js exists: render.mjs checks and renders it, then card.mjs composes card.png
      (--force composes even without a Chinese font). Without page.js (or with --prepare-only) it stops after preprocessing.
   Then open card.png and go through references/publishing.md before posting it. */
import {readFile, readdir, writeFile, access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), dirArg = args.find(a => !a.startsWith('--'));
if (!dirArg) { console.error('usage: node scripts/make.mjs <page folder> [--prepare-only] [--force]'); process.exit(2); }
const dir = path.resolve(dirArg);

// 0 · iPhone photos (HEIC) are turned into JPEG first, keeping their EXIF (the date is read from it below): sips on a
// Mac, else heif-convert, else Python's pillow-heif (pip install pillow-heif)
for (const f of (await readdir(dir)).filter(f => /^(photo|memory)\.hei[cf]$/i.test(f))) {
  const src = path.join(dir, f), dst = path.join(dir, f.replace(/\.hei[cf]$/i, '.jpg'));
  const tries = [['sips', ['-s', 'format', 'jpeg', src, '--out', dst]], ['heif-convert', [src, dst]],
    ['python3', ['-I', '-c', 'import sys,pillow_heif;from PIL import Image;pillow_heif.register_heif_opener();im=Image.open(sys.argv[1]);im.save(sys.argv[2],quality=92,exif=im.info.get("exif",b""))', src, dst]]];
  if (!tries.some(([cmd, a]) => { try { execFileSync(cmd, a, {stdio: 'ignore'}); return true; } catch { return false; } })) {
    console.error(`Can't read ${f}: install pillow-heif (pip install pillow-heif) or libheif (heif-convert), or export the photo as JPEG.`); process.exit(2); }
  const {unlink} = await import('node:fs/promises'); await unlink(src); console.log(`photo: ${f} → ${path.basename(dst)}`);
}

// 1 · the photo
const photoFile = (await readdir(dir)).find(f => /^photo\.(jpe?g|png|webp)$/i.test(f));
if (!photoFile) { console.error(`No photo.jpg / photo.png / photo.webp / photo.heic in ${dir}`); process.exit(2); }
const photoPath = path.join(dir, photoFile), buf = await readFile(photoPath);
// metadata blocks: JPEG APP1 (Exif / XMP), PNG eXIf / tEXt / iTXt / zTXt, WebP EXIF / XMP chunks
const head = buf.subarray(0, Math.min(buf.length, 1 << 20)).toString('latin1');
const hasMeta = /Exif\0|http:\/\/ns\.adobe\.com\/xap|eXIf|tEXt|iTXt|zTXt|EXIF|XMP /.test(head);
// the date taken, from a JPEG's EXIF (APP1 "Exif" → TIFF → IFD0 → Exif IFD → 0x9003 DateTimeOriginal, else 0x0132)
const exifDate = b => {
  for (let i = 2; i + 4 < b.length && b[i] === 0xff; i += 2 + b.readUInt16BE(i + 2)) {
    if (b[i + 1] !== 0xe1 || b.toString('latin1', i + 4, i + 10) !== 'Exif\0\0') continue;
    const t = i + 10, le = b.toString('latin1', t, t + 2) === 'II', u16 = o => le ? b.readUInt16LE(t + o) : b.readUInt16BE(t + o), u32 = o => le ? b.readUInt32LE(t + o) : b.readUInt32BE(t + o);
    const tags = ifd => { const out = {}; for (let n = u16(ifd), k = 0; k < n; k++) { const e = ifd + 2 + k * 12; out[u16(e)] = {type: u16(e + 2), count: u32(e + 4), at: e + 8}; } return out; };
    const str = e => { const off = e.count > 4 ? u32(e.at) : e.at; return b.toString('latin1', t + off, t + off + e.count - 1); };
    const ifd0 = tags(u32(4)), ex = ifd0[0x8769] ? tags(u32(ifd0[0x8769].at)) : {}, e = ex[0x9003] || ifd0[0x0132];
    const m = e && str(e).match(/^(\d{4}):(\d\d):(\d\d)/);
    return m ? `${m[1]}.${m[2]}.${m[3]}` : '';
  }
  return '';
};
let date = '';
try { if (/jpe?g$/i.test(photoFile)) date = exifDate(buf); } catch {}
const metaFile = path.join(dir, 'photo-meta.json');
if (date && !(await access(metaFile).then(() => true, () => false))) { await writeFile(metaFile, JSON.stringify({date}) + '\n'); console.log(`photo: taken ${date} (kept in photo-meta.json for the DATE line)`); }
const type = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'}[path.extname(photoFile).slice(1).toLowerCase()];

let chromium;
try { ({chromium} = createRequire(import.meta.url)('playwright')); } catch { ({chromium} = await import('playwright')); }
const browser = await chromium.launch();
const page = await browser.newPage();
// the browser decodes the photo (applying its EXIF orientation), draws it on a canvas and encodes it again: the new file
// carries pixels only
const res = await page.evaluate(async ({src, type, hasMeta}) => {
  const img = await createImageBitmap(await (await fetch(src)).blob());
  const k = Math.min(1, 1600 / Math.max(img.width, img.height));
  if (k === 1 && !hasMeta) return {w: img.width, h: img.height};
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return {w: c.width, h: c.height, data: c.toDataURL(type, .9)};
}, {src: `data:${type};base64,${buf.toString('base64')}`, type, hasMeta});
await browser.close();
if (res.data) {
  await writeFile(photoPath, Buffer.from(res.data.split(',')[1], 'base64'));
  console.log(`photo: ${photoFile} re-encoded ${res.w}×${res.h}${hasMeta ? ', metadata removed' : ''}`);
} else console.log(`photo: ${photoFile} ${res.w}×${res.h}, no metadata`);
// the memory card's photo (river-landmark pages) is printed on the page too: strip its metadata the same way
const memFile = (await readdir(dir)).find(f => /^memory\.(jpe?g|png|webp)$/i.test(f));
if (memFile) {
  const mb = await readFile(path.join(dir, memFile)), mt = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'}[path.extname(memFile).slice(1).toLowerCase()];
  if (/Exif\0|http:\/\/ns\.adobe\.com\/xap|eXIf|tEXt|iTXt|zTXt|EXIF|XMP /.test(mb.subarray(0, 1 << 20).toString('latin1'))) {
    const b2 = await chromium.launch(), p2 = await b2.newPage();
    const data = await p2.evaluate(async ({src, mt}) => { const img = await createImageBitmap(await (await fetch(src)).blob()), c = document.createElement('canvas');
      c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL(mt, .9); }, {src: `data:${mt};base64,${mb.toString('base64')}`, mt});
    await b2.close(); await writeFile(path.join(dir, memFile), Buffer.from(data.split(',')[1], 'base64')); console.log(`memory: ${memFile} metadata removed`);
  }
}
if (Math.max(res.w, res.h) < 1000) console.warn(`WARNING: the photo is only ${Math.max(res.w, res.h)} px on its long side and will look blurred on the share card. Ask the user for the original (at least 1000 px, ideally 1600 or more).`);

// 2 · page.js is the source of the picture. Never reuse a stale popup.png when page.js exists.
const names = await readdir(dir);
if (args.includes('--prepare-only') || !names.includes('page.js')) {
  console.log(`Photo prepared. Write page.js, then run make.mjs again.`);
  process.exit(0);
}
const force = args.includes('--force') ? ['--force'] : [];
try {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/render.mjs'), dir, ...force], {stdio: 'inherit'});
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/card.mjs'), dir, ...force], {stdio: 'inherit'});
} catch { process.exit(1); }
console.log(`done: ${path.join(dir, 'card.png')}`);
