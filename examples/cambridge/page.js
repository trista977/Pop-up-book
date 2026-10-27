/* Example page: punting on the Cam, Cambridge — made from the 河岸地标 (river landmark) page type by filling its slots
   from the user's own photos (2026.10.03, about 16:00):
     主建筑 hero       photo.jpg  the river front: pale gault-brick terrace with arched ground-floor windows, a mustard
                                  gabled house, a red-brick block with rows of white windows and teal awnings, a glass
                                  penthouse behind, a red-brick house with dormers behind autumn trees; the white punt hut
                                  and moored punts along the quay. The boat on the river is a punt with its punter.
     背景 backdrop     (a college street photo, reference only) a domed octagonal turret, a chapel with crocketed pinnacles
                                  and tall Gothic windows, a battlemented brick-and-stone tower, stepped gables and chimneys
     底面 ground       the Cam's grey-green water and the stone quay
     记忆卡 memory     memory.jpg  the apple tree in front of a college building (no people in it)
     人物 traveller    the usual traveller (no photo given)
   No building is named: only what is certain from the photos (Cambridge, the River Cam). */
import {INK, rng, rand, wc, art, lg, cloud, lamp} from '../../engine/paper-art.js';
import {riverLandmark} from '../../layouts/river-landmark.js';

/* ---------- 背景: the college skyline, pale and cool ---------- */
const STONE = '#d6cdb9', STONE_D = '#c3b9a3', BRICK_P = '#c9a596';
const pinnacle = (x, y, h) => `<path d="M${x - 5},${y} L${x},${y - h} L${x + 5},${y} Z" fill="${STONE_D}"/>${rng(4, k => `<path d="M${x - 4},${y - k * h / 5 - 6} l-4,-3 M${x + 4},${y - k * h / 5 - 6} l4,-3" stroke="${STONE_D}" stroke-width="2"/>`)}`;
const backdrop = lit => art(192, 30, lit
  ? (() => { const r = rand(17); return rng(36, () => `<rect x="${r() * 1900}" y="${200 + r() * 80}" width="6" height="9" fill="#ffd27a"/>`); })()
  : `<defs>${lg('cbsky', [[0, '#9db3cf'], [.7, '#dfe3e6'], [1, '#efe7d6']])}</defs>
  <path d="M0,300 V70 Q260,20 520,60 Q800,10 960,50 Q1200,15 1460,55 Q1700,20 1920,65 V300 Z" fill="url(#cbsky)"/>
  ${cloud(380, 90, 2.2, '#f7f5f0')}${cloud(1450, 80, 1.8, '#f4f1ea')}${cloud(900, 120, 1.1, '#eef0f2')}
  ${wc(`
    <rect x="0" y="230" width="1920" height="70" fill="#b9bfae"/>
    <rect x="130" y="170" width="60" height="130" fill="${STONE}"/><path d="M122,172 Q160,105 198,172 Z" fill="#8f949a"/><path d="M160,112 V88 M150,98 H170" stroke="${STONE_D}" stroke-width="5"/>
    ${rng(3, k => `<path d="M${140 + k * 16},210 v-20 a6,8 0 0 1 12,0 v20 Z" fill="#8f949a" stroke="none"/>`)}
    <rect x="190" y="205" width="150" height="95" fill="${BRICK_P}"/><polygon points="190,207 265,150 340,207" fill="#8f949a"/>
    <rect x="420" y="170" width="300" height="130" fill="${STONE}"/><rect x="415" y="160" width="310" height="14" fill="${STONE_D}"/>
    ${[420, 520, 620, 720].map(x => pinnacle(x, 165, 70)).join('')}
    ${rng(3, k => `<path d="M${445 + k * 95},290 V215 a28,34 0 0 1 56,0 V290 Z" fill="#7d8796"/><path d="M${473 + k * 95},212 V290 M${445 + k * 95},250 H${501 + k * 95}" stroke="${STONE}" stroke-width="2.4"/>`)}
    ${rng(9, i => `<circle cx="${780 + i * 40}" cy="${250 - (i % 3) * 14}" r="${30 + (i % 2) * 10}" fill="${i % 2 ? '#aab27c' : '#c1b06a'}"/>`)}
    <rect x="1060" y="190" width="220" height="110" fill="${STONE}"/>${[1060, 1130, 1210, 1280].map(x => pinnacle(x, 192, 45)).join('')}
    ${rng(2, k => `<path d="M${1095 + k * 110},290 V230 a22,28 0 0 1 44,0 V290 Z" fill="#7d8796"/>`)}
    <rect x="1340" y="120" width="90" height="180" fill="#bf8f80"/>${rng(7, k => `<rect x="${k % 2 ? 1340 : 1416}" y="${126 + k * 24}" width="14" height="12" fill="${STONE}" stroke="none"/>`)}
    ${rng(5, k => `<rect x="${1340 + k * 19}" y="104" width="12" height="18" fill="#bf8f80"/>`)}
    <rect x="1480" y="200" width="330" height="100" fill="${STONE}"/>
    <path d="M1480,200 h20 v-14 h20 v-14 h20 v-14 h20 v14 h20 v14 h20 v14 Z M1650,200 h20 v-14 h20 v-14 h20 v-14 h20 v14 h20 v14 h20 v14 Z" fill="${STONE}"/>
    ${[1600, 1630, 1780, 1805].map(x => `<rect x="${x}" y="140" width="16" height="62" fill="${STONE_D}"/><rect x="${x - 3}" y="136" width="22" height="8" fill="${STONE_D}"/>`).join('')}
    ${rng(4, i => `<circle cx="${1830 + i * 26}" cy="${240 - (i % 2) * 18}" r="34" fill="#a6ae7a"/>`)}`, 1.3)}`);

/* ---------- 主建筑: the river front, one V-fold across the gutter ---------- */
const GAULT = '#dccb9f', MUSTARD = '#d7ad55', RED = '#b55a40', RED2 = '#a8503a', SLATE = '#5f6872', TILE = '#8d4f3c', TEAL = '#3f9d98';
const sash = (x, y, w = 18, h = 26, lit = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${lit ? '#f6cf7a' : '#3f4650'}" stroke="#f1ece2" stroke-width="2.4"/>${lit ? '' : `<path d="M${x},${y + h / 2} h${w}" stroke="#f1ece2" stroke-width="1.6"/>`}`;
const front = lit => {
  const on = (i, k) => (i * 7 + k * 3) % 5 < 2;
  if (lit) return art(144, 42, `${rng(3, r => rng(7, k => on(r, k) ? sash(560 + k * 56, 150 + r * 56, 22, 30, true) : ''))}
    ${rng(3, r => rng(4, k => on(r + 1, k) ? sash(1290 + k * 36, 110 + r * 62, 20, 30, true) : ''))}
    <rect x="560" y="352" width="400" height="26" fill="#ffcf7e" opacity=".9"/>${rng(8, k => `<circle cx="${1010 + k * 50}" cy="${330 + (k % 2) * 6}" r="5" fill="#fff2b0"/>`)}`);
  return art(144, 42, `${wc(`
    
    <polygon points="0,150 24,105 236,105 256,150" fill="${SLATE}"/><rect x="0" y="150" width="256" height="230" fill="${GAULT}"/>
    ${rng(3, r => rng(5, k => sash(22 + k * 48, 168 + r * 52)))}
    ${rng(5, k => `<path d="M${18 + k * 48},378 V340 a14,16 0 0 1 28,0 V378 Z" fill="#3f4650"/>`)}<rect x="0" y="322" width="256" height="6" fill="#c9b78b"/>
    
    <rect x="256" y="120" width="290" height="260" fill="${MUSTARD}"/><polygon points="256,122 336,30 416,122" fill="${MUSTARD}"/>
    <path d="M256,122 L336,30 L416,122" fill="none" stroke="#b8913f" stroke-width="10"/>
    <polygon points="400,122 430,62 546,62 546,122" fill="${TILE}"/>${rng(2, k => `<rect x="${452 + k * 48}" y="72" width="26" height="30" fill="#e9e2d0"/><rect x="${456 + k * 48}" y="78" width="18" height="20" fill="#3f4650" stroke="none"/>`)}
    ${sash(322, 120, 28, 34)}${rng(3, r => rng(4, k => sash(270 + k * 70, 175 + r * 52, 24, 32)))}
    <path d="M300,300 v-28 a18,22 0 0 1 36,0 v28 Z" fill="#3f4650"/><rect x="420" y="330" width="120" height="50" fill="#2f2b28"/>
    
    <rect x="560" y="52" width="250" height="40" fill="#a9b3b8"/>${rng(10, k => `<path d="M${566 + k * 25},52 V92" stroke="#7d878d" stroke-width="2"/>`)}<path d="M556,50 H814" stroke="#4a4f55" stroke-width="3"/>
    
    <polygon points="546,98 560,80 990,80 1004,98" fill="${TILE}"/><rect x="546" y="98" width="458" height="282" fill="${RED}"/>
    ${rng(3, r => rng(7, k => `${sash(560 + k * 56, 150 + r * 56, 22, 30)}<rect x="${557 + k * 56}" y="${182 + r * 56}" width="28" height="6" fill="#4f7a3a" stroke="none"/>`))}
    ${rng(2, k => `<rect x="${640 + k * 200}" y="98" width="40" height="34" fill="${RED}"/><polygon points="${636 + k * 200},100 ${660 + k * 200},76 ${684 + k * 200},100" fill="${TILE}"/>${sash(650 + k * 200, 104, 20, 22)}`)}
    <rect x="560" y="352" width="400" height="28" fill="#2f2b28"/>
    <path d="M556,334 H964 L956,354 ${rng(10, k => `Q${946 - k * 40},364 ${936 - k * 40},354`)} Z" fill="${TEAL}"/>
    
    <rect x="1004" y="60" width="436" height="320" fill="${RED2}"/><polygon points="1004,62 1030,20 1440,20 1440,62" fill="${SLATE}"/>
    ${rng(3, k => `<polygon points="${1250 + k * 62},62 ${1272 + k * 62},26 ${1294 + k * 62},62" fill="${RED2}"/>${sash(1262 + k * 62, 38, 18, 20)}`)}
    ${rng(3, r => rng(4, k => sash(1290 + k * 36, 110 + r * 62, 20, 30)))}
    ${[[1050, 210, 95, '#9aa64a'], [1150, 170, 110, '#c9a23e'], [1230, 230, 80, '#7f9440'], [1100, 270, 80, '#b8a03e']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('')}
    <path d="M1130,380 V250 M1180,380 V260" stroke="#5a4636" stroke-width="10"/>
    
    <rect x="0" y="378" width="1440" height="42" fill="#8f8a80"/>${rng(6, k => `<path d="M0,${384 + k * 6} H1440" stroke="#7d786f" stroke-width="1.4"/>`)}
    <path d="M0,350 H1440 M0,366 H1440" stroke="#2b2b2e" stroke-width="2"/>${rng(48, k => `<path d="M${k * 30},350 V378" stroke="#2b2b2e" stroke-width="2"/>`)}
    <rect x="330" y="300" width="110" height="78" fill="#f2efe8"/><polygon points="322,302 385,262 448,302" fill="${SLATE}"/>${sash(352, 318, 26, 24)}${sash(396, 318, 26, 24)}
    ${[60, 470, 860, 1180].map((x, i) => `<path d="M${x},400 H${x + 200} L${x + 190},414 H${x + 10} Z" fill="${['#2d3e5c', '#3a3f48', '#2d3e5c', '#43373a'][i]}"/>`).join('')}`, 1.5)}`);
};

/* ---------- the punt: the boat that crosses the river ---------- */
const punt = art(28, 15, wc(`
  <path d="M10,120 H270 L262,134 H18 Z" fill="#2b3346"/><rect x="10" y="112" width="260" height="10" fill="#8a6a48"/>
  <rect x="206" y="104" width="60" height="10" fill="#a8835a"/>
  ${[[40, '#c8423a'], [80, '#3f6fb5'], [120, '#e0b13e'], [160, '#4f8a5a']].map(([x, c]) => `<path d="M${x - 14},114 Q${x},86 ${x + 14},114 Z" fill="${c}"/><circle cx="${x}" cy="82" r="9" fill="#5a4636"/>`).join('')}
  <path d="M232,104 V60 Q232,52 240,52 Q248,52 248,60 V104 Z" fill="#2f3b52"/><circle cx="240" cy="42" r="9" fill="#5a4636"/>
  <path d="M258,4 L196,148" stroke="#c9b38a" stroke-width="4" stroke-linecap="round"/><path d="M246,64 L252,30" stroke="#2f3b52" stroke-width="6" stroke-linecap="round"/>`, 1.4));

// an autumn tree on the far bank, with a cross-slot fin for depth
const tree = (c1, c2) => art(18, 24, wc(`<path d="M86,240 V140 M94,240 V150" stroke="#5a4636" stroke-width="10"/>
  <circle cx="90" cy="90" r="64" fill="${c1}"/><circle cx="56" cy="120" r="38" fill="${c2}"/><circle cx="128" cy="118" r="40" fill="${c2}"/><circle cx="96" cy="44" r="34" fill="${c2}"/>`, 1.4));
const mooredPunt = c => art(22, 3.5, wc(`<path d="M6,14 H214 L206,32 H14 Z" fill="${c}"/><rect x="6" y="8" width="208" height="8" fill="#8a6a48"/>`, 1.3));

export default await riverLandmark({
  title: 'Cambridge',
  subtitle: 'Punting on the Cam',
  place: {en: 'CAMBRIDGE', sub: 'Punting on the Cam', zh: '剑桥 · 下午 16:06', eyebrow: '16:06 · Cambridge'},
  backdrop,
  hero: {facade: front, note: '康河边的老房子：浅黄砖的排屋、芥末黄的山墙小楼、红砖楼下一排青绿色遮阳篷。'},
  boat: {art: punt, w: 36, h: 36 * 15 / 28},
  traveller: {pose: 'camera', line: '这里是剑桥。康河上撑篙的小船一条接一条，下次我也要试着撑一回！'},
  ground: {grass: '#cdbfa6', grassD: '#bfae92', river: '#6f817d', bank: '#d9d1c2', bankLine: '#c6bca9', path: '#bdb2a0', bed: '#8fa36a'},
  memory: {photo: new URL('photo.jpg', import.meta.url), kind: 'polaroid', caption: 'Cambridge · 2026', back: ['Cambridge', 'Travel memory'], note: '记忆卡翻过来了：学院里的那棵苹果树。'},
  extras: [
    {id: 'treeL', type: 'stand', X: -86, Z: -27, art: tree('#9aa64a', '#c9a23e'), cross: 8},
    {id: 'treeR', type: 'stand', X: 84, Z: -28, art: tree('#7f9440', '#b8a03e'), cross: 8},
    {id: 'puntA', type: 'stand', X: -50, Z: -17, art: mooredPunt('#2d3e5c')},
    {id: 'puntB', type: 'stand', X: 46, Z: -17, art: mooredPunt('#3a3f48')},
    {id: 'lamp', type: 'stand', X: -62, Z: 30, art: lamp(26), artLit: lamp(26, true)},
  ],
  // the light holds at afternoon (the photo's light) for the first third, then goes golden and into the evening; the
  // still stops with the punt in the middle of the river, still in the afternoon
  clock: [16 * 60, 20 * 60], lights: ['afternoon', 'afternoon', 'golden', 'evening'],
  shot: {time: .42},
  card: {heading: 'Punting on the Cam', place: 'Cambridge, United Kingdom', stamp: 'CAMBRIDGE|UNITED KINGDOM', focus: '50% 72%'},
});
