# 给图像模型的提示词

## 输入

1. **用户的照片**：预处理以后的 `photo.jpg`（已经去掉 GPS 等元数据）。同一个地方的其他照片可以一起附上，用来补背景和细节。
2. **布局参考图**（可选）：仅附用户自有或明确获准用于模型参考的图片，先去元数据。只提取页面布局、纸片层次和折叠关系，不复制具体插画、角色、配色组合、文字或纸模展开图。没有获准参考图时，仅使用下方文字提示。
3. **人物参考**（可选）：优先使用用户上传的明显自拍或明确人物参考照，提取发型、服装和配饰；风格参考图中的人物不决定用户小人的外观。多人合照无法确定主角时先询问。人物参考也须先去除元数据。

## 模板

用英文写提示词，花括号里的部分换成第 2 步读照片得到的内容：

```
A handmade paper pop-up book lying open on a plain cream paper surface (#efe6d4), seen from a low camera almost
level with the book and straight in front of it, the whole book in frame, 16:9.

Inside the book, recreate the scene in the attached photo as a paper-craft pop-up: {SCENE}. The main subject {HERO}
stands up as cut card across the middle of the spread; the distant skyline {BACKDROP} is a paler layer behind it;
the page itself is printed with {GROUND}. Foreground: a small cartoon traveller based on {TRAVELLER_LOOK} and {PROPS}, standing as
little cut-outs.

Style: hand-drawn watercolour with fine ink outlines, white paper edges on every cut piece, soft shadows, like a
fine hardback pop-up book. Optional reference images inform only page layout and fold relationships, never their specific artwork or characters. Use the photo's own colours and light: {LIGHT}.

Preserve the source architecture, silhouette, proportions and colours. Do not invent landmarks or add decorative objects absent from the photo. Show visible card edges, crease lines and attached folding returns; avoid a solid miniature-city appearance.
No photorealistic people's faces, logos, transit roundels, brand names, text, letters, signs or watermarks anywhere. The background
around the book is the same plain cream paper.
```

| 占位 | 填什么 | 例：剑桥 | 例：塔桥 |
|---|---|---|---|
| `{SCENE}` | 一句话的场景 | the river front of gault-brick and red-brick buildings on the River Cam, with punts on the water | Tower Bridge over the Thames at night |
| `{HERO}` | 主角和它的标志细节 | a row of buildings: a pale gault-brick terrace with arched ground-floor windows, a mustard gabled house, a red-brick block with rows of white windows and teal awnings, autumn trees, a small white punt hut on the quay | both Gothic towers, the high walkway and the two chain spans, lit white along their outlines, the underside of the walkway blue |
| `{BACKDROP}` | 远景 | a college skyline: a domed octagonal turret, a chapel with pinnacles, a battlemented brick tower | the dark city skyline with a few lit windows |
| `{GROUND}` | 底页 | the grey-green river with a punt and its punter, a stone quay, a paved promenade with a flower bed | the dark river with ripples of reflected light, a stone embankment |
| `{PROPS}` | 照片中实际可见且有必要的前景小物；可留空，不为填空添加物件 | a street lamp, a bench, two planters, a bicycle | a Victorian street lamp, the embankment railing |
| `{TRAVELLER_LOOK}` | 有明确人物参考时填其发型、发色、肤色、服装、包和配饰；无参考时填 a simple generic traveller, with no fixed gender or outfit | 按用户人物素材填写 | 按用户人物素材填写 |
| `{LIGHT}` | 照片的光线 | soft late-afternoon sun under a cloudy sky | night, the bridge and windows lit warm and white |

## 规则

- **不要让模型写字**：模型写的字容易错，也容易带出商标。标题、地点、日期都由 `card.mjs` 印。不默认生成 TfL 圆环或其他品牌标志；需要站名时由脚本用普通文字排印，不仿官方标识。
- **背景要纯米色**：`card.mjs` 会把 `popup.png` 左上角的颜色校正成卡片的纸色，背景越干净，书和纸底接得越自然。
- **视角**：低机位、正对书，和参考图一样。
- **人物依据用户素材**：若用户上传的素材中有明显自拍或明确的人物参考照，以该人物的发型、发色、肤色、服装、包和配饰为基础，简化成纸艺卡通小人；不套用固定性别、发型或服装，不画写实人脸。普通路人不作为用户形象；多人合照无法确定主角时先询问。没有人物参考时用简洁通用的旅行小人。
- **尺寸**：16:9，至少 2160 × 1215；放进页面文件夹，命名 `popup.png`。

## 生成后检查

- 有没有能认出的人脸、商标、文字（包括乱码）？
- 主角的标志细节在不在？颜色、光线和照片对得上吗？
- 有明显自拍或人物参考时，小人的发型、服装和配饰是否与其一致？有没有误用路人或风格参考图中的人物形象？无人物参考时是否使用简洁通用形象？
- 背景是不是纯米色，书是不是完整在画面里？

有一项不对就重新生成，或者改提示词再生成。

- 原照片的建筑比例、塔顶数量和街道关系是否保留？参考是否只影响布局而没有复制独特插画？
- 纸片折线、切边和连接是否可见？是否误成实体微缩城市？视觉概念不等于经过验证的可制作结构。
