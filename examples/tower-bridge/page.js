/* Example page: Tower Bridge at night, drawn from photo.jpg (the user's own photo, 19:50: the bridge lit white along its
   towers, walkway and chains, the underside of the walkway blue, a street lamp on the embankment).
   One spread of a horizontally opening 3D pop-up book, ported from "Memory in London" (paper-city-popup, spread 4),
   the reference page for this skill. What to learn from it:
   - the whole bridge (both towers, the high walkway, both chain spans) is printed on ONE V-fold sheet across the
     gutter, so it can't come apart as the book closes; it is cut away below the walkway so the ship can pass
   - the towers get their depth from fins slotted through the sheet (cross-slots that fold flat along the slot)
   - each bascule is hinged to the sheet at its tower's inner face (`parent: 'bridge', parentPart: 0 | 1`)
   - one mechanism runs the page: the winch on the embankment. Turning it raises the bascules, rocks the waves in their
     slots, brings the ship through under the bridge and switches on the night lights; turning it back undoes it all
   - night: a dark floor, and every piece has an `artLit` layer with only the things that glow */
import {INK, RED, GOLD, rng, rand, wc, art, grain} from '../../engine/paper-art.js';
import {fx, fz, floor, pageBg, plateBox, plateTexts, smoothstep, volvelle, me, station, simpleCover} from '../../engine/kit.js';

const STONE_N = '#7f8ba0';
const nightSkyline = lit => art(192, 30, (() => {
  const r = rand(91); let x = 0, s = '', w = '';
  while (x < 1920) { const bw = 40 + r() * 80, bh = 60 + r() * 150; s += `<rect x="${x}" y="${300 - bh}" width="${bw}" height="${bh}" fill="${r() < .5 ? '#2d3d5c' : '#34466a'}"/>`;
    for (let k = 0; k < 6; k++) if (r() < .6) w += `<rect x="${x + 6 + r() * (bw - 14)}" y="${300 - bh + 10 + r() * (bh - 30)}" width="6" height="8" fill="#ffd27a"/>`; x += bw; }
  if (lit) return w + rng(24, i => `<circle cx="${40 + i * 80}" cy="290" r="9" fill="#ffd27a" filter="url(#glow)"/>`);
  return wc(`${s}<path d="M700,300 V200 A70,70 0 0 1 840,200 V300 Z" fill="#3c4d72"/><path d="M770,130 v-30" stroke-width="4"/>
    <path d="M1400,300 L1450,30 L1500,300 Z" fill="#3a4b70"/>
    <path d="M140,300 V200 H180 V180 H220 V200 H300 V180 H340 V200 H380 V300 Z" fill="#3e4a62"/>
    <rect x="0" y="288" width="1920" height="12" fill="#25324c"/>`, 1.2);
})());
const towerSVG = lit => (lit
  ? `<rect x="25" y="170" width="120" height="350" fill="#fff0d0" opacity=".38"/>${rng(5, r => rng(2, k => `<path d="M${52 + k * 50},${230 + r * 58} v-22 a8,8 0 0 1 16,0 v22 Z" fill="#ffd77e"/>`))}
     ${[[27, 88], [143, 88], [85, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y - 34}" r="6" fill="${GOLD}"/><circle cx="${x}" cy="${y - 34}" r="16" fill="#ffd27a" opacity=".55" filter="url(#glow)"/>`).join('')}
     <rect x="10" y="520" width="150" height="10" fill="#5b7fe0"/><ellipse cx="85" cy="560" rx="70" ry="20" fill="#6f8cff" opacity=".5" filter="url(#glow)"/>`
  : wc(`<rect x="10" y="520" width="150" height="80" fill="#5b6475"/>
    <rect x="25" y="170" width="120" height="352" fill="${STONE_N}"/>
    ${rng(6, i => `<path d="M25,${200 + i * 56} H145" stroke="#6a768b" stroke-width="2"/>`)}
    ${rng(5, r => rng(2, k => `<path d="M${52 + k * 50},${230 + r * 58} v-22 a8,8 0 0 1 16,0 v22 Z" fill="#3a4252"/>`))}
    ${[[12, 42], [128, 42]].map(([x, w]) => `<rect x="${x}" y="88" width="30" height="${170 - 88 + 20}" fill="${STONE_N}"/><polygon points="${x - 2},90 ${x + 15},40 ${x + 32},90" fill="#55617a"/><path d="M${x + 15},40 v-12" stroke="${GOLD}" stroke-width="3"/>`).join('')}
    <polygon points="40,172 85,58 130,172" fill="#55617a"/><path d="M85,58 V30" stroke="${GOLD}" stroke-width="4"/><path d="M78,36 h14" stroke="${GOLD}" stroke-width="3"/>
    <rect x="40" y="120" width="90" height="16" fill="#6a768b"/>`, 1.6));
const walkwaySVG = lit => (lit
  ? `<path d="M0,62 H380 M0,94 H380 M0,108 H380 M0,132 H380" stroke="#fffbea" stroke-width="4"/><circle cx="190" cy="44" r="18" fill="#ffd27a" opacity=".6" filter="url(#glow)"/>`
  : wc(`<rect x="0" y="60" width="380" height="36" fill="#5d6a82"/><rect x="0" y="106" width="380" height="28" fill="#5d6a82"/>
    ${rng(19, i => `<path d="M${i * 20},62 L${i * 20 + 20},94 M${i * 20 + 20},62 L${i * 20},94" stroke="#8796b0" stroke-width="2"/>`)}
    ${rng(19, i => `<path d="M${i * 20},108 L${i * 20 + 20},132" stroke="#8796b0" stroke-width="2"/>`)}
    <path d="M168,60 L190,22 L212,60 Z" fill="${GOLD}"/><circle cx="190" cy="44" r="9" fill="#e9c56b"/>`, 1.4));
const chainSVG = lit => (lit
  ? `<path d="M30,330 Q330,300 600,60" fill="none" stroke="#fffbea" stroke-width="5"/><path d="M30,366 H620" stroke="#fffbea" stroke-width="4"/>${rng(10, i => `<circle cx="${80 + i * 56}" cy="352" r="5" fill="#ffd27a"/>`)}`
  : wc(`<rect x="0" y="352" width="620" height="22" fill="#4d5a72"/>
    <path d="M30,330 Q330,300 600,60" fill="none" stroke="#5d6a82" stroke-width="26"/><path d="M30,330 Q330,300 600,60" fill="none" stroke="#8796b0" stroke-width="2" stroke-dasharray="10 8"/>
    ${rng(14, i => { const t = (i + 1) / 15, x = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 330 + t * t * 600, y = (1 - t) * (1 - t) * 330 + 2 * (1 - t) * t * 300 + t * t * 60; return `<path d="M${x},${y + 10} V352" stroke="#8796b0" stroke-width="2"/>`; })}
    <rect x="0" y="230" width="60" height="140" fill="${STONE_N}"/><polygon points="-2,232 30,190 62,232" fill="#55617a"/>`, 1.4));
// The whole bridge front is ONE sheet of card, a V-fold across the gutter: both towers (X = ±27), the high walkway
// between them and the two chain spans out to the banks. Printed as one piece it can't come apart as the book closes:
// it folds flat along its glue lines like any V-fold. Below the walkway it is cut away, so the ship can pass and the
// bascules (hinged to the sheet at the towers' inner faces) can rise. 192 × 60 units, the spine at x = 960 px.
const TB = {Z: -20, tower: 27};
const bridgeSheet = lit => art(192, 60, `
  <g transform="translate(-18 200)">${chainSVG(lit)}</g>
  <g transform="translate(1938 200) scale(-1 1)">${chainSVG(lit)}</g>
  <g transform="translate(770 40)">${walkwaySVG(lit)}</g>
  <g transform="translate(605 0)">${towerSVG(lit)}</g>
  <g transform="translate(1145 0)">${towerSVG(lit)}</g>`);
// each tower's depth: a fin slotted through the sheet at the tower's centre line; it stands square to the sheet when
// the book is open and swings flat against it as the book closes (a cross-slot that folds along the slot)
const towerFin = art(15, 52, `${wc(`<rect x="10" y="90" width="130" height="430" fill="#6f7b91"/>
  ${rng(6, i => `<path d="M10,${120 + i * 56} H140" stroke="#5d687c" stroke-width="2"/>`)}
  ${rng(5, r => `<path d="M64,${158 + r * 58} v-22 a11,9 0 0 1 22,0 v22 Z" fill="#323a49"/>`)}
  <polygon points="10,92 75,20 140,92" fill="#4b566d"/>`, 1.5)}`);
const towerFinLit = art(15, 52, `${rng(5, r => `<path d="M64,${158 + r * 58} v-22 a11,9 0 0 1 22,0 v22 Z" fill="#ffd77e"/>`)}`);
const fin = (id, k) => ({id, type: 'custom', anchor: 'bottom', parent: 'bridge', parentPart: k, art: towerFin, artLit: towerFinLit, twoSided: true, noCrease: true,
  driver: '桥塔中线的插槽：开书时立成十字，合书时沿插槽转平，贴着桥身',
  pose: (s, rise) => { const a = Math.PI / 2 * rise; return {o: [k ? TB.tower : -TB.tower, 0, 0], x: [Math.cos(a), 0, Math.sin(a)], y: [0, 1, 0]}; }});
const bascule = (dir) => art(18, 4, wc(`<rect x="2" y="6" width="176" height="28" fill="#44516a"/>${rng(11, i => `<path d="M${6 + i * 16},8 L${22 + i * 16},32" stroke="#8796b0" stroke-width="2"/>`)}`, 1.2));
const shipFront = lit => art(13, 13, lit
  ? rng(3, r => rng(4, k => `<rect x="${30 + k * 18}" y="${50 + r * 16}" width="10" height="8" fill="#ffd77e"/>`))
  : wc(`<path d="M10,90 L65,128 L120,90 V82 H10 Z" fill="#1d2840"/><path d="M10,90 L65,128 L120,90" fill="none" stroke="${RED}" stroke-width="4"/>
    <rect x="22" y="40" width="86" height="44" fill="#eef0f2"/>${rng(3, r => rng(4, k => `<rect x="${30 + k * 18}" y="${50 + r * 16}" width="10" height="8" fill="#3a4252" stroke="none"/>`))}
    <rect x="52" y="18" width="26" height="24" fill="${RED}"/><rect x="52" y="14" width="26" height="6" fill="#1d1d1d"/><path d="M90,40 V4" stroke-width="2"/>`, 1.4));
const embank = lit => art(84, 18, lit
  ? `<circle cx="120" cy="22" r="30" fill="#ffd27a" opacity=".8" filter="url(#glow)"/><polygon points="108,12 132,12 135,34 105,34" fill="#ffe7a6"/>`
  : wc(`<rect x="0" y="150" width="840" height="30" fill="#8e877b"/><path d="M0,112 H840 M0,140 H840" stroke="#1f2227" stroke-width="3"/>
    ${rng(56, i => `<path d="M${6 + i * 15},110 V150" stroke="#1f2227" stroke-width="2"/>`)}${rng(4, i => `<rect x="${200 + i * 200}" y="100" width="22" height="52" fill="#a39b8c"/>`)}
    <rect x="116" y="40" width="8" height="112" fill="#1f2227"/><rect x="106" y="146" width="28" height="12" fill="#1f2227"/>
    <polygon points="108,12 132,12 135,34 105,34" fill="#c9a24a"/><path d="M105,34 h30 l-4,6 h-22 Z M106,12 L120,0 L134,12 Z" fill="#1f2227"/>`, 1.4));
const waveRow = (seed, lit) => art(96, 6, lit
  ? (() => { const r = rand(seed); return rng(26, () => `<path d="M${r() * 940},${18 + r() * 30} h${16 + r() * 30}" stroke="${r() < .7 ? '#ffd27a' : '#7d95ff'}" stroke-width="3"/>`); })()
  : wc(`<path d="M0,60 V${26} ${rng(16, i => `Q${i * 60 + 15},${8 + (i % 2) * 6} ${i * 60 + 30},26 T${i * 60 + 60},26`)} V60 Z" fill="#26375a"/>
    <path d="M0,26 ${rng(16, i => `Q${i * 60 + 15},${8 + (i % 2) * 6} ${i * 60 + 30},26 T${i * 60 + 60},26`)}" fill="none" stroke="#8ea3c8" stroke-width="2"/>`, 1.2));
const WAVES = [[-14, 0, 101], [2, 1.3, 103], [14, 2.6, 107]];
// the bridge is worked from a hand winch on the embankment: turn the wheel and the bascules rise
const CRANK = {X: -34, Z: 38.6, y: 7.2};
const crankPost = art(10, 11, `${wc(`<rect x="22" y="40" width="56" height="70" fill="#2f4a3a"/><rect x="16" y="102" width="68" height="8" fill="#1f3328"/>
  <rect x="30" y="52" width="40" height="22" fill="#d8a93b"/>`, 1.4)}
  <text x="50" y="62" text-anchor="middle" font-size="7" fill="#2f2a1e" font-family="Georgia, serif">TURN TO</text>
  <text x="50" y="71" text-anchor="middle" font-size="7" fill="#2f2a1e" font-family="Georgia, serif">RAISE ↻</text>`);
const crankWheel = art(10, 10, `${wc(`<circle cx="50" cy="50" r="44" fill="none" stroke="#3a3f47" stroke-width="7"/>
  ${rng(6, i => { const a = i * Math.PI / 3; return `<path d="M50,50 L${50 + 42 * Math.cos(a)},${50 + 42 * Math.sin(a)}" stroke="#3a3f47" stroke-width="4"/>`; })}
  <circle cx="50" cy="50" r="9" fill="#d8a93b"/><circle cx="50" cy="8" r="7" fill="${RED}"/>`, 1.4)}`);
const WHEEL = {X: 70, Z: 54, r: 9};
const TB_FACTS = [['1894', '塔桥这一年通车'], ['800', '每年开桥约 800 次'], ['42 m', '高处人行道离河面'], ['~950', '北岸的伦敦塔已有约 950 年']];
const factDisc = art(18, 18, `<circle cx="90" cy="90" r="88" fill="#efe2c8" stroke="#5b4a3a" stroke-width="2.5"/>
  ${TB_FACTS.map(([big, small], k) => `<g transform="rotate(${-k * 90} 90 90)"><path d="M90,90 L28,28 A88,88 0 0 1 152,28 Z" fill="${['#f3e4c2', '#e9d4ad', '#f3e4c2', '#e9d4ad'][k]}"/>
    <text x="90" y="34" text-anchor="middle" font-size="17" fill="#2f3f5f" font-family="Georgia, serif">${big}</text>
    <text x="90" y="52" text-anchor="middle" font-size="9.5" fill="${INK}" font-family="Noto Serif SC, serif">${small}</text></g>`).join('')}
  <circle cx="90" cy="90" r="7" fill="#d8a93b" stroke="#5b4a3a" stroke-width="2"/>`);
const factCover = art(22, 21, `${wc(`<path fill-rule="evenodd" fill="#2f3f5f" d="M2,2 H218 V208 H2 Z M66,22 H154 Q160,22 160,28 V66 Q110,82 60,66 V28 Q60,22 66,22 Z"/>`, 1.4)}
  <path d="M60,66 Q110,82 160,66" fill="none" stroke="#d8a93b" stroke-width="2"/>
  <text x="110" y="120" text-anchor="middle" font-size="15" letter-spacing="3" fill="#e9c56b" font-family="Georgia, serif">TOWER BRIDGE</text>
  <text x="110" y="142" text-anchor="middle" font-size="11" fill="#e9e2d0" font-family="Noto Serif SC, serif">转一转，看小知识</text>
  <path d="M84,170 a26,26 0 1 1 52,0" fill="none" stroke="#e9c56b" stroke-width="3"/><path d="M136,170 l-6,-8 m6,8 l7,-6" stroke="#e9c56b" stroke-width="3" fill="none"/>`);
const spread4 = {
  eyebrow: '19:50 · Tower Bridge', station: 'Tower Hill', signature: 'crank', title: '塔桥之夜', en: 'A night on the Thames', light: 'night', lit: 0,
  story: '晚上七点五十，泰晤士河已经全黑了，只有远处的城市亮着几扇窗。整座桥印在一张跨过书脊的 V 折上，桥塔靠插槽侧翼立起来。转动岸边的绞盘：桥面掀起，夜船随浪驶近，整座塔桥一起亮灯；倒着转，船退回去，灯也熄灭。晚安，伦敦。',
  todo: ['按住左下方岸边的绞盘绕圈转（顺时针）：桥面掀起，浪一层层起伏，夜船驶近，全桥亮灯。', '逆时针转回去：船退回桥后，灯光熄灭。', '点一点桥塔，单独开灯、关灯。', '转一转右下角的小转盘（或者点它），窗口里会换成下一条塔桥小知识。'],
  floor: floor(`${pageBg('#1d2b45')}
    ${(() => { const r = rand(97); return rng(180, () => { const x = r() * 1960, y = r() * fz(28); return `<path d="M${x},${y} q10,-6 20,0 q10,-6 20,0" fill="none" stroke="#33496f" stroke-width="2.4"/>`; }); })()}
    <rect x="0" y="${fz(28)}" width="2000" height="16" fill="#5d5a55"/>
    <rect x="0" y="${fz(28) + 16}" width="2000" height="${1300 - fz(28)}" fill="#8f897d"/>
    ${rng(9, i => `<path d="M0,${fz(32) + i * 40} H2000" stroke="#7c766b" stroke-width="1.6"/>`)}${rng(26, i => `<path d="M${i * 80 + (i % 2) * 40},${fz(32)} V1300" stroke="#7c766b" stroke-width="1.2"/>`)}
    ${plateBox}
    ${grain(2000, 1300, .25)}`),
  floorLit: floor(`<rect width="2000" height="1300" fill="#000"/>
    ${[[-27, '#c99a3a'], [27, '#c99a3a'], [0, '#3a4fa8']].map(([X, c]) => rng(12, i => `<path d="M${fx(X) - 50 + (i % 3) * 30},${fz(-14) + i * 34} h${60 + (i % 4) * 14}" stroke="${c}" stroke-width="8" opacity=".9"/>`)).join('')}
    ${(() => { const r = rand(101); return rng(60, () => `<path d="M${r() * 2000},${fz(-60) + r() * 120} h${10 + r() * 30}" stroke="#a07a2a" stroke-width="4"/>`); })()}
    <ellipse cx="${fx(-79)}" cy="${fz(36)}" rx="90" ry="40" fill="#7a5212" filter="url(#glow)"/>`),
  texts: [...plateTexts('TOWER BRIDGE', 'A night on the Thames', '塔桥 · 晚上 19:50'),
  ],
  pieces: [
    {id: 'sky', type: 'v', Z: -58, sigma: -3, wl: 96, wr: 96, art: nightSkyline(false), artLit: nightSkyline(true)},
    {id: 'bridge', type: 'v', Z: TB.Z, sigma: -4, wl: 96, wr: 96, art: bridgeSheet(false), artLit: bridgeSheet(true),
      tap: (c, e) => { c.lights('toggle'); c.note('塔桥 1894 年通车。整座桥是一张跨过书脊的 V 折：两座桥塔、高处的人行道和两边的吊索印在同一张卡纸上。', e); }},
    fin('finTL', 0), fin('finTR', 1),
    // each half of the roadway is hinged to the sheet at the inner face of its tower
    {id: 'basL', type: 'custom', anchor: 'left', parent: 'bridge', parentPart: 0, art: bascule(), lift: 0, twoSided: true, driver: '岸边绞盘：拉条从页面下穿过，拉起桥板（最多 84°）', pose: s => { const L = s.lift * 84 * Math.PI / 180;
      return {o: [-TB.tower + 8.5, 8, .25], x: [Math.cos(L), Math.sin(L), 0], y: [-Math.sin(L), Math.cos(L), 0]}; }},
    {id: 'basR', type: 'custom', anchor: 'right', parent: 'bridge', parentPart: 1, art: bascule(), lift: 0, twoSided: true, driver: '岸边绞盘：同一根拉条拉起另一块桥板', pose: s => { const L = s.lift * 84 * Math.PI / 180;
      return {o: [TB.tower - 8.5, 8, .25], x: [Math.cos(L), -Math.sin(L), 0], y: [Math.sin(L), Math.cos(L), 0]}; }},
    {id: 'ship', type: 'stand', X: 7.2, Z: -46, raise: .98, ease: 4, noCrease: true, driver: '绞盘带动：桥板升起后，船在页面上的槽里从桥后滑到桥前', art: shipFront(false), artLit: shipFront(true), tap: (c, e) => { c.hop('ship'); c.note('嘟——夜船正从桥下穿过。', e); }},
    ...WAVES.flatMap(([Z, ph, sd], k) => ['L', 'R'].map(side => ({id: `wave${k}${side}`, type: 'stand', X: side === 'L' ? -49 : 49, Z, ease: 6, noCrease: true,
      art: waveRow(sd + (side === 'L' ? 0 : 1), false), artLit: waveRow(sd + (side === 'L' ? 0 : 1), true), driver: '绞盘联动：浪片底边在横槽里左右滑'}))),
    {id: 'embank', type: 'stand', X: -56, Z: 31, art: embank(false), artLit: embank(true)},
    {id: 'crankPost', type: 'stand', X: CRANK.X, Z: CRANK.Z - .5, art: crankPost},
    {id: 'crank', type: 'custom', anchor: 'center', art: crankWheel, ang: 0,
      parent: 'crankPost', pose: s => { const a = (s.ang || 0) * Math.PI / 180; return {o: [0, CRANK.y, .5], x: [Math.cos(a), -Math.sin(a), 0], y: [Math.sin(a), Math.cos(a), 0]}; },
      dial: (deg, c) => c.tab('open', c.tabV('open') + deg / 720), tap: (c, e) => c.note('按住绞盘绕圈转：顺时针开桥，逆时针收回。', e)},
    me(56, 44, 'wave', '这里是塔桥，夜里亮灯的样子最好看。晚安，伦敦，明天见！'),
    ...volvelle({id: 'facts', ...WHEEL, disc: factDisc, cover: factCover}),
  ],
  // no tab on the page edge: the winch drives it (two full turns from closed to open)
  controls: [{id: 'open', hidden: true, X: 1, Z: -46, len: 66, init: 0, apply: (v, c) => {
    c.set('crank', {ang: v * 720});
    const lift = smoothstep(Math.min(1, v / .4)); c.set('basL', {lift}); c.set('basR', {lift});
    c.set('ship', {Z: -46 + smoothstep(Math.max(0, Math.min(1, (v - .42) / .45))) * 66, tilt: Math.sin(v * Math.PI * 5) * 4});
    WAVES.forEach(([Z, ph], k) => ['L', 'R'].forEach(side => c.set(`wave${k}${side}`, {X: (side === 'L' ? -49 : 49) + Math.sin(v * Math.PI * 3 + ph) * 2.6})));
    // lights come on as the ship sails in and go out again as it backs away
    c.lights(v > .8 ? 1 : 0);
  }}],
};

export default {
  title: 'Tower Bridge',
  subtitle: 'A night on the Thames',
  cover: simpleCover('Tower Bridge', 'A NIGHT ON THE THAMES', '#1d2b45'),
  spread: spread4,
  // the still: the winch turned until the bascules are up and the ship is passing under the walkway, lights on
  shot: {lights: 1, pulls: {open: .6}, view: {az: 0, pol: 70, r: 1, target: [0, .12, 0]}},
  card: {zh: '伦敦塔桥 · 夜里开桥', caption: '把一张塔桥夜景照片，变成一页转动绞盘就会开桥、过船、亮灯的立体书。', place: 'Tower Bridge, London', time: '19:50'},
};
