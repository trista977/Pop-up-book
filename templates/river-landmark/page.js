/* 河岸地标 · river landmark — a page made from the layout in layouts/river-landmark.js by filling its five slots.
   Copy this folder to popup-pages/<slug>/, put the photos in it (names and what each needs: SLOTS.md), and replace
   every TODO. Left as it is, every slot shows its labelled placeholder (labels: true), which is how slots.png was made.
   Structure and mechanism stay as the layout has them: the dial on the hero (or a winch on the bank) runs the clock,
   the light and the boat. */
import {riverLandmark} from '../../layouts/river-landmark.js';

export default await riverLandmark({
  title: 'Place',                                   // TODO: English name, also the share card's heading
  subtitle: 'Along the river',
  labels: true,                                     // TODO: delete once the slots are drawn
  place: {en: 'PLACE', sub: 'Along the river', zh: '地点 · 下午', eyebrow: 'Afternoon · Place'},   // TODO: the place card

  // 背景 · backdrop: (lit) => art(192, 30, svg), drawn from ref-backdrop.jpg. Omit for the default skyline.
  // backdrop: lit => art(192, 30, lit ? `…windows…` : `…sky and skyline…`),

  // 主建筑 · hero, drawn from photo.jpg: a long front as a V-fold and/or a tower as a stand with a riveted dial
  // hero: {
  //   facade: lit => art(144, 42, …),                                   // ≤ 42 high
  //   tower: {art: lit => art(12, 56, …), side: 'right', dialY: 39.5,    // dialY: the dial's centre, units up the tower
  //           dial: {d: 6.6, hands: true}, note: '…'},                   // a clock (hands), or {art: wheel, d} for a wheel
  //   note: '…'},

  // 人物 · traveller: colours from ref-person.jpg, never a face
  traveller: {pose: 'camera', line: 'TODO：小人说出这里是哪里。', look: {}},   // look: {hair, knit, knitD, legs, pack, long, shades}

  // 底面 · ground: colours from ref-ground.jpg
  ground: {},                                       // {grass, grassD, river, bank, bankLine, path, bed}

  // 记忆卡 · memory: the real photo memory.jpg, in a Polaroid (1:1) or a postcard (3:2)
  memory: {/* photo: new URL('memory.jpg', import.meta.url), */ kind: 'polaroid', caption: 'Place · 2024', back: ['TODO：背面的一两句话'], note: '记忆卡翻过来了。'},

  clock: [15 * 60, 19 * 60], lights: ['afternoon', 'golden', 'evening'],
  shot: {time: .1},                                 // where the still stops: match the photo's light
  card: {place: 'TODO City, Country', date: '', focus: '50% 50%'},
});
