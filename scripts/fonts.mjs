/* Which Chinese font a page will be drawn with. The viewer and the share card load Noto Serif SC from Google Fonts;
   offline they fall back to a system Chinese serif, and on a machine with neither, Chinese text comes out as boxes.
   fontCheck runs in the browser page (page.evaluate(fontCheck)) and returns 'web', 'system' or 'none'. */
export const fontCheck = async () => {
  await document.fonts.ready;
  if ([...document.fonts].some(f => f.family.replace(/["']/g, '') === 'Noto Serif SC' && f.status === 'loaded')) return 'web';
  const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d');
  const draw = ch => { g.clearRect(0, 0, 40, 40); g.font = '32px serif'; g.fillText(ch, 2, 34); return g.getImageData(0, 0, 40, 40).data.join(); };
  return draw('伦') === draw('') ? 'none' : 'system';     // U+E000 has no glyph anywhere: it draws the missing-glyph box
};
export const fontNote = r => r === 'none'
  ? 'WARNING: no Chinese font: Google Fonts is unreachable and this machine has no Chinese font, so Chinese text is drawn as boxes. Connect to the internet, or install one (Debian/Ubuntu: apt install fonts-noto-cjk), and run again.'
  : r === 'system' ? 'note: Google Fonts is unreachable; Chinese text uses a system font (it may look different from the examples).' : '';
