/* Page layout「河岸地标」(river landmark): the structure and the mechanism of the Westminster and Tower Bridge pages,
   with the city-specific drawings left as slots. A page fills the slots and gets the whole page:
     export default await riverLandmark({title, subtitle, place, backdrop, hero, traveller, ground, memory, …});
   Slots (what photo each needs: templates/river-landmark/SLOTS.md):
     backdrop   背景    far V-fold across the gutter, Z -58, art 192 × 30 (two wings of 96)
     hero       主建筑  facade: a V-fold across the gutter, Z -36, art 144 × 42 (wings of 72), and/or
                        tower:  a stand at X ±56, Z -22, art w × h (w 8–16, h ≤ 62), with a riveted dial (clock face or wheel)
     traveller  人物    the traveller's colours (hair, top, legs, bag), never a face
     ground     底面    the floor's colours: grass on the far bank, the river, the near bank
     memory     记忆卡  the real photo, in a Polaroid (1:1) or a postcard (3:2) that turns over
   The one mechanism: turn the dial (on the tower, or a winch on the embankment when there is no tower). Time runs on,
   the light changes, the boat crosses the river, and at the end of the evening the lights come on. Reversible. */
import {INK, RED, GOLD, rng, rand, wc, art, grain, lg, cloud, traveller as drawTraveller} from '../engine/paper-art.js';
import {fx, fz, floor, pageBg, plateBox, plateTexts, mirror, smoothstep, clamp01, loadPhoto, postcard, station, simpleCover, SC} from '../engine/kit.js';

// where everything goes (flat-world units; the spine is X 0, the reader's edge Z +65)
export const RIVER = {
  backdrop: {Z: -58, w: 192, h: 30},
  facade: {Z: -36, w: 144, h: 42},
  tower: {X: 56, Z: -22, maxW: 16, maxH: 62},
  river: {far: -20, near: 19},                      // the river's banks (floor)
  boat: {X0: -78, X1: 78, Z: 2},
  rail: {Z: 21},
  winch: {X: -34, Z: 38},
  me: {X: 38, Z: 38},
  station: {X: -24, Z: 31},
  memory: {X: 70, Z: 52},
};
const LOOK = {hair: '#211d21', knit: '#5b86d6', knitD: '#3f66b5', skin: '#f2d2b6', long: true, shades: true, legs: '#2b3140', pack: '#b5523f'};

/* ---------- placeholders: what a slot looks like until it is drawn (labels: true writes the slot's name on it) ---------- */
const tag = (x, y, w, lines) => `<rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="${lines.length * 30 + 20}" rx="8" fill="#fffaf0" stroke="${RED}" stroke-width="3" stroke-dasharray="10 6"/>
  ${lines.map((t, i) => `<text x="${x}" y="${y + 8 + i * 30}" text-anchor="middle" font-size="${i ? 18 : 24}" fill="${i ? INK : RED}" font-family="Noto Serif SC, Songti SC, serif">${t}</text>`).join('')}`;
const defaultBackdrop = (labels) => lit => art(192, 30, lit ? (() => { const r = rand(11); return rng(50, () => `<rect x="${r() * 1900}" y="${170 + r() * 110}" width="6" height="8" fill="#ffd27a"/>`); })()
  : `<defs>${lg('rlsky', [[0, '#9fb6d6'], [1, '#f2e2c4']])}</defs>
  <path d="M0,300 V60 Q240,10 480,50 Q760,0 960,40 Q1200,10 1440,50 Q1700,20 1920,60 V300 Z" fill="url(#rlsky)"/>${cloud(300, 90, 1.4)}${cloud(1500, 80, 1.2)}
  ${wc(rng(24, i => `<rect x="${i * 80}" y="${160 - (i % 4) * 25}" width="70" height="${140 + (i % 4) * 25}" fill="${i % 2 ? '#c9cfd8' : '#d6d9de'}"/>`), 1.3)}
  ${labels ? tag(150, 90, 250, ['背景 · V 折', '天际线', '横拍 ≥ 3:1']) + tag(1770, 90, 250, ['背景 · V 折', '天际线', '平视远眺']) : ''}`);
const defaultFacade = (labels) => lit => art(144, 42, lit ? rng(3, r => rng(29, k => (r + k) % 3 ? '' : `<rect x="${30 + k * 48}" y="${230 + r * 60}" width="14" height="30" fill="#f6cf7a"/>`))
  : `${wc(`<rect x="0" y="200" width="1440" height="220" fill="#e2cfa6"/><rect x="0" y="180" width="1440" height="24" fill="#8d8a80"/>
    ${rng(36, i => `<polygon points="${10 + i * 40},182 ${20 + i * 40},140 ${30 + i * 40},182" fill="#c7ae7c"/>`)}
    ${rng(3, r => rng(29, k => `<rect x="${30 + k * 48}" y="${230 + r * 60}" width="14" height="30" fill="#6f6250" stroke="none"/>`))}`, 1.5)}
    ${labels ? tag(720, 80, 520, ['主建筑 · 长立面（V 折）', '正面平视 · 横拍约 3:1']) : ''}`);
const defaultTower = (labels) => ({
  art: lit => art(12, 56, lit ? `<rect x="30" y="200" width="60" height="40" fill="#f6cf7a"/>`
    : `${wc(`<rect x="15" y="200" width="90" height="360" fill="#e1c27a"/><rect x="8" y="120" width="104" height="90" fill="#d9b062"/>
      <polygon points="12,122 60,20 108,122" fill="#8e8a74"/>`, 1.5)}<circle cx="60" cy="165" r="34" fill="#faf4e4" stroke="${INK}" stroke-width="2"/>
      ${labels ? ['主建筑', '塔', '立片', '', '竖拍', '1:3–1:6'].map((t, i) => `<text x="60" y="${290 + i * 30}" text-anchor="middle" font-size="${i < 3 ? 22 : 17}" fill="${i < 3 ? RED : INK}" font-family="Noto Serif SC, Songti SC, serif">${t}</text>`).join('') : ''}`),
  dialY: 56 - 16.5,
});
// a plain dial: a clock face whose hands are riveted on top (hands: true), or pass your own wheel / rose art
const clockFace = (d) => art(d, d, `<circle cx="${d * 5}" cy="${d * 5}" r="${d * 5 - 2}" fill="#faf4e4" stroke="${INK}" stroke-width="2.6"/>
  ${rng(12, i => { const a = i * Math.PI / 6, R = d * 5 - 2; return `<line x1="${d * 5 + (R - 6) * Math.cos(a)}" y1="${d * 5 + (R - 6) * Math.sin(a)}" x2="${d * 5 + (R - 2) * Math.cos(a)}" y2="${d * 5 + (R - 2) * Math.sin(a)}" stroke="${INK}" stroke-width="${i % 3 ? 1.4 : 2.6}"/>`; })}`);
const hand = (d, len, wpx) => art(1.2, d, `<path d="M6,${d * 5} L6,${d * 5 - len}" stroke="${INK}" stroke-width="${wpx}" stroke-linecap="round"/><circle cx="6" cy="${d * 5}" r="3.4" fill="${INK}"/>`);
const defaultBoat = art(26, 9, wc(`<path d="M6,56 H254 L236,84 H24 Z" fill="#f4f1ea"/><rect x="6" y="60" width="248" height="7" fill="${RED}" stroke="none"/>
  <rect x="40" y="26" width="170" height="32" rx="6" fill="#eef0f2"/>${rng(9, i => `<rect x="${50 + i * 17.5}" y="34" width="12" height="14" rx="2" fill="#6f8ea6" stroke-width="1"/>`)}`, 1.4));
const boatLit = art(26, 9, rng(9, i => `<rect x="${50 + i * 17.5}" y="34" width="12" height="14" rx="2" fill="#ffd77e"/>`));
const railArt = art(96, 12, wc(`<rect x="0" y="104" width="960" height="16" fill="#cfc6b4"/><path d="M0,74 H960 M0,96 H960" stroke="#24272b" stroke-width="3"/>
  ${rng(64, i => `<path d="M${8 + i * 15},72 V104" stroke="#24272b" stroke-width="2"/>`)}${rng(5, i => `<rect x="${i * 236}" y="62" width="20" height="44" fill="#d8d0bf"/>`)}`, 1.4));
const winchPost = art(10, 11, `${wc(`<rect x="22" y="40" width="56" height="70" fill="#2f4a3a"/><rect x="16" y="102" width="68" height="8" fill="#1f3328"/><rect x="30" y="52" width="40" height="22" fill="#d8a93b"/>`, 1.4)}
  <text x="50" y="68" text-anchor="middle" font-size="8" fill="#2f2a1e" font-family="Georgia, serif">TURN ↻</text>`);
const winchWheel = art(10, 10, wc(`<circle cx="50" cy="50" r="44" fill="none" stroke="#3a3f47" stroke-width="7"/>
  ${rng(6, i => { const a = i * Math.PI / 3; return `<path d="M50,50 L${50 + 42 * Math.cos(a)},${50 + 42 * Math.sin(a)}" stroke="#3a3f47" stroke-width="4"/>`; })}
  <circle cx="50" cy="50" r="9" fill="#d8a93b"/><circle cx="50" cy="8" r="7" fill="${RED}"/>`, 1.4));

/* ---------- the near bank: a promenade printed on the page, and a few things standing on it ---------- */
// The bank is the page's foreground, so it is drawn as a whole picture rather than left as plain paper: stone flags in
// two tints, a flower bed along the railing, a darker footpath, a bench, planters and a bicycle standing on it.
const promenade = (L, gr) => { const r = rand(43), top = fz(L.river.near) + 14, out = [];
  for (let y = top; y < 1300; y += 40) for (let x = (y / 40 % 2) * 30; x < 2000; x += 60) out.push(`<rect x="${x + 2}" y="${y + 2}" width="56" height="36" fill="${r() < .5 ? gr.bank : gr.bankLine}" opacity="${.55 + r() * .45}"/>`);
  const bed = fz(L.river.near + 2.5), path = fz(L.river.near + 10);
  return `${out.join('')}
    <rect x="0" y="${bed}" width="2000" height="34" fill="${gr.bed || gr.grass}"/>${rng(90, () => `<circle cx="${r() * 2000}" cy="${bed + 6 + r() * 22}" r="${4 + r() * 4}" fill="${['#e8a33d', '#d9584a', '#f0d36a', '#f4efe2', '#b9629a'][Math.floor(r() * 5)]}"/>`)}
    <rect x="0" y="${path}" width="2000" height="70" fill="${gr.path}" opacity=".8"/>${rng(40, i => `<path d="M${i * 50},${path + 35} h26" stroke="${gr.bank}" stroke-width="3" opacity=".7"/>`)}`; };
const bench = art(16, 8, wc(`<rect x="10" y="28" width="140" height="12" fill="#6f4e35"/><rect x="10" y="44" width="140" height="10" fill="#6f4e35"/>
  <rect x="10" y="58" width="140" height="10" fill="#7d5a3e"/><path d="M22,30 V78 M138,30 V78" stroke="#2b2b2e" stroke-width="6"/><path d="M14,64 H146" stroke="#2b2b2e" stroke-width="4"/>`, 1.4));
const planter = (c1, c2) => art(10, 8, wc(`<path d="M18,44 H82 L76,78 H24 Z" fill="#8a8378"/><rect x="14" y="40" width="72" height="8" fill="#a39b8c"/>
  ${rng(7, i => `<circle cx="${24 + i * 9}" cy="${32 - (i % 2) * 8}" r="9" fill="${i % 2 ? c1 : '#6f8a3a'}"/>`)}${rng(5, i => `<circle cx="${28 + i * 11}" cy="${22 + (i % 2) * 10}" r="4" fill="${c2}"/>`)}`, 1.3));
const bicycle = art(14, 8, wc(`<circle cx="30" cy="56" r="20" fill="none" stroke="#2b2b2e" stroke-width="4"/><circle cx="110" cy="56" r="20" fill="none" stroke="#2b2b2e" stroke-width="4"/>
  <path d="M30,56 L58,24 H96 L110,56 M58,24 L70,56 L96,24 M70,56 H30 M52,16 H66 M96,24 L92,12 H104" fill="none" stroke="#2f5a7a" stroke-width="4"/><path d="M30,36 l10,-8 h16 v8 Z" fill="#c9a24a"/>`, 1.3));

/* ---------- the memory card: the real photo, in a Polaroid (1:1) or on a postcard (3:2) ---------- */
const memoryArts = (src, kind, caption, back, labels) => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const img = (x, y, w, h) => src ? `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#d8dde2"/>${labels ? `<text x="${x + w / 2}" y="${y + h / 2 - 4}" text-anchor="middle" font-size="13" fill="${RED}" font-family="Noto Serif SC, Songti SC, serif">记忆卡</text><text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="11" fill="${INK}" font-family="Noto Serif SC, Songti SC, serif">真实照片 ${kind === 'postcard' ? '3:2' : '1:1'}</text>` : ''}`;
  const backArt = (w, h) => art(w, h, `<rect x="2" y="2" width="${w * 10 - 4}" height="${h * 10 - 4}" fill="#fbf6ea" stroke="#d8cfbd" stroke-width="2"/>
    ${back.map((t, i) => `<text x="14" y="${30 + i * 20}" font-size="12" fill="#3f4f6b" font-family="Noto Serif SC, Songti SC, serif">${esc(t)}</text>`).join('')}`);
  if (kind === 'postcard') return {w: 20, h: 13, front: art(20, 13, `<rect x="2" y="2" width="196" height="126" rx="4" fill="#fbf8f1" stroke="#d8cfbd" stroke-width="2"/>${img(8, 8, 184, 114)}
    <text x="100" y="118" text-anchor="middle" font-size="11" letter-spacing="1" fill="#fbf6ea" font-family="Georgia, serif" font-style="italic">${esc(caption)}</text>`), back: backArt(20, 13)};
  return {w: 10, h: 11.5, front: art(10, 11.5, `<rect x="2" y="2" width="96" height="111" fill="#fbf8f1" stroke="#d8cfbd" stroke-width="2"/>${img(8, 8, 84, 84)}
    <text x="50" y="106" text-anchor="middle" font-size="9" fill="#5b4a3a" font-family="Georgia, serif" font-style="italic">${esc(caption)}</text>`), back: backArt(10, 11.5)};
};

/* ---------- the page ---------- */
// a slot that should give art(w, h, svg) but gave a string (or nothing) would only show up as a render that never
// finishes, so say so straight away
const isArt = (name, a) => { if (!a || typeof a.svg !== 'string') throw new Error(`river-landmark: ${name} must be art(w, h, svg), got ${typeof a === 'string' ? 'a string (wrap it in art(...))' : String(a)}`); return a; };
export async function riverLandmark(o) {
  const L = RIVER, labels = !!o.labels;
  if (o.backdrop) { isArt('backdrop(false)', o.backdrop(false)); isArt('backdrop(true)', o.backdrop(true)); }
  if (o.hero?.facade) { isArt('hero.facade(false)', o.hero.facade(false)); isArt('hero.facade(true)', o.hero.facade(true)); }
  if (o.hero?.tower) isArt('hero.tower.art(false)', o.hero.tower.art(false));
  if (o.boat) isArt('boat.art', o.boat.art);
  const backdrop = o.backdrop || defaultBackdrop(labels);
  const hero = o.hero || {facade: defaultFacade(labels), tower: defaultTower(labels)};
  const tower = hero.tower, tw = tower && tower.art(false), side = tower && tower.side === 'left' ? -1 : 1, TX = side * L.tower.X;
  const gr = {grass: '#a9bf86', grassD: '#8fa874', river: '#7f9fb3', bank: '#e3dccd', bankLine: '#cbc2b0', path: '#cfc3ad', ...o.ground};
  const look = {...LOOK, ...(o.traveller && o.traveller.look)};
  const mem = o.memory || {};
  const memSrc = mem.photo ? await loadPhoto(mem.photo) : null;
  const M = memoryArts(memSrc, mem.kind, mem.caption || '', mem.back || [], labels);
  // the clock: the dial's hands run from clock[0] to clock[1] (minutes after midnight); the light follows lights[]
  const clock = o.clock || [15 * 60, 19 * 60], hours = (clock[1] - clock[0]) / 60, lights = o.lights || ['afternoon', 'golden', 'evening'];
  const dial = tower && (tower.dial || {d: 6.6, hands: true}), dialY = tower && (tower.dialY ?? tw.h * .7);
  const turn = dial && dial.hands ? deg => deg / 360 / hours : deg => deg / 720;   // a clock: one turn = one hour; a wheel or winch: two turns in all
  const dialId = tower ? 'dial' : 'winch';

  const pieces = [
    {id: 'backdrop', type: 'v', Z: L.backdrop.Z, sigma: -3, wl: 96, wr: 96, art: backdrop(false), artLit: backdrop(true), driver: '背景：开书时两条粘贴线拉开，V 折立起'},
  ];
  if (hero.facade) pieces.push({id: 'facade', type: 'v', Z: L.facade.Z, sigma: -9, wl: 72, wr: 72, art: hero.facade(false), artLit: hero.facade(true),
    tap: hero.note ? (c, e) => c.note(hero.note, e) : undefined});
  if (tower) {
    pieces.push({id: 'tower', type: 'stand', X: TX, Z: L.tower.Z, art: tw, artLit: tower.art(true), tap: (c, e) => { c.bong(); c.hop('tower'); if (tower.note) c.note(tower.note, e); }});
    const d = dial.d || 6.6;
    pieces.push({id: 'dial', type: 'custom', anchor: 'center', parent: 'tower', art: dial.art || clockFace(d), ang: 0, driver: '铆在主建筑上，手指绕圈转（主机关）',
      pose: s => { const a = dial.hands ? 0 : (s.ang || 0) * Math.PI / 180; return {o: [0, dialY, .12], x: [Math.cos(a), -Math.sin(a), 0], y: [Math.sin(a), Math.cos(a), 0]}; },
      dial: (deg, c) => c.tab('time', c.tabV('time') + turn(deg)), tap: (c, e) => c.note('按住它绕圈转：时间往后走，船开过河，天色慢慢变暗；倒着转全部退回。', e)});
    if (dial.hands) for (const [id, len, wpx, z] of [['hourH', d * 2.6, 4.5, .24], ['minH', d * 4.1, 2.6, .34]])
      pieces.push({id, type: 'custom', anchor: 'center', parent: 'tower', art: hand(d, len, wpx), driver: '铆在钟面中心，随主机关转',
        pose: s => { const a = (s.ang || 0) * Math.PI / 180; return {o: [0, dialY, z], x: [Math.cos(a), -Math.sin(a), 0], y: [Math.sin(a), Math.cos(a), 0]}; }});
  } else {
    pieces.push({id: 'winchPost', type: 'stand', X: L.winch.X, Z: L.winch.Z - .5, art: winchPost});
    pieces.push({id: 'winch', type: 'custom', anchor: 'center', parent: 'winchPost', art: winchWheel, ang: 0, driver: '铆在岸边立柱上，手指绕圈转（主机关）',
      pose: s => { const a = (s.ang || 0) * Math.PI / 180; return {o: [0, 7.2, .5], x: [Math.cos(a), -Math.sin(a), 0], y: [Math.sin(a), Math.cos(a), 0]}; },
      dial: (deg, c) => c.tab('time', c.tabV('time') + turn(deg)), tap: (c, e) => c.note('按住绞盘绕圈转：时间往后走，船开过河；倒着转退回。', e)});
  }
  const boat = o.boat || {art: defaultBoat, artLit: boatLit};
  pieces.push({id: 'boat', type: 'stand', X: L.boat.X0, Z: L.boat.Z, w: boat.w, h: boat.h, art: boat.art, artLit: boat.artLit, noCrease: true, ease: 4, driver: '主机关带动：底边在河上的槽里滑'},
    {id: 'railL', type: 'stand', X: -50, Z: L.rail.Z, art: railArt}, {id: 'railR', type: 'stand', X: 50, Z: L.rail.Z, art: mirror(railArt)});
  if (o.station) pieces.push({...station(L.station.X, L.station.Z, o.station.name, o.station.time ?? ''), })
  const t = o.traveller || {};
  pieces.push({id: 'me', type: 'stand', X: L.me.X, Z: L.me.Z, w: 10, h: 17.5, art: drawTraveller(t.pose || 'camera', look), tap: (c, e) => { c.hop('me'); if (t.line) c.note(t.line, e); }});
  pieces.push(postcard({id: 'memory', X: L.memory.X, Z: L.memory.Z, w: M.w, h: M.h, front: M.front, back: M.back, note: mem.note}));
  // the promenade's furniture (foreground: false leaves the bank empty)
  if (o.foreground !== false) pieces.push(
    {id: 'bench', type: 'stand', X: 12, Z: 46, art: bench},
    {id: 'planterL', type: 'stand', X: -22, Z: 54, art: planter('#e8a33d', '#d9584a')},
    {id: 'planterR', type: 'stand', X: 24, Z: 54, art: planter('#b9629a', '#f0d36a')},
    {id: 'bike', type: 'stand', X: 90, Z: 34, art: bicycle});
  pieces.push(...(o.extras || []));

  const ripples = (() => { const r = rand(31); return rng(110, () => { const x = r() * 1960, y = fz(L.river.far + 2) + r() * (fz(L.river.near) - fz(L.river.far) - 40); return `<path d="M${x},${y} q10,-7 20,0 q10,-7 20,0" fill="none" stroke="#e4ecef" stroke-width="2.4" opacity=".75"/>`; }); })();
  const spread = {
    eyebrow: o.place.eyebrow, title: o.place.zhTitle || o.place.zh, en: o.place.sub, light: lights[0], lit: 0,
    story: o.story || '', todo: o.todo || ['按住主建筑上的转盘（或岸边的绞盘）绕圈转：时间往后走，船开过河，天色慢慢变暗，最后亮灯；倒着转全部退回。', '点右下角的记忆卡，它会翻个面。'],
    floor: floor(`${pageBg()}
      <rect x="0" y="0" width="2000" height="${fz(L.river.far)}" fill="${gr.grass}"/>
      ${rng(40, i => `<circle cx="${i * 52 + 10}" cy="${60 + (i % 3) * 30}" r="${36 + (i % 4) * 8}" fill="${i % 2 ? gr.grassD : gr.grass}"/>`)}
      <rect x="0" y="${fz(L.river.far)}" width="2000" height="${fz(L.river.near) - fz(L.river.far)}" fill="${gr.river}"/>${ripples}
      <path d="M${fx(L.boat.X0)},${fz(L.boat.Z) + 8} H${fx(L.boat.X1)}" stroke="#4d5a72" stroke-width="4" opacity=".7"/>
      <rect x="0" y="${fz(L.river.near)}" width="2000" height="14" fill="#d1c8b4"/>
      <rect x="0" y="${fz(L.river.near) + 14}" width="2000" height="${1300 - fz(L.river.near)}" fill="${gr.bank}"/>
      ${promenade(L, gr)}
      ${plateBox}${grain(2000, 1300, .3)}`),
    texts: [...plateTexts(o.place.en, o.place.sub, o.place.zh),
      ...(labels ? [{x: fx(0), y: fz(-8), text: '底面：草地 · 河 · 河岸（取颜色和纹理）', font: `600 30px ${SC}`, color: RED, align: 'center'},
        {x: fx(L.me.X), y: fz(L.me.Z + 7), text: '人物：全身照，只取配色', font: `600 24px ${SC}`, color: RED, align: 'center'},
        {x: fx(L.memory.X), y: fz(L.memory.Z - 8), text: '记忆卡：真实照片', font: `600 24px ${SC}`, color: RED, align: 'center'}] : [])],
    pieces,
    controls: [{id: 'time', hidden: true, X: L.boat.X0, Z: L.boat.Z, dir: [1, 0, 0], len: L.boat.X1 - L.boat.X0, init: 0, apply: (v, c) => {
      const min = clock[0] + v * (clock[1] - clock[0]), hr = Math.floor(min / 60 + 1e-6), clk = c.get(dialId);
      if (tower && dial.hands) { c.set('hourH', {ang: (min / 60 % 12) * 30}); c.set('minH', {ang: (min % 60) * 6}); }
      else c.set(dialId, {ang: v * 720});
      const n = lights.length - 1, k = Math.min(n - 1, Math.floor(v * n)); c.light(lights[k], lights[k + 1], clamp01(v * n - k));
      c.set('boat', {X: L.boat.X0 + smoothstep(v) * (L.boat.X1 - L.boat.X0)});
      c.lights(v > .85 ? 1 : 0);
      if (tower && dial.hands && clk.hr !== undefined && hr > clk.hr) { c.bong(); c.hop('tower'); }
      clk.hr = hr;
    }}],
  };
  return {
    title: o.title, subtitle: o.subtitle, cover: simpleCover(o.title, (o.subtitle || '').toUpperCase()), spread,
    shot: {lights: o.shot?.lights ?? 0, pulls: {time: o.shot?.time ?? 0}, open: [], view: o.shot?.view || {az: 0, pol: 70, r: 1, target: [0, .12, 0]}},
    card: o.card,
  };
}
