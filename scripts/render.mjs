#!/usr/bin/env node
/* Check a pop-up page and render it as a still.
     node scripts/render.mjs <page folder> [--out popup.png] [--size 1600x900] [--view az,pol,r] [--force] [--serve] [--desk wood]
   --desk: 'paper' (default: a plain paper desk for the print-style share card) or 'wood' (the book's wooden desk).
   The page folder can be anywhere (for example ./popup-pages/<slug> in the user's own folder): it is served to the
   viewer at /page/, so its imports of ../../engine/… still resolve to this skill's engine.
   1. Paper check: every piece must fold flat inside the closed book, stay on its own page, and be attached to something
      (engine/paper-check.js). Any issue stops the render unless --force.
   2. Opens viewer/page.html with the page, applies the page's `shot` (lights, pull-tabs, camera) and saves a PNG
      (default <page dir>/popup.png) at 2× pixel density.
   --serve: skip the render, keep the viewer running and print its address, to turn the page round and play with it.
   Needs Playwright with Chromium: run `npm install && npm run setup` once in the skill folder. */
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fontCheck, fontNote} from './fonts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// flags with a value: --out --size --view; switches: --force
const VALUED = new Set(['out', 'size', 'view', 'desk', 'settle']), opts = {}, pos = [];
for (let a = process.argv.slice(2), i = 0; i < a.length; i++) {
  if (!a[i].startsWith('--')) pos.push(a[i]);
  else { const k = a[i].slice(2); opts[k] = VALUED.has(k) ? a[++i] : true; }
}
const flag = (k, d) => opts[k] ?? d;
if (!pos[0]) { console.error('usage: node scripts/render.mjs <page folder> [--out popup.png] [--size 1600x900] [--view az,pol,r] [--force] [--serve]'); process.exit(2); }
const pageDir = path.resolve(pos[0]);
try { if (!(await stat(path.join(pageDir, 'page.js'))).isFile()) throw 0; } catch { console.error(`No page.js in ${pageDir}`); process.exit(2); }
const pageUrl = '/page/page.js';
const out = path.resolve(pageDir, flag('out', 'popup.png'));
const [W, H] = String(flag('size', '1600x900')).split('x').map(Number);

// a tiny static server, reachable from this machine only: the skill folder at /, the page folder at /page/
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'};
const server = createServer(async (req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname), [dir, rel] = u.startsWith('/page/') ? [pageDir, u.slice(6)] : [ROOT, u];
  const p = path.join(dir, rel);
  try { if (!p.startsWith(dir + path.sep) || !(await stat(p)).isFile()) throw 0; res.writeHead(200, {'content-type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream'}); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/viewer/page.html`;
if (flag('serve')) { console.log(`viewer: ${base}?page=${encodeURIComponent(pageUrl)}   (Ctrl+C to stop)`); await new Promise(() => {}); }

let chromium;
try { ({chromium} = createRequire(import.meta.url)('playwright')); }
catch { ({chromium} = await import('playwright')); }
// the engine must be the synced upstream version (scripts/sync-engine.mjs); warn if someone edited it here
try { const {execFileSync} = await import('node:child_process'); execFileSync(process.execPath, [path.join(ROOT, 'scripts/sync-engine.mjs'), '--check'], {stdio: 'pipe'}); }
catch (e) { console.warn(`warning: ${String(e.stdout || e.message).trim()}`); }
const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const fail = async (msg, code = 1) => { console.error(msg); await browser.close(); server.close(); process.exit(code); };

// 1 · paper check
{
  const p = await browser.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base);
  const rows = await p.evaluate(async url => {
    const {paperCheck} = await import('../engine/paper-check.js');
    const page = (await import(url)).default;
    return paperCheck({spreads: [page.spread]});
  }, pageUrl).catch(e => fail(`The page module failed to load: ${e.message}`));
  if (errs.length) await fail(`The page module threw: ${errs.join('\n')}`);
  const bad = rows.filter(r => r.issues.length);
  console.log(`paper check: ${rows.length} pieces, ${bad.length} with issues`);
  for (const r of bad) console.log(`  ${r.id.padEnd(12)} ${r.type.padEnd(7)} ${r.issues.join(' | ')}`);
  if (bad.length && !flag('force')) await fail('Fix these (or pass --force to render anyway).');
  await p.close();
}

// 2 · the still
{
  // Speed: software WebGL redraws the live canvas every frame, so the page runs in a small window (big enough that the
  // engine keeps full-quality textures) with reduced motion (the cover opens at once), and the still is one frame of the
  // final size from reader.snapshot. About 20 s instead of 100.
  const p = await browser.newPage({viewport: {width: 1067, height: 600}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const view = flag('view') ? `&view=${flag('view')}` : '';
  await p.goto(`${base}?page=${encodeURIComponent(pageUrl)}&shot=1${view}&desk=${flag('desk', 'paper')}&settle=${flag('settle', 1200)}&snap=${Math.round(W * 1.35)}x${Math.round(H * 1.35)}`);
  await p.waitForFunction(() => window.__ready || window.__error, null, {timeout: 180000});
  const err = await p.evaluate(() => window.__error);
  if (err) await fail(`The page failed to open:\n${err}`);
  const font = await p.evaluate(fontCheck); if (font !== 'web') console.warn(fontNote(font));
  if (font === 'none' && !flag('force')) await fail('Stopped: no Chinese font (pass --force to render anyway).');
  const {writeFile} = await import('node:fs/promises');
  await writeFile(out, Buffer.from((await p.evaluate(() => window.__png)).split(',')[1], 'base64'));
  console.log(`saved ${path.relative(process.cwd(), out)} (${Math.round(W * 1.35)}×${Math.round(H * 1.35)})${errs.length ? `\nconsole errors:\n  ${errs.join('\n  ')}` : ''}`);
}
await browser.close(); server.close();
