# 缩短 page.js 编写时间

主要成本是看照片后编写与修正 SVG，不是渲染。默认采取以下方式；用户追求精细复原时允许更长创作时间，不承诺固定分钟数。

## 先复用，再定制

1. 只读选中页型、页面格式和对应案例的必要片段，避免每次通读所有示例。
2. 河岸、桥、长立面复用 `templates/river-landmark/page.js` 与固定机关；其他页面先复制 `templates/page.js`。不为新地点重写相同结构、拉片、灯光控制。
3. 一次确定主角和 3–6 个识别细节、纸片位置尺寸、人物外观。先完成主角轮廓和主要体量，再补重复细节；先不要渲染空模板给用户。
4. 主角的轮廓、塔顶、入口、招牌节奏必须来自照片。窗格、石墙和配角街面使用下面的参数化工具；不要为了快给所有城市套同一排房子。
5. 完成可辨认的第一版后一次性检查结构和构图，再统一修正。调整镜头只用 `render.mjs --view az,pol,r`，不重画整页。

## 重复细节工具

`engine/architecture.js` 是 skill 自有的绘图模块，不修改上游引擎。坐标都是 SVG 像素；`facadeStrip` 的 w/h 是书本单位。

```js
import {art, wc} from '../../engine/paper-art.js';
import {windowGrid, masonry, facadeStrip} from '../../engine/architecture.js';

// 在照片对应的自定义轮廓内放重复细节。非矩形轮廓需要 clipPath。
const hero = art(30, 45, wc(`
  <rect x="0" y="80" width="300" height="370" fill="#b8a78c"/>
  ${masonry({x:0,y:80,w:300,h:370})}
  ${windowGrid({x:32,y:120,cols:4,rows:4,w:22,h:34,gapX:42,gapY:40})}
`,1.5));

// 配角立面：只填照片里实际可见的房屋尺寸、屋顶、窗格、色彩。
// b.x / b.w / b.top / b.roofH 等是 SVG 像素；top 从立面顶边向下量。
const row = lit => facadeStrip({w:36,h:36,lit,buildings:[
  {x:0,w:120,top:65,roofH:35,roofKind:'gable',wall:'#b7a68e',cols:2,rows:3,shop:'#34495b'},
  {x:120,w:120,top:40,roofH:20,roofKind:'hip',wall:'#a99b86',cols:2,rows:3,shop:'#9a5359'},
  {x:240,w:120,top:70,roofKind:'flat',wall:'#9c9b88',cols:2,rows:3,shop:'#427e7e'},
]});
```

`windowGrid` 可设 `arched`、`fill`、`frame`；`masonry` 可设砖块尺寸和 `colors`；每栋配角可用 `extra` 添加照片特有的小细节，或 `shop:false` 取消店面。灯光层用 `facadeStrip({...,lit:true})`。不能为了使用组件改变照片里的楼层、比例和轮廓。

## 复杂照片的速度边界

大量独特建筑、非规则轮廓和写实人物服饰仍需要定制绘制。先用复用结构和循环减少代码量；不通过删掉主角细节、直接贴照片或改用图像模型来假称完成。已经完成的同地点 page.js 可以直接改人物、文案、配色和镜头，不从零重画。
