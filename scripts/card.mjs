#!/usr/bin/env node
/* Compose the share card: the original photo above, the rendered pop-up page below, on a paper background.
     node scripts/card.mjs examples/west-end [--size 1080x1440] [--out card.png] [--style print|classic]
   print (default): the photo full-bleed with a torn-paper bottom edge, a postmark, a typewriter title, and the pop-up
     page in its own colours (drawn from the photo) on the same paper: render with the paper desk (render.mjs default)
     and the desk is balanced to the card's paper so the two become one sheet. The postmark is printed in the photo's
     cool colour (or card.cool). PLACE and DATE along the bottom (card.date, or the date make.mjs kept from the photo).
   classic: the photo as a taped Polaroid, the pop-up page in a white frame, the English and Chinese titles.
   Reads <page dir>/photo.(jpg|jpeg|png|webp), <page dir>/popup.png (run render.mjs first) and the page's `card` /
   `title` / `subtitle` fields (card.focus: which part of the photo to keep when it is cropped, a CSS object-position such
   as '50% 20%' to keep the top; card.credit: a photo credit, required when the photo isn't the user's own). The card always
   says the pop-up page was drawn with AI help (platforms such as Xiaohongshu ask for AI content to be labelled). Saves <page dir>/card.png at 2× (2160 × 2880 for the default 3:4 size). */
import {readFile, readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fontCheck, fontNote} from './fonts.mjs';

const VALUED = new Set(['out', 'size', 'style']), opts = {}, pos = [];
for (let a = process.argv.slice(2), i = 0; i < a.length; i++) {
  if (!a[i].startsWith('--')) pos.push(a[i]); else { const k = a[i].slice(2); opts[k] = VALUED.has(k) ? a[++i] : true; }
}
if (!pos[0]) { console.error('usage: node scripts/card.mjs <page folder> [--size 1080x1440] [--out card.png] [--style print|classic] [--force]'); process.exit(2); }
const dir = path.resolve(pos[0]), out = path.resolve(dir, opts.out || 'card.png');
const [W, H] = String(opts.size || '1080x1440').split('x').map(Number);

const files = await readdir(dir);
const photoFile = files.find(f => /^photo\.(jpe?g|png|webp)$/i.test(f));
if (!photoFile) { console.error(`No photo.jpg / photo.png in ${dir}`); process.exit(2); }
if (!files.includes('popup.png')) { console.error('No popup.png yet: run  node scripts/render.mjs ' + pos[0]); process.exit(2); }
const dataUrl = async f => `data:image/${path.extname(f).slice(1).replace('jpg', 'jpeg')};base64,${(await readFile(path.join(dir, f))).toString('base64')}`;
const [photo, popup] = await Promise.all([dataUrl(photoFile), dataUrl('popup.png')]);

// the page's words: title, subtitle and the `card` block ({zh, caption, place, time}); read from page.js as text so
// the page module (which may need a browser) never has to run here
const full = await readFile(path.join(dir, 'page.js'), 'utf8'), src = full.slice(full.lastIndexOf('export default'));
const pick = (re, d = '') => (src.match(re) || [, d])[1];
const meta = {
  title: pick(/\btitle:\s*'([^']*)'/), subtitle: pick(/\bsubtitle:\s*'([^']*)'/),
  zh: pick(/card:\s*{[^}]*\bzh:\s*'([^']*)'/), caption: pick(/card:\s*{[^}]*\bcaption:\s*'([^']*)'/),
  place: pick(/card:\s*{[^}]*\bplace:\s*'([^']*)'/), time: pick(/card:\s*{[^}]*\btime:\s*'([^']*)'/),
  credit: pick(/card:\s*{[^}]*\bcredit:\s*'([^']*)'/), focus: pick(/card:\s*{[^}]*\bfocus:\s*'([^']*)'/, '50% 50%'),
  heading: pick(/card:\s*{[^}]*\bheading:\s*'([^']*)'/), date: pick(/card:\s*{[^}]*\bdate:\s*'([^']*)'/),
  stamp: pick(/card:\s*{[^}]*\bstamp:\s*'([^']*)'/), warm: pick(/card:\s*{[^}]*\bwarm:\s*'([^']*)'/), cool: pick(/card:\s*{[^}]*\bcool:\s*'([^']*)'/),
};
// Optional structured overrides avoid relying on literal source formatting.
const overrides = files.includes('card.json') ? JSON.parse(await readFile(path.join(dir, 'card.json'), 'utf8')) : {};
for (const key of ['title', 'subtitle', 'zh', 'caption', 'place', 'time', 'credit', 'focus', 'heading', 'date', 'stamp', 'warm', 'cool']) {
  if (Object.hasOwn(overrides, key)) meta[key] = String(overrides[key] ?? '');
}
// the date the photo was taken, kept by make.mjs before it strips the photo's metadata
if (!Object.hasOwn(overrides, 'date') && !/card:\s*{[^}]*\bdate:\s*'/.test(src) && !meta.date && files.includes('photo-meta.json')) try { meta.date = JSON.parse(await readFile(path.join(dir, 'photo-meta.json'), 'utf8')).date || ''; } catch {}
const style = opts.style || 'print';
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

const classicHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Noto+Serif+SC:wght@400;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; background: #f3ead8; font-family: "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif; color: #3a2c20; position: relative; }
  body::before { content: ""; position: absolute; inset: 0; background:
    radial-gradient(circle at 20% 10%, rgba(255,255,255,.55), transparent 55%), radial-gradient(circle at 90% 90%, rgba(150,110,60,.12), transparent 50%);
    pointer-events: none; }
  .frame { position: absolute; inset: 22px; border: 2px solid #b9a37a; }
  .frame::after { content: ""; position: absolute; inset: 8px; border: 1px solid #d6c4a0; }
  .top { position: absolute; left: 0; right: 0; top: 56px; text-align: center; letter-spacing: .32em; font: 600 20px "Cormorant Garamond", serif; color: #8a6d48; }
  .photo { position: absolute; left: 76px; top: 104px; width: ${W - 230}px; height: ${Math.round(H * .3)}px; background: #fffdf8; padding: 14px 14px 46px;
    box-shadow: 0 10px 24px rgba(60,40,20,.22); transform: rotate(-2.2deg); }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: ${esc(meta.focus)}; display: block; }
  .photo span { position: absolute; left: 18px; bottom: 12px; font: italic 600 22px "Cormorant Garamond", serif; color: #6d5a44; }
  .photo em { position: absolute; right: 18px; bottom: 15px; font: 400 13px "Cormorant Garamond", serif; font-style: normal; color: #9a8a74; }
  .ai { position: absolute; right: 56px; top: ${Math.round(H * .3) + 216 + Math.round(H * .37) + 12}px; font: 400 15px "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif; color: #9a8a74; letter-spacing: .08em; }
  .tape { position: absolute; width: 120px; height: 34px; background: rgba(214,190,140,.65); top: -14px; }
  .arrow { position: absolute; right: 92px; top: ${Math.round(H * .3) + 128}px; text-align: right; font: 500 22px "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif; color: #9a3a2e; }
  .arrow svg { display: block; margin: 4px 0 0 auto; }
  .popup { position: absolute; left: 50px; right: 50px; top: ${Math.round(H * .3) + 216}px; height: ${Math.round(H * .37)}px; border-radius: 6px; overflow: hidden;
    box-shadow: 0 14px 30px rgba(40,25,10,.3); border: 10px solid #fffdf8; }
  .popup img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block; }
  .words { position: absolute; left: 70px; right: 70px; bottom: 58px; }
  .title { display: inline-block; white-space: nowrap; font: italic 600 58px "Cormorant Garamond", serif; color: #2e2218; line-height: 1; }
  .title small { font: 500 24px "Cormorant Garamond", serif; letter-spacing: .2em; color: #8a6d48; margin-left: 14px; font-style: normal; }
  .zh { margin-top: 12px; font: 600 26px "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif; color: #4a3826; }
  .cap { margin-top: 8px; font: 400 20px "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif; color: #6d5a44; line-height: 1.55; }
  .stamp { position: absolute; right: 70px; bottom: 64px; width: 112px; height: 112px; border-radius: 50%; border: 2px dashed #9a3a2e; color: #9a3a2e;
    display: grid; place-items: center; text-align: center; font: 600 15px "Cormorant Garamond", serif; letter-spacing: .12em; transform: rotate(8deg); }
</style></head><body>
<div class="frame"></div>
<div class="top">PHOTO&nbsp;&nbsp;→&nbsp;&nbsp;POP-UP</div>
<div class="photo"><div class="tape" style="left:40px;transform:rotate(-6deg)"></div><div class="tape" style="right:40px;transform:rotate(5deg)"></div>
  <img src="${photo}"><span>${esc(meta.place)}${meta.time ? ' · ' + esc(meta.time) : ''}</span>${meta.credit ? `<em>${esc(meta.credit)}</em>` : ''}</div>
<div class="arrow">翻开，它就立起来了
  <svg width="120" height="70" viewBox="0 0 120 70"><path d="M110,4 C100,40 60,52 18,56" fill="none" stroke="#9a3a2e" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>
  <path d="M30,46 L16,57 L32,64" fill="none" stroke="#9a3a2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div class="popup"><img src="${popup}"></div>
<div class="ai">立体页由 AI 辅助绘制</div>
<div class="words">
  <div class="title">${esc(meta.title)}<small>${esc(meta.subtitle).toUpperCase()}</small></div>
  ${meta.zh ? `<div class="zh">${esc(meta.zh)}</div>` : ''}
  ${meta.caption ? `<div class="cap" style="max-width:${W - 330}px">${esc(meta.caption)}</div>` : ''}
</div>
<div class="stamp">POP-UP<br>PAGE<br>№ 01</div>
<script>
  // a long title or subtitle shrinks until it clears the postmark
  document.fonts.ready.then(() => { const t = document.querySelector('.title'), sm = t.querySelector('small'), gap = document.querySelector('.stamp').getBoundingClientRect().left - 24;
    for (let k = 1; t.getBoundingClientRect().right > gap && k > .5; ) { k -= .04; t.style.fontSize = 58 * k + 'px'; sm.style.fontSize = 24 * k + 'px'; } });
</script>
</body></html>`;

/* ---------- print: photo above a torn edge, the pop-up re-inked in two colours below ---------- */
const PAPER = '#f1e9d8', SCF = '"Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif';
const PH = Math.round(H * .46), POPY = PH + 108, POPH = H - POPY - 92;
// the torn edge: a ragged line just above the bottom of the photo, with a pale fringe of torn fibres behind it
const tearLine = (() => { let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647, pts = [];
  for (let x = 0; x <= W + 8; x += 7) pts.push([x, 52 + 16 * Math.sin(x / 170 + 1) + 9 * Math.sin(x / 53) + (rnd() - .5) * 9]);
  return pts; })();
const tearPath = dy => `M0,140 L${tearLine.map(([x, y]) => `${x},${(y + dy).toFixed(1)}`).join(' L')} L${W + 8},140 Z`;
const [city = '', country = ''] = (meta.stamp || meta.place).split(/\s*[|,]\s*/).map(t => t.toUpperCase());
const stamp = (cool) => `<svg class="stamp" viewBox="0 0 300 190" width="300" height="190"><g fill="none" stroke="${cool}" opacity=".88">
  <defs><path id="arcT" d="M30,95 A65,65 0 0 1 160,95"/><path id="arcB" d="M22,95 A73,73 0 0 0 168,95"/></defs>
  <circle cx="95" cy="95" r="82" stroke-width="4"/><circle cx="95" cy="95" r="56" stroke-width="1.6"/>
  ${[0, 1, 2, 3].map(k => `<path d="M178,${62 + k * 22} q14,-9 28,0 t28,0 t28,0 t28,0" stroke-width="3"/>`).join('')}</g>
  <g fill="${cool}" opacity=".88" font-family="Courier Prime, Courier New, monospace" font-weight="700">
  <text font-size="${Math.min(22, 250 / (city.length + 2)).toFixed(1)}" letter-spacing="2"><textPath href="#arcT" startOffset="50%" text-anchor="middle">${esc(city)}</textPath></text>
  <text font-size="${Math.min(18, 270 / (country.length + 2)).toFixed(1)}" letter-spacing="2"><textPath href="#arcB" startOffset="50%" text-anchor="middle" side="right">${esc(country)}</textPath></text>
  <text x="95" y="102" font-size="20" text-anchor="middle">★</text></g></svg>`;
const printHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Noto+Serif+SC:wght@400&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${PAPER}; position: relative; font-family: "Courier Prime", "Courier New", monospace; color: #2f3540; }
  .photo { position: absolute; left: 0; top: 0; width: ${W}px; height: ${PH}px; overflow: hidden; }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: ${esc(meta.focus)}; display: block; }
  .credit { position: absolute; right: 18px; top: 14px; font: 400 12px "Courier Prime", monospace; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.7); }
  .tear { position: absolute; left: 0; top: ${PH - 90}px; }
  .title { position: absolute; left: 52px; top: ${PH + 44}px; font: 400 30px "Courier Prime", "Courier New", monospace; letter-spacing: .05em; white-space: nowrap; }
  .stamp { position: absolute; right: 18px; top: ${PH - 112}px; transform: rotate(-10deg); }
  #pop { position: absolute; left: 0; top: ${POPY}px; width: ${W}px; height: ${POPH}px; -webkit-mask-image: linear-gradient(transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(transparent, #000 6%, #000 94%, transparent); }
  .row { position: absolute; left: 52px; right: 52px; bottom: 44px; display: flex; justify-content: space-between; font: 400 17px "Courier Prime", monospace; letter-spacing: .06em; }
  .ai { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; font: 400 12px ${SCF}; color: #958b7a; letter-spacing: .1em; }
  #grain { position: absolute; inset: 0; width: ${W}px; height: ${H}px; mix-blend-mode: multiply; opacity: .35; pointer-events: none; }
</style></head><body>
<div class="photo"><img src="${photo}"></div>
${meta.credit ? `<div class="credit">${esc(meta.credit)}</div>` : ''}
<svg class="tear" width="${W}" height="140" viewBox="0 0 ${W} 140"><defs><filter id="sh"><feDropShadow dx="0" dy="-1.5" stdDeviation="2" flood-opacity=".28"/></filter></defs>
  <path d="${tearPath(-7)}" fill="#fbf8f0" filter="url(#sh)"/><path d="${tearPath(0)}" fill="${PAPER}"/></svg>
<div class="title">${esc(meta.heading || meta.title)}</div>
<canvas id="pop"></canvas>
<div class="row"><span>PLACE · ${esc(meta.place)}</span>${meta.date ? `<span>DATE · ${esc(meta.date)}</span>` : ''}</div>
<div class="ai">立体页由 AI 辅助绘制</div>
<canvas id="grain"></canvas>
<div id="stampSlot"></div>
<script>
const W = ${W}, POPH = ${POPH}, PAPER = [${PAPER.match(/\w\w/g).map(h => parseInt(h, 16))}];
const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
const hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; };
const rgb = ([h, s, l]) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; };
(async () => {
  const [ph, pop] = await Promise.all([load(${JSON.stringify(photo)}), load(${JSON.stringify(popup)})]);
  // two inks from the photo: the average warm colour (sunlight, stone, brick) and the average cool one (sky, water,
  // shadow), each pushed to a printable strength: a light peachy warm and a mid slate cool
  let warm = ${JSON.stringify(meta.warm)}, cool = ${JSON.stringify(meta.cool)};
  if (!warm || !cool) {
    const s = document.createElement('canvas'); s.width = s.height = 64; const sg = s.getContext('2d'); sg.drawImage(ph, 0, 0, 64, 64);
    const px = sg.getImageData(0, 0, 64, 64).data, acc = {w: [0, 0, 0, 0], c: [0, 0, 0, 0]};
    for (let i = 0; i < px.length; i += 4) { const c = [px[i], px[i + 1], px[i + 2]], [h, sa, l] = hsl(c);
      const k = h >= 8 && h <= 58 && sa > .25 && l > .35 && l < .9 ? 'w' : h >= 185 && h <= 245 && sa > .12 && l > .2 && l < .8 ? 'c' : null;
      if (k) { const a = acc[k], wt = sa; a[0] += c[0] * wt; a[1] += c[1] * wt; a[2] += c[2] * wt; a[3] += wt; } }
    const avg = a => a[3] > 1 ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : null;
    const W0 = avg(acc.w), C0 = avg(acc.c);
    if (!warm) { const [h, sa] = W0 ? hsl(W0) : [28, .8]; warm = hex(rgb([h, Math.max(.75, sa), .7])); }
    if (!cool) { const [h, sa] = C0 ? hsl(C0) : [212, .3]; cool = hex(rgb([h, Math.min(.42, Math.max(.25, sa)), .4])); }
  }
  document.getElementById('stampSlot').outerHTML = ${JSON.stringify(stamp('__COOL__'))}.replaceAll('__COOL__', cool);
  const c = document.getElementById('pop'), S = 2; c.width = W * S; c.height = POPH * S; const g = c.getContext('2d');
  // the low camera leaves empty desk above and below the book: zoom in a little and put the book's middle (about 45%
  // down the render) at the middle of the band
  const k = Math.max(c.width / pop.width, c.height / pop.height) * 1.16, dw = pop.width * k, dh = pop.height * k;
  g.drawImage(pop, (c.width - dw) / 2, c.height * .46 - dh * .47, dw, dh);
  // balance the paper desk to the card's paper (a per-channel gain), so the pop-up sits on the same sheet; the pieces
  // keep their own colours
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data, i0 = 4 * (8 * c.width + 8), gain = [0, 1, 2].map(j => PAPER[j] / Math.max(1, d[i0 + j]));
  for (let i = 0; i < d.length; i += 4) for (let j = 0; j < 3; j++) d[i + j] = Math.min(255, d[i + j] * gain[j]);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.putImageData(im, 0, 0);
  // paper grain over the whole card
  const gr = document.getElementById('grain'); gr.width = W; gr.height = ${H}; const gg = gr.getContext('2d'), gi = gg.createImageData(W, ${H});
  for (let i = 0; i < gi.data.length; i += 4) { const v = 225 + rnd() * 30; gi.data[i] = v; gi.data[i + 1] = v * .98; gi.data[i + 2] = v * .94; gi.data[i + 3] = 255; }
  gg.putImageData(gi, 0, 0);
  await document.fonts.ready;
  const t = document.querySelector('.title'), stampEl = document.querySelector('.stamp');
  for (let f = 30; t.getBoundingClientRect().right > stampEl.getBoundingClientRect().left - 16 && f > 18; f -= 1) t.style.fontSize = f + 'px';
  window.__inks = {warm, cool}; window.__done = true;
})();
</script>
</body></html>`;

const html = style === 'classic' ? classicHtml() : printHtml();

let chromium;
try { ({chromium} = createRequire(import.meta.url)('playwright')); } catch { ({chromium} = await import('playwright')); }
const browser = await chromium.launch();
const p = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 2});
await p.setContent(html, {waitUntil: 'networkidle'}).catch(() => {});
if (style !== 'classic') { await p.waitForFunction(() => window.__done, null, {timeout: 120000}); console.log(`inks: ${JSON.stringify(await p.evaluate(() => window.__inks))}`); }
const font = await p.evaluate(fontCheck); if (font !== 'web') console.warn(fontNote(font));
if (font === 'none' && !opts.force) { await browser.close(); console.error('Stopped: no Chinese font (pass --force to compose anyway).'); process.exit(1); }
await p.screenshot({path: out});
await browser.close();
console.log(`saved ${path.relative(process.cwd(), out)} (${W * 2}×${H * 2})`);
