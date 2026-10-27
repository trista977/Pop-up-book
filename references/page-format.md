# page.js 的格式

`page.js` 默认导出一个对象：

```js
export default {
  title, subtitle,        // 英文标题、副标题（分享图上用）
  cover,                  // 封面 art，可用 simpleCover(title, sub)
  spread,                 // 这一页（见下）
  shot: {lights, pulls, open, view},   // 静态图的状态
  card: {zh, caption, place, time},    // 分享图上的文字
};
```

## 坐标

- **平面世界单位**：
  - X 横跨两页：书脊在 0，左页到 -100，右页到 100。
  - Z 顺着书脊：远边（上）-65，近边（下，靠读者）+65。
  - Y 向上。
- **纸片画图**：`art(w, h, svg)`，w × h 单位，1 单位 = 10 px（SVG 的 viewBox 是 w·10 × h·10）。
- **底页**：2000 × 1300 px 的 SVG，用 `fx(X)`、`fz(Z)` 把平面坐标换成像素。

## spread 字段

| 字段 | 说明 |
|---|---|
| `eyebrow` | “15:00 · Place”，时间 · 地点。看不出钟点就写时段：“Afternoon · Place”，不要编钟点 |
| `title` / `en` | 中文标题 / 英文副标题 |
| `light` | 灯光预设：`morning` `afternoon` `golden` `evening` `night` |
| `lit` | 0 或 1：打开时夜景发光层是否亮 |
| `story` / `todo` | 本页介绍、操作提示（互动版用） |
| `floor` | 底页：`floor(svg)` |
| `floorLit` | 底页的发光层，夜里地面的灯光光斑，用加法混合 |
| `texts` | 印在底页上的字，用画布渲染、字体清晰：`{x, y, text, font, color, align, ls, maxWidth}`；地名卡用 `plateTexts(en, sub, zh)` |
| `pieces` | 纸片（见下） |
| `controls` | 拉片 / 隐藏控制量（见下） |

## 纸片类型

所有纸片都有 `id`、`type`、`art`。

### 通用可选字段

| 字段 | 作用 |
|---|---|
| `artLit` | 夜景发光层，加法混合，只画发光的部分 |
| `artBack` | 背面印的画 |
| `twoSided: true` | 背面印正面的镜像 |
| `tap: (ctx, e) => …` | 点击 |
| `solidHit: true` | 整块矩形都可点，镂空的部分也能点 |
| `ease` | 运动缓动速度 |
| `noCrease: true` | 不在底页上画粘贴折线（在槽里滑的纸片：船、浪片、小人） |
| `driver: '…'` | 一句话说明它靠什么动，写进结构清单（paper-city-popup 的 `docs/structure.md` 就是这样生成的） |

### `stand`：平行折立片

```js
{id, type: 'stand', X, Z, art, w?, h?, yaw?, raise?, Y?, cross?}
```

| 字段 | 说明 |
|---|---|
| `X`, `Z` | 底边中点 |
| `w`, `h` | 显示尺寸，默认等于 art 的尺寸 |
| `yaw` | 转角（度）。0 = 面向读者，合书时向前倒；约 ±78 = 沿街侧墙，合书时向外倒 |
| `raise` | 0…1 立起程度，默认跟着开书；大于 1 往后倒，小于 0 往前翻过水平 |
| `Y` | 底边离页面的高度。只能用在铆在别的纸片上、或盒子顶上的纸片 |
| `cross` | 十字插片：侧翼宽度。侧翼印的是**同一张 art 中间宽 `cross` 的一条**，所以只适合中间有画的东西（树、柱、塔）。中间是空的（A 字支架、拱门）不要用它，改成 `custom` 子件做侧翼，参考塔桥的 `fin` |

合书约束：面向读者的立片，`Z + h ≤ 65`；侧墙要算倒下后的范围，用 `paper-check` 检查。

### `v`：V 折，跨书脊

```js
{id, type: 'v', Z, sigma, wl, wr, art}
```

| 字段 | 说明 |
|---|---|
| `Z` | 折痕和书脊的交点 |
| `sigma` | 粘贴线角度。小于 0 折痕朝读者，向前合；常用 -3 到 -10 |
| `wl`, `wr` | 左右翼宽度 |

`art` 的宽度 = `wl + wr`，左半张画在左翼。

### `box`：箱形折

```js
{id, type: 'box', X, Z, w, d, h, yaw?, faces: {front, back, left, right, top}, inside: '#色'}
```

| 字段 | 说明 |
|---|---|
| `X`, `Z` | 盒底中心 |
| `w` | 宽（车宽），`d` 深（车长），`h` 高 |
| `yaw` | 转角（度）。0 = 车长沿 Z，车头朝读者；90 = 车长沿 X，横着开 |
| `faces` | 各面的 art：`front`、`back` 是 w × h；`left`、`right` 是 d × h；`top` 是 w × d |

`yaw: 90` 时朝读者的是 `left` 面，`-90` 时是 `right` 面。两面都画（一面用 `mirror`），车掉头也不露白。沿路开的车参考西区的 87 路巴士（`trackAt` 给出位置和 yaw）。

可以加 `drag: 'tabId'`，按住它拖动来带动拉片。

### `custom`：自定义姿态

```js
{id, type: 'custom', anchor, art, pose: (s, rise, p) => ({o, x, y})}
```

| 字段 | 说明 |
|---|---|
| `anchor` | `'center'` `'left'` `'right'` `'bottom'`：art 的哪个点放在 `o` |
| `o` | 位置（平面世界坐标） |
| `x`, `y` | 纸片自身 x 轴、y 轴方向 |
| `s` | 纸片状态 |
| `rise` | 0…1 开书程度 |
| `p.open` | 0…1，由 `s.opened` 缓动得到 |
| `parent: 'id'` | 铆在母纸片上：`o`、`x`、`y` 写在母纸片坐标系里（x 沿底边、y 沿立面向上、z 垂直立面向外），随母纸片一起折叠 |
| `parentPart: 0 \| 1` | 母纸片是 V 折时，铆在左翼（0）还是右翼（1）。坐标的 x 从书脊量起（塔桥的塔在 x = ±27） |
| `dial: (deg, ctx) => …` | 绕圈拖动 |
| `tick: (s, dt, ctx) => …` | 每帧调用 |
| `ownLight: true` | `s.on` 时自己发光 |

### `card`：平放的翻盖

用法同 kit 里的 `postcard` / `booklet`。

## controls：拉片

```js
{id, X, Z, dir: [1,0,0], len, init: 0, apply: (v, ctx) => …, tab: {icon, color}, slotW, hidden}
```

| 字段 | 说明 |
|---|---|
| `X`, `Z` | 拉片起点 |
| `dir` | 拉动方向（单位向量），默认朝读者 `[0,0,1]` |
| `len` | 轨道长度 |
| `apply(v, ctx)` | v = 0…1，在这里用 `ctx.set(id, {...})` 改纸片位置或状态 |
| `tab.icon` | `bus` `boat` `meet` `dino` `card` `star` |
| `hidden: true` | 不画拉片，只能通过纸片的 `drag` 或 `dial` 控制 |

## ctx（在 tap、apply、dial、tick 里可用）

| 方法 | 作用 |
|---|---|
| `note(text, e)` | 冒出一句话 |
| `set(id, props)` / `get(id)` | 改 / 读纸片状态 |
| `toggle(id)` | 切换 `s.opened` |
| `tab(id, v)` / `tabV(id)` | 设 / 读拉片位置 |
| `once(key)` | 只在第一次返回 true |
| `hop(id)` | 纸片闪一下 |
| `lights(v \| 'toggle')` | 夜景发光层 |
| `light(a, b, t)` | 在两个灯光预设之间插值 |
| `bong()` / `shutter()` | 钟声 / 快门声 |

## shot：静态图状态

| 字段 | 说明 |
|---|---|
| `lights` | 0…1，发光层亮度 |
| `pulls` | `{tabId: v}`，把拉片拉到某个位置 |
| `open` | `['id', …]`，这些纸片的 `s.opened` 设为 true |
| `view` | 镜头：`{az, pol, r, target}`，见下 |

静态图的光线：开书时是 `spread.light`；`shot.pulls` 会跑一遍对应控制量的 `apply`，`apply` 里的 `c.light(...)` 覆盖它；最后 `shot.lights` 覆盖 `apply` 里的 `c.lights(...)`。所以最终看到的是“拉到 `pulls` 那一刻的光线 + `shot.lights` 的灯”。

`view` 各项：

| 项 | 说明 | 常用值 |
|---|---|---|
| `az` | 水平转角（度） | 0 = 正对书 |
| `pol` | 俯角，离竖直方向的角度（度） | 70（默认，低机位正对书，分享图用）；42–52 是从上往下看 |
| `r` | 距离，是“刚好装下整本书”的倍数 | 1（默认） |
| `target` | 看向的点（世界坐标，单位米，页面宽 1） | `[0, .12, 0]`（默认） |

## kit.js 工具

画法工具（`art`、`wc`、`rng`、`rand`、`lg`、`cloud`、`lamp`、`grain`、`traveller`、颜色常量）来自 `engine/paper-art.js`，见 [visual-style.md](visual-style.md)。`postcard` 的 `front`/`back` 两张 art 的尺寸要等于它的 `w × h`。

| 工具 | 作用 |
|---|---|
| `fx` `fz` `floor` `pageBg` | 底页 |
| `plateBox` `plateTexts` | 左下角地名卡 |
| `mirror` `flipY` | 左右 / 上下翻转一张 art |
| `wcCrisp(svg, k)` | 水彩滤镜，但把 `<text>` 和 `<!--C-->…<!--/C-->` 包住的部分留在滤镜外 |
| `loadPhoto(url)` | 把照片读成 data URL，可以画进 SVG |
| `me(X, Z, pose, line, look?)` | 旅行小人，pose：`wave` `hello` `point` `map` `camera` |
| `station(X, Z, name, time)` | 旧伦敦地铁站牌工具（含品牌形状，不默认调用；优先自绘普通文字牌）：`name` 是离这里最近的真实车站，`time` 印在站牌下的小牌上，写和地名卡一致的时间或时段（如 `15:00`、`Dusk`），没有就写 `''` |
| `postcard` `booklet` `volvelle` | 小机关 |
| `simpleCover(title, sub)` | 封面 |
