# Pop-up-book · 照片转纸艺立体书分享图

将用户照片转换为 AI 辅助生成的纸艺立体书视觉效果，再合成“原照片 + 立体书”的分享图。包含提示词、照片预处理和排版脚本；需要宿主环境提供图像生成能力，不包含模型服务或 API 密钥。不保证固定耗时或真实可制作的折纸结构。

## 安装

Claude Code：

```bash
git clone https://github.com/trista977/Pop-up-book ~/.claude/skills/popup-page
cd ~/.claude/skills/popup-page
npm install
npm run setup
```

Codex 可把仓库安装到 `~/.codex/skills/popup-page`；其他支持 `SKILL.md` 的工具按其技能目录安装。需要 Node 18+、Playwright Chromium；HEIC 可通过 macOS sips、heif-convert 或 pillow-heif 转换。

## 使用

对助手说“用这张照片做一张立体书分享图”。助手按 [SKILL.md](SKILL.md) 预处理、调用可用生图工具、检查并合成 `card.png`。

```bash
mkdir -p popup-pages/my-trip
cp /path/to/your-photo.jpg popup-pages/my-trip/photo.jpg
node scripts/make.mjs popup-pages/my-trip
# 按 references/prompt.md 生成 popup.png，再按 references/share-card.md 写 card.json
node scripts/make.mjs popup-pages/my-trip
```

有明确自拍或人物参考时，小人依据用户形象卡通化；无参考时用通用小人。只学习可用参考中的布局和折叠原则，不照搬具体作品。

## 内容与许可

- [SKILL.md](SKILL.md)：流程和使用边界。
- `references/`：生图提示、分享图字段、素材及发布检查。
- `scripts/`：预处理、分享图合成、中文字体检查。
- [LICENSE](LICENSE)：自行提供的代码和文档采用 MIT。
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)：第三方依赖、字体及上游许可。

本项目为自主整理的工作流与脚本，使用第三方开源依赖及 AI 能力；不声称所有组成部分完全自研。仓库不附带照片、书页截图、旧示例或生成图片，不对用户输入、第三方素材和生成输出施加本项目 MIT。使用者须按 [发布检查](references/publishing.md) 确认素材与模型条款；不保证生成图的独占版权或绝无侵权。
