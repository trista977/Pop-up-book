---
name: popup-page
description: 将用户照片手绘为 SVG 纸片，通过 page.js 和 three.js 渲染可交互的纸艺立体书，输出 popup.png 与原照片对照分享图 card.png。用于照片转立体书、pop-up 页和纸艺旅行分享图；不是图像模型直接生图流程。
---

# 照片 → 可交互纸艺立体书

默认采用 `照片 → SVG 手绘纸片 → page.js → 3D 渲染 → card.png`，以 README 的剑桥和塔桥示例为画风与构图标杆。不要自动切换到图像模型生图。输出保存在当前工作目录 `popup-pages/<slug>/`：`page.js`、`popup.png`、`card.png`。纸面结构检查是近似检查，不保证实物可制作或完整避碰，不提供裁切图纸。

## 准备

`$SKILL` 为此文件所在目录。需要 Node 18+、Playwright Chromium：在 skill 目录运行 `npm install` 和 `npm run setup`。无中文字体时先解决字体，不交付方框文字。输入 JPG/PNG/WebP；HEIC 由 make.mjs 转换。只在用户工作目录内加工副本，不覆盖原照片。

先按 [素材与发布检查](references/publishing.md) 记录输入来源；不引入未经授权的照片或书页截图。所有生成与渲染在本地完成，不需要图像模型或 API 密钥。

## 编写效率

默认按 [fast-authoring.md](references/fast-authoring.md) 复用页型、机关与参数化建筑细节，先确定主角轮廓和尺寸，再一次性补齐窗格与石纹，避免从零编写整页。不要为了快套用与照片不符的通用建筑。

## 1. 读照片与规划

按 [photo-to-page.md](references/photo-to-page.md) 写简报：主角、时段、3–6 个识别细节、主色和五层布局。保持建筑轮廓、比例、屋顶与窗格节奏，不用通用房子代替照片主角。不确定地点不补写；多处照片合成须说明是旅行记忆拼景。

人物规则：有明显自拍或明确人物参考时，用其发型、发色、肤色、衣服、包和配饰作为卡通小人的基础，填 `traveller.look` 或 `me(..., look)`。不强制蓝毛衣或红包。多人合照主角不明时询问，不取路人为用户形象；没有人物参考时用通用小人。需要超出 look 的衣服轮廓时，在 page.js 中用同一画风自定义人物 SVG，不修改上游引擎。

按 [folds.md](references/folds.md) 列结构位置、尺寸、母件、折叠方向，再按 [mechanisms.md](references/mechanisms.md) 选一个可逆主机关。优先主建筑侧翼、V 折长立面、附着子件；避免几张平墙围出空广场。不要用额外装饰填空，先调整主角大小、层间距与镜头。

## 2. 建 page.js 并绘制

河岸、桥或长立面适用 [河岸地标模板](templates/river-landmark/SLOTS.md)，否则用通用模板：

```bash
mkdir -p popup-pages/my-trip
cp "$SKILL/templates/page.js" popup-pages/my-trip/page.js
cp /path/to/photo.jpg popup-pages/my-trip/photo.jpg
node "$SKILL/scripts/make.mjs" popup-pages/my-trip --prepare-only
```

河岸页改用 `templates/river-landmark/page.js`。模板里的 `../../engine/…`、`../../layouts/…` 导入保持原样，由查看器映射；不要通过 Node 直接 import 浏览器用的 page.js。

按 [page-format.md](references/page-format.md) 与 [visual-style.md](references/visual-style.md) 填写：底页是一整幅连续画；远景淡冷；主角细节、暗面和结构线最清楚；前景不遮挡主角。主建筑和背景手绘，不直接贴照片；原照片仅用于上方对照图或明确的记忆卡。

代码参考：[剑桥](examples/cambridge/page.js)、[塔桥](examples/tower-bridge/page.js)。示例不附原始照片，使用自己的 `photo.jpg`；剑桥记忆卡也用该照片。不可把示例的建筑、人物、时段和交通标识直接套到新地点。

不默认使用 `station()` 或 TfL 圆环；有站名需求时自行画普通文字牌。SVG 文字留在水彩滤镜外，转义 `&`、`<` 等字符；文字适配框宽。背面可见的纸片提供 `artBack` 或 `twoSided`。

## 3. 检查与导出

```bash
node "$SKILL/scripts/make.mjs" popup-pages/my-trip
```

预处理照片 → 检查并重新渲染 page.js → 合成分享图。有 page.js 时不能复用旧 popup.png 代替渲染。报结构问题先改，交付时不用 `--force` 绕过检查。

```bash
node "$SKILL/scripts/render.mjs" popup-pages/my-trip
node "$SKILL/scripts/card.mjs" popup-pages/my-trip
node "$SKILL/scripts/render.mjs" popup-pages/my-trip --serve
```

默认是与 README 相同的米色纸底、低机位、原色纸片和撕纸边分享图；`card.mjs --style classic` 可用旧拍立得版式。镜头从 `shot.view: {az: 0, pol: 70, r: 1, target: [0, .12, 0]}` 起步，再按遮挡和主体占比调整。用 [checklist.md](references/checklist.md) 检查实际图像，不把“0 issues”当成画面质量或实物结构证明。

打开 popup.png 和 card.png，检查主体比例、纸片遮挡、塔尖和书页完整、文字可读、光线一致。画面空时先收紧布局，不随意增加车、卡片、路牌。根据问题修改 page.js 后重渲染。

## 4. 分享图与交付

字段和版式见 [share-card.md](references/share-card.md)。在 page.js 的 `card` 中写文字，或可选 `card.json` 覆盖；`date: ''` 或 JSON 中 `"date": ""` 可不显示日期。没有确认的时间与地点留空。按 [publishing.md](references/publishing.md) 检查素材、隐私和署名，保留 AI 辅助绘制声明。

交付 card.png、popup.png、page.js 和互动版启动命令；说明实际结构与机关、做过的处理以及近似检查的局限，不承诺零版权风险或实物可制作。

引擎来源与版本见 `engine/ENGINE.json` 和 [第三方声明](THIRD_PARTY_NOTICES.md)。优先在 page.js 实现需求；不要为某一页改写 book3d.js、paper-art.js 或 paper-check.js。
