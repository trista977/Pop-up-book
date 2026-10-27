#!/usr/bin/env node
/* The engine in engine/ comes from paper-city-popup (github.com/trista977/paper-city-popup). Don't edit it here: change
   it upstream, then copy it across with this script, which records which commit it came from in engine/ENGINE.json.
     node scripts/sync-engine.mjs                       from GitHub, branch main
     node scripts/sync-engine.mjs --ref <commit|tag>    from GitHub, a given commit or tag
     node scripts/sync-engine.mjs --from ../paper-city-popup    from a local checkout
     node scripts/sync-engine.mjs --check               verify engine/ still matches ENGINE.json (exit 1 if edited) */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'trista977/paper-city-popup';
// upstream path → path under engine/
const FILES = {'books/book3d.js': 'book3d.js', 'books/paper-art.js': 'paper-art.js', 'books/paper-check.js': 'paper-check.js',
  'vendor/three/three.module.min.js': 'vendor/three/three.module.min.js', 'vendor/three/LICENSE': 'vendor/three/LICENSE'};
const sha = buf => createHash('sha256').update(buf).digest('hex');
const opt = k => { const i = process.argv.indexOf(`--${k}`); return i < 0 ? null : process.argv[i + 1] ?? true; };
const manifestPath = path.join(ROOT, 'engine/ENGINE.json');

if (opt('check')) {
  const m = JSON.parse(await readFile(manifestPath, 'utf8')), changed = [];
  for (const [file, want] of Object.entries(m.files)) { const have = sha(await readFile(path.join(ROOT, 'engine', file)).catch(() => Buffer.alloc(0))); if (have !== want) changed.push(file); }
  if (changed.length) { console.log(`engine/ differs from ${m.source}@${m.commit.slice(0, 7)}: ${changed.join(', ')}\nChange the engine upstream and run  node scripts/sync-engine.mjs`); process.exit(1); }
  console.log(`engine/ matches ${m.source}@${m.commit.slice(0, 7)} (synced ${m.synced})`); process.exit(0);
}

let read, commit, source;
if (opt('from')) {
  const dir = path.resolve(opt('from'));
  commit = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
  const dirty = execFileSync('git', ['-C', dir, 'status', '--porcelain', '--', ...Object.keys(FILES)], {encoding: 'utf8'}).trim();
  if (dirty) { console.error(`${dir} has uncommitted engine changes; commit them first so the version can be recorded.\n${dirty}`); process.exit(1); }
  read = f => readFile(path.join(dir, f)); source = `github.com/${REPO}`;
} else {
  const ref = opt('ref') || 'main';
  const res = await fetch(`https://api.github.com/repos/${REPO}/commits/${ref}`, {headers: {accept: 'application/vnd.github+json'}});
  if (!res.ok) { console.error(`Couldn't resolve ${REPO}@${ref}: ${res.status}`); process.exit(1); }
  commit = (await res.json()).sha; source = `github.com/${REPO}`;
  read = async f => { const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${commit}/${f}`); if (!r.ok) throw new Error(`${f}: ${r.status}`); return Buffer.from(await r.arrayBuffer()); };
}
const files = {};
for (const [from, to] of Object.entries(FILES)) {
  const buf = await read(from), out = path.join(ROOT, 'engine', to);
  await mkdir(path.dirname(out), {recursive: true}); await writeFile(out, buf); files[to] = sha(buf);
}
await writeFile(manifestPath, JSON.stringify({source, commit, synced: new Date().toISOString().slice(0, 10), files}, null, 2) + '\n');
console.log(`engine/ synced from ${source}@${commit.slice(0, 7)} (${Object.keys(files).length} files)`);
