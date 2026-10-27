/* Page kit: the helpers every pop-up page uses, on top of book3d.js (the engine) and paper-art.js (drawing motifs).
   Flat-world units: X across the spread (spine at 0, pages ±100), Z along the spine (far edge -65, near edge +65).
   The page floor is a 2000 × 1300 SVG; fx / fz turn flat-world X / Z into floor pixels. Piece art uses 10 px per unit. */
import {INK, rng, wc, art, roundel, traveller} from './paper-art.js';

export const smoothstep = t => t * t * (3 - 2 * t);
export const clamp01 = v => Math.max(0, Math.min(1, v));
// flip a piece's art left-right (the far side of a V-fold wing, a wall facing the other way) or upside down (the back of
// a card that turns over its top edge)
export const mirror = a => ({...a, svg: a.svg.replace('<defs>', `<g transform="translate(${a.w * 10} 0) scale(-1 1)"><defs>`).replace(/<\/svg>$/, '</g></svg>')});
export const flipY = a => ({...a, svg: a.svg.replace('<defs>', `<g transform="translate(0 ${a.h * 10}) scale(1 -1)"><defs>`).replace(/<\/svg>$/, '</g></svg>')});
// watercolour edges for the shapes only: lettering and fine drawings (marked <!--C-->…<!--/C-->) stay crisp on top
export const wcCrisp = (str, k) => { const crisp = [];
  str = str.replace(/<!--C-->[\s\S]*?<!--\/C-->/g, m => (crisp.push(m), '')).replace(/<text[^>]*>[^<]*<\/text>/g, m => (crisp.push(m), ''));
  return wc(str, k) + crisp.join(''); };

// a photo next to the page module, as a data URL (so it can be drawn inside SVG art): await loadPhoto(new URL('photo.jpg', import.meta.url))
const toDataURL = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
export const loadPhoto = url => fetch(url).then(r => r.blob()).then(toDataURL);

/* ---------- the page floor ---------- */
export const fx = X => (X + 100) * 10, fz = Z => (Z + 65) * 10;
export const floor = inner => ({svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1300" width="2000" height="1300">${art(1, 1, '').svg.match(/<defs>[\s\S]*<\/defs>/)[0]}${inner}</svg>`});
export const pageBg = (c = '#f4ecdc') => `<rect width="2000" height="1300" fill="${c}"/>`;
export const SERIF = '"Cormorant Garamond", Georgia, serif', SC = '"Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, serif';

// the place card in the lower-left corner: place, a subtitle and the local time, all inside its frame.
// Draw plateBox into the floor and spread plateTexts(...) into the page's texts.
export const PLATE = {x: fx(-94), y: fz(41), w: 560, h: 178};
export const plateBox = `<rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}" fill="#fbf6ea" stroke="#7a6650" stroke-width="2"/>
  <rect x="${PLATE.x + 9}" y="${PLATE.y + 9}" width="${PLATE.w - 18}" height="${PLATE.h - 18}" fill="none" stroke="#b9a37a" stroke-width="1.2"/>`;
export const plateTexts = (en, sub, zh) => [
  {x: PLATE.x + 30, y: PLATE.y + 60, text: en, font: `700 40px ${SERIF}`, ls: 4, maxWidth: PLATE.w - 60},
  {x: PLATE.x + 30, y: PLATE.y + 104, text: sub, font: `italic 500 31px ${SERIF}`, color: '#4a3b2e', maxWidth: PLATE.w - 60},
  {x: PLATE.x + 30, y: PLATE.y + 146, text: zh, font: `600 27px ${SC}`, color: '#5b4a3a', maxWidth: PLATE.w - 60},
];
export const dashBox = (x, y, w, h, c = '#f4ead6', r = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="9 6"/>`;

/* ---------- small mechanisms ---------- */
// flat pieces lie on the page: ex along the page, ey toward its far edge
export const FLAT_X = [1, 0, 0], FLAT_Y = [0, 0, -1];
// a postcard that turns over like a coin (tap)
export const postcard = ({id, X, Z, w, h, front, back, note}) => ({id, type: 'custom', anchor: 'center', w, h, art: front, artBack: mirror(back), speed: 3.2,
  tap: (c, e) => { c.toggle(id); if (c.once(id) && note) c.note(note, e); },
  pose: (s, rise, p) => { const a = Math.PI * smoothstep(p.open); return {o: [X, .25 + w / 2 * Math.sin(a) * .9, Z], x: [Math.cos(a), Math.sin(a), 0], y: FLAT_Y}; }});
// a little booklet: tap and the next leaf turns over on its left-hand spine
export function booklet({id, X, Z, w, h, leaves, note}) {
  const ids = leaves.map((_, k) => `${id}${k}`), n = leaves.length;
  const next = (c, i) => { const st = ids.map(q => !!c.get(q).opened), k = st[i] ? st.lastIndexOf(true) : st.indexOf(false); if (k >= 0) c.set(ids[k], {opened: !st[k]}); return k; };
  return leaves.map(([front, back], k) => ({id: ids[k], type: 'custom', anchor: 'left', w, h, art: front, artBack: mirror(back), speed: 4,
    tap: (c, e) => { const j = next(c, k); if (j === n - 1 && c.get(ids[j]).opened && note) c.note(note, e); },
    pose: (s, rise, p) => { const a = Math.PI * smoothstep(p.open), y = .25 + (n - k) * .06 * (1 - p.open) + k * .06 * p.open;
      return {o: [X - w / 2, y, Z + h / 2], x: [Math.cos(a), Math.sin(a), 0], y: FLAT_Y}; }}));
}
// a disc under a window: turn it (or tap) to bring the next quarter round
export const volvelle = ({id, X, Z, r, disc, cover}) => [
  {id, type: 'custom', anchor: 'center', w: r * 2, h: r * 2, art: disc, solidHit: true, ang: 0, target: 0,
    tick: (s, dt) => { if (!s.dragging) s.ang += (s.target - s.ang) * Math.min(1, dt * 6); s.dragging = false; },
    dial: (deg, c) => { const s = c.get(id); s.ang += deg; s.target = Math.round(s.ang / 90) * 90; s.dragging = true; },
    tap: c => { const s = c.get(id); s.target = Math.round(s.ang / 90) * 90 + 90; },
    pose: s => { const a = s.ang * Math.PI / 180; return {o: [X, .25, Z], x: [Math.cos(a), 0, Math.sin(a)], y: [Math.sin(a), 0, -Math.cos(a)]}; }},
  {id: `${id}Cover`, type: 'custom', anchor: 'center', w: cover.w, h: cover.h, art: cover, tap: c => { const s = c.get(id); s.target = Math.round(s.ang / 90) * 90 + 90; },
    pose: () => ({o: [X, .45, Z + (cover.h / 2 - r - 1.2)], x: FLAT_X, y: FLAT_Y})},
];

/* ---------- recurring characters and signs ---------- */
// the traveller says where she is, so place names live in her lines rather than on signs
export const me = (X, Z, pose, line, look) => ({id: 'me', type: 'stand', X, Z, w: 10, h: 17.5, art: traveller(pose, look), tap: (c, e) => { c.hop('me'); c.note(line, e); }});
// a standing Underground roundel for the real station nearest the place (London pages only)
export const station = (X, Z, name, time) => ({id: 'station', type: 'stand', X, Z, w: 20, h: 13.8, art: roundel(name, time)});

// a cover for a one-page book: cloth with the page's title in gold
export const simpleCover = (title, sub = '', color = '#6b1e2a', gold = '#d8a93b') => art(103, 135, `
  <rect width="1030" height="1350" fill="${color}"/>
  <rect x="60" y="60" width="910" height="1230" fill="none" stroke="${gold}" stroke-width="5"/>
  <text x="515" y="700" text-anchor="middle" font-size="84" font-style="italic" fill="${gold}" font-family="Georgia, serif">${title}</text>
  <text x="515" y="790" text-anchor="middle" font-size="30" letter-spacing="8" fill="${gold}" font-family="Georgia, serif">${sub}</text>`);

export {INK, rng};
