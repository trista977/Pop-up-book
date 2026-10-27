/* <Place> — one pop-up page drawn from photo.jpg.
   Copy this file to popup-pages/<slug>/page.js (in the user's folder) and replace every part marked TODO. It renders as it is (a river, a skyline,
   one building with a dial riveted to it, a boat), so you can check the setup before drawing:
     node $SKILL/scripts/render.mjs popup-pages/<slug>
   It follows the shape of the two reference pages, examples/tower-bridge and examples/westminster:
   - a far V-fold, then the hero (one V-fold sheet if it spans the page, a stand if it is one building)
   - moving or round parts are child pieces riveted to their parent (`parent`, plus `parentPart` on a V-fold)
   - ONE main mechanism: a hidden control value 0…1 that the reader turns by hand (`dial`), and `apply` poses
     everything from it, step by step (here: the dial turns, the boat crosses, the lights come on)
   Units: X across the spread (spine 0, pages ±100), Z along the spine (far edge -65, near edge +65); art is 10 px per unit.
   Full field list: references/page-format.md. */
import {INK, RED, GOLD, rng, rand, wc, art, grain, lg, cloud, lamp} from '../../engine/paper-art.js';
import {fx, fz, floor, pageBg, plateBox, plateTexts, mirror, smoothstep, clamp01, me, simpleCover} from '../../engine/kit.js';

/* ---------- 1 · far layer: a V-fold across the gutter (sky and distant skyline, pale and cool) ---------- */
// TODO: redraw from the photo's background. 96 × 30 units per wing (two wings meet at the spine).
const backdrop = lit => art(192, 30, lit
  ? (() => { const r = rand(11); return rng(50, () => `<rect x="${r() * 1900}" y="${150 + r() * 120}" width="6" height="8" fill="#ffd27a"/>`); })()
  : `<defs>${lg('sky', [[0, '#9fb6d6'], [1, '#f2e2c4']])}</defs>
  <path d="M0,300 V60 Q240,10 480,50 Q760,0 960,40 Q1200,10 1440,50 Q1700,20 1920,60 V300 Z" fill="url(#sky)"/>
  ${cloud(300, 90, 1.4)}${cloud(1500, 80, 1.2)}
  ${wc(rng(24, i => `<rect x="${i * 80}" y="${140 - (i % 4) * 25}" width="70" height="${160 + (i % 4) * 25}" fill="${i % 2 ? '#c9cfd8' : '#d6d9de'}"/>`), 1.3)}`);

/* ---------- 2 · the hero (TODO: draw the photo's main subject) ---------- */
// One building is a stand (w × h units): keep (distance from the spine along Z) + h ≤ 65 so it folds inside the closed
// book. A subject that spans the page (a bridge, a palace front) is one V-fold sheet instead: see examples/tower-bridge.
const HERO = {X: 40, Z: -24, dialY: 30};            // dialY: the dial's centre, in units up the hero
const hero = lit => art(30, 40, lit
  ? `${rng(3, r => rng(4, k => (r + k) % 2 ? `<rect x="${40 + k * 60}" y="${180 + r * 70}" width="34" height="44" fill="#f6cf7a"/>` : ''))}`
  : `${wc(`<rect x="10" y="60" width="280" height="340" fill="#e6d3ae"/>
  <polygon points="0,64 150,6 300,64" fill="#9a7a5a"/>
  ${rng(3, r => rng(4, k => `<rect x="${40 + k * 60}" y="${180 + r * 70}" width="34" height="44" fill="#4a5262" stroke="#f4ece0" stroke-width="3"/>`))}`, 1.5)}
  <circle cx="150" cy="${400 - HERO.dialY * 10}" r="34" fill="#faf4e4" stroke="${INK}" stroke-width="2"/>`);
// the dial is a separate piece riveted to the hero's face, so the reader can turn it (a clock face, a wheel, a winch)
const dialArt = art(6.6, 6.6, `<circle cx="33" cy="33" r="31" fill="#faf4e4" stroke="${INK}" stroke-width="2.6"/>
  <path d="M33,33 V8" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="33" cy="33" r="4" fill="${RED}"/>`);

/* ---------- 3 · what the mechanism moves (TODO: a boat, a bus, a bascule, the hands…) ---------- */
const boat = lit => art(20, 8, lit
  ? rng(6, i => `<rect x="${50 + i * 18}" y="34" width="10" height="10" fill="#ffd77e"/>`)
  : wc(`<path d="M6,50 H194 L178,76 H22 Z" fill="#f4f1ea"/><rect x="6" y="54" width="188" height="6" fill="${RED}" stroke="none"/>
  <rect x="40" y="26" width="120" height="26" rx="5" fill="#eef0f2"/>${rng(6, i => `<rect x="${50 + i * 18}" y="34" width="10" height="10" fill="#6f8ea6" stroke-width="1"/>`)}`, 1.4));
const BOAT = {X0: -70, X1: 70, Z: -2};

/* ---------- 4 · the spread ---------- */
const spread = {
  eyebrow: '15:00 · Place',          // TODO: time · place
  title: '地点',                      // TODO
  en: 'Subtitle',                     // TODO
  light: 'afternoon',                 // morning | afternoon | golden | evening | night
  lit: 0,                             // 1 = night lights on when the page opens
  story: 'TODO：一两句话讲这一页。',
  todo: ['TODO：按住主角身上的转盘绕圈转：船从左岸开到右岸，灯亮起来；倒着转全部退回。'],
  // the page itself: one whole picture (ground, river, embankment…), 2000 × 1300 px; fx/fz turn X/Z into pixels
  floor: floor(`${pageBg('#e9e0cc')}
    <rect x="0" y="0" width="2000" height="${fz(-12)}" fill="#a9bf86"/>
    <rect x="0" y="${fz(-12)}" width="2000" height="${fz(10) - fz(-12)}" fill="#7f9fb3"/>
    ${(() => { const r = rand(31); return rng(60, () => { const x = r() * 1960, y = fz(-11) + r() * 200; return `<path d="M${x},${y} q10,-7 20,0 q10,-7 20,0" fill="none" stroke="#e4ecef" stroke-width="2.4" opacity=".75"/>`; }); })()}
    <path d="M${fx(BOAT.X0)},${fz(BOAT.Z) + 8} H${fx(BOAT.X1)}" stroke="#4d5a72" stroke-width="4"/>
    <rect x="0" y="${fz(10)}" width="2000" height="14" fill="#d1c8b4"/>
    ${plateBox}${grain(2000, 1300, .3)}`),
  texts: [...plateTexts('PLACE', 'Subtitle', '地点 · 下午 15:00')],   // TODO
  pieces: [
    {id: 'back', type: 'v', Z: -58, sigma: -3, wl: 96, wr: 96, art: backdrop(false), artLit: backdrop(true)},
    {id: 'hero', type: 'stand', X: HERO.X, Z: HERO.Z, art: hero(false), artLit: hero(true), tap: (c, e) => c.note('TODO：点主角时说的话。', e)},
    {id: 'dial', type: 'custom', anchor: 'center', parent: 'hero', art: dialArt, ang: 0, driver: '铆在主角上，手指绕圈转',
      pose: s => { const a = (s.ang || 0) * Math.PI / 180; return {o: [0, HERO.dialY, .15], x: [Math.cos(a), -Math.sin(a), 0], y: [Math.sin(a), Math.cos(a), 0]}; },
      dial: (deg, c) => c.tab('main', c.tabV('main') + deg / 360), tap: (c, e) => c.note('按住转盘绕圈转：顺时针往前，逆时针退回。', e)},
    {id: 'boat', type: 'stand', X: BOAT.X0, Z: BOAT.Z, art: boat(false), artLit: boat(true), noCrease: true, driver: '转盘带动：底边在河上的槽里左右滑'},
    {id: 'lamp', type: 'stand', X: -20, Z: 16, art: lamp(26), artLit: lamp(26, true)},
    me(-36, 30, 'wave', 'TODO：小人说出这里是哪里。'),
  ],
  controls: [
    // the main mechanism: one hidden value, turned by the dial; apply() poses everything from it, so it is reversible
    {id: 'main', hidden: true, X: BOAT.X0, Z: BOAT.Z, dir: [1, 0, 0], len: BOAT.X1 - BOAT.X0, init: 0, apply: (v, c) => {
      c.set('dial', {ang: v * 360});
      c.set('boat', {X: BOAT.X0 + smoothstep(clamp01(v / .8)) * (BOAT.X1 - BOAT.X0)});    // 0 … .8: the boat crosses
      c.lights(v > .8 ? 1 : 0);                                                              // then the lights come on
    }},
  ],
};

export default {
  title: 'Place',                     // TODO: English title on the share card
  subtitle: 'Subtitle',
  cover: simpleCover('Place', 'SUBTITLE'),
  spread,
  // the still: lights (0–1, applied after the pulls), control positions (stop at the best moment), cards to show
  // opened, camera (degrees, degrees, × fitted distance)
  shot: {lights: 0, pulls: {main: .45}, open: [], view: {az: 0, pol: 70, r: 1, target: [0, .12, 0]}},
  // the share card: Chinese title, one-line caption, where and when the photo was taken
  card: {zh: 'TODO 中文标题', caption: 'TODO 一句话：把什么照片变成了什么样的立体书。', place: 'TODO Place, City', time: '15:00'},
};
