---
name: popup-page
description: 把一张照片变成一页纸艺立体书，并输出一张适合社交分享的图（上面是原照片，下面是立体书页）。当用户上传照片并说“做成立体书”“变成一页立体书”“pop-up 页”“立体书分享图”，或想把旅行照、街景、建筑、风景照做成纸艺立体页时使用。Turn one photo into a paper pop-up book page and a share image (photo above, pop-up page below).
---

# 照片 → 立体书分享图

输入用户的照片，输出 `card.png`：上面是原照片，下沿撕纸边，右边一枚邮戳；下面是一本摊开的纸艺立体书，照着照片里的场景做成；底部写 PLACE 和 DATE。立体书那张图由**图像模型**生成，其余由脚本完成。耗时取决于模型与环境，不承诺固定出图时间。

这是 AI 生成的纸艺立体书视觉效果，不是可制作的折纸图纸；不承诺实际可折叠、输出独占性或零版权风险。仓库不附带照片、第三方书页截图或示例生成图。

## 准备

- `$SKILL` 指这个 SKILL.md 所在的文件夹。命令在用户的工作目录里运行。
- 需要 Node 18+ 和带 Chromium 的 Playwright：`cd $SKILL && npm install && npm run setup`（只要一次）。
- iPhone 的 HEIC 照片：macOS 自带的 `sips` 就能转；其他系统装 `heif-convert` 或 `pip install pillow-heif`。
- 使用当前环境可用的参考图生图工具；若没有可用工具，先说明缺失能力，不把照片发送给未确认的服务。外部模型的调用方式、费用和素材使用条款须单独确认。

## 流程

### 1. 建文件夹，预处理照片

```bash
mkdir -p popup-pages/<slug> && cp <照片> popup-pages/<slug>/photo.jpg     # 或 photo.heic
node $SKILL/scripts/make.mjs popup-pages/<slug>
```

文件夹里还没有 `popup.png` 时，`make.mjs` 只做预处理：
- HEIC 转成 JPG；
- 把拍摄日期（只取年月日）记进 `photo-meta.json`；
- 删掉照片的全部元数据（GPS、机型等）；
- 缩到长边 1600 px。

**预处理之后才能把照片交给图像模型**，免得把位置信息一起发出去。照片长边小于 1000 px 会有警告：分享图上会糊，请用户发原图。

### 2. 读照片

写下这几项，生图和写字都要用：

| 项 | 例：剑桥 |
|---|---|
| 主角 | 康河边的一排砖楼和撑篙船 |
| 地点（只到地标级别） | Cambridge, United Kingdom |
| 光线 | 下午的阳光，多云 |
| 标志细节（3–6 个） | 浅黄砖排屋、芥末黄山墙楼、红砖楼和青绿遮阳篷、白色撑船小屋、秋天的树 |
| 人物参考 | 有明显自拍或人物参考照时，记录发型、服装和配饰；路人不作为用户形象 |
| 要避开的 | 近处船上能认出脸的游客；车身、广告上的公司标志 |

认不准的建筑不写名字。

### 3. 生成立体书图 `popup.png`

用 [references/prompt.md](references/prompt.md) 的提示词模板，填进第 2 步的内容。附上预处理后的照片。风格参考是可选项，仅使用用户自有或明确获准用于该用途的图片；不得抓取 Pinterest 书页或从第三方作品裁出角色。只借鉴布局与折叠原则，不复刻具体插画、文字或展开图。

- 要求：16:9，至少 2160 × 1215；背景是纯米色纸面；**图里不要任何文字**。
- 生成后**打开看**：路人的脸、商标、乱码文字、小人对不对、颜色和光线跟照片是否一致。不对就重新生成。

### 4. 写 `card.json`，合成分享图

```json
{"title": "Cambridge", "heading": "Punting on the Cam", "place": "Cambridge, United Kingdom", "stamp": "CAMBRIDGE|UNITED KINGDOM", "focus": "50% 85%"}
```

```bash
node $SKILL/scripts/make.mjs popup-pages/<slug>
```

字段见 [references/share-card.md](references/share-card.md)。`focus` 用来调照片的裁切：避开路人、商标，露出主角。

### 5. 发布前检查

打开 `card.png`，按 [references/publishing.md](references/publishing.md) 过一遍：照片版权、商标、事实、隐私（路人、地点、票据）、AI 标注。拿不准的问用户。

### 6. 交付

给用户 `card.png`，并说明：
- 照片里哪些地方我做了处理（裁掉了路人、没画商标）；
- 需要用户确认的地方（时间、地点、照片里的人）；
- 发布时在平台上勾选“内容含 AI 生成”。

## 硬规则

- **输入权利**：按 [references/publishing.md](references/publishing.md) 记录每张照片、人物图和参考图的来源与授权；署名不能替代许可。自拍人物规则保留，第三方人物需有相应授权。
- **人物依据用户素材**：若用户上传的素材中有明显自拍或明确的人物参考照，以该人物的发型、发色、肤色、服装、包和配饰为基础，简化成纸艺卡通小人；不套用固定性别、发型或服装，不画写实人脸。普通路人不作为用户形象；多人合照无法确定主角时先询问。没有人物参考时用简洁通用的旅行小人。
- **不复刻商标和别人的原画**；图像模型生成的图里不要文字，字都由 `card.mjs` 印。
- **地点只到地标级别**，不写住处、日期以外的行程；提醒用户离开后再发。
- **AI 标注**：分享图上的“立体页由 AI 辅助绘制”不去掉。

## 文件

```
SKILL.md                    本文件
references/prompt.md        给图像模型的提示词模板
references/share-card.md    分享图版式和 card.json 字段
references/publishing.md    发布前检查
scripts/make.mjs            预处理照片；有 popup.png 时合成分享图
scripts/card.mjs            合成 card.png
scripts/fonts.mjs           中文字体检查
THIRD_PARTY_NOTICES.md      依赖、字体及其许可
```
