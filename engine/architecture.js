/* Skill-owned SVG authoring helpers. Coordinates are SVG pixels (10 px = 1 book unit).
   Use for repeated details; photo-specific hero silhouettes remain in page.js. */
import {art, wc, rng, rand} from './paper-art.js';
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const finite = (n, fallback) => Number.isFinite(n) ? n : fallback;
export function windowGrid({x=0,y=0,cols=3,rows=3,w=20,h=34,gapX=20,gapY=20,fill='#43545b',frame='#eee6d4',arched=false,lit=false}={}) {
  return rng(rows,r=>rng(cols,c=>{const X=x+c*(w+gapX),Y=y+r*(h+gapY),f=lit?'#f5cc7b':esc(fill);
    return `<g fill="${f}" stroke="${esc(frame)}" stroke-width="2.4">${arched?`<path d="M${X},${Y+h}V${Y+w/2}a${w/2},${w/2} 0 0 1 ${w},0V${Y+h}Z"/>`:`<rect x="${X}" y="${Y}" width="${w}" height="${h}"/>`}<path d="M${X+w/2},${Y+2}v${h-2}M${X},${Y+h*.55}h${w}" fill="none" stroke-width="1.3"/></g>`;
  }));
}
export function masonry({x=0,y=0,w=300,h=300,cellW=30,cellH=16,colors=['#b7a58b','#c7b79c','#a99880'],seed=23}={}) {
  if (!(w>0&&h>0&&cellW>0&&cellH>0&&colors.length)) throw new Error('Invalid masonry dimensions/palette');
  const random=rand(seed);
  return rng(Math.ceil(h/cellH),r=>rng(Math.ceil(w/cellW)+1,c=>{
    const left=Math.max(x,x+c*cellW-(r%2)*cellW/2), right=Math.min(x+w,x+(c+1)*cellW-(r%2)*cellW/2);
    const Y=y+r*cellH;
    return right<=left?'':`<rect x="${left}" y="${Y}" width="${right-left}" height="${Math.min(cellH,y+h-Y)}" fill="${esc(colors[Math.floor(random()*colors.length)])}" stroke="#756b5c" stroke-width=".65"/>`;
  }));
}
export function facadeStrip({w=72,h=40,buildings=[],lit=false}={}) {
  if (!(w>0&&h>0)) throw new Error('Invalid facade size');
  const H=h*10;
  const svg=buildings.map(b=>{
    const x=b.x??0,W=b.w??100,top=b.top??70,rh=b.roofH??35;
    const wall=esc(b.wall??'#b6a58d'),roof=esc(b.roof??'#66747a');
    const cols=b.cols??2,rows=b.rows??3,shopH=b.shopH??75;
    const ww=finite(b.windowW,Math.min(24,W/(cols*2+1))),wh=finite(b.windowH,32);
    const gx=cols>1?(W-30-cols*ww)/(cols-1):0;
    const gy=rows>1?Math.max(4,(H-top-shopH-30-rows*wh)/(rows-1)):0;
    const windows=windowGrid({x:x+(cols===1?(W-ww)/2:15),y:top+18,cols,rows,w:ww,h:wh,gapX:gx,gapY:gy,arched:!!b.arched,lit});
    if(lit)return windows;
    const roofShape=b.roofKind==='flat'?`<rect x="${x}" y="${top-7}" width="${W}" height="9" fill="${roof}"/>`:b.roofKind==='hip'?`<path d="M${x},${top}l${W*.17},-${rh}h${W*.66}l${W*.17},${rh}Z" fill="${roof}"/>`:`<path d="M${x},${top}l${W/2},-${rh} ${W/2},${rh}Z" fill="${roof}"/>`;
    return `<rect x="${x}" y="${top}" width="${W}" height="${H-top}" fill="${wall}"/>${roofShape}<path d="M${x},${top+6}h${W}" stroke="#ded2bb" stroke-width="4"/>${windows}${b.shop===false?'':`<rect x="${x+5}" y="${H-shopH}" width="${W-10}" height="${shopH}" fill="${esc(b.shop??'#355b5a')}"/><path d="M${x+12},${H-5}V${H-shopH+22}Q${x+W/2},${H-shopH-4} ${x+W-12},${H-shopH+22}V${H-5}" fill="#34454b" stroke="#dfc9a4" stroke-width="3"/>`}${b.extra??''}`;
  }).join('');
  return art(w,h,lit?svg:wc(svg,1.4));
}
