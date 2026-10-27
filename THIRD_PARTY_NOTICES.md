# 第三方依赖与素材范围

本项目的 MIT 授权仅适用于本仓库自行提供的代码与文档。第三方软件、字体、用户照片、参考作品和生成结果不因使用本项目而改为 MIT。

| 组件 | 使用方式 | 上游许可与来源 |
|---|---|---|
| Playwright 1.63.0 / playwright-core | npm 安装，不随仓库分发源码包 | Apache-2.0；https://github.com/microsoft/playwright/blob/main/LICENSE |
| Chromium | 由 Playwright setup 下载，不随仓库分发 | 使用下载包所附许可证及第三方声明；https://www.chromium.org/chromium-projects/ |
| Courier Prime | Google Fonts 远程加载；不附字体文件 | SIL Open Font License 1.1；https://github.com/google/fonts/blob/main/ofl/courierprime/OFL.txt |
| Cormorant Garamond | 互动查看器及 classic 版式远程加载；不附字体文件 | SIL Open Font License 1.1；https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/OFL.txt |
| three.js | 随 engine/vendor/three 分发 | MIT；许可见 engine/vendor/three/LICENSE |
| Noto Serif SC | Google Fonts 远程加载；不附字体文件 | SIL Open Font License 1.1；https://github.com/notofonts/noto-cjk/blob/main/Serif/LICENSE |

重新分发依赖、浏览器或字体文件时须保留其上游许可证及必要声明，不能只附本项目 MIT。浏览器自己的第三方组件遵守各自许可；Apache-2.0/OFL 不要求给普通图片输出套用软件或字体许可。

`licenses/` 保存 Playwright 的许可证与 NOTICE，以及两种字体的许可证作为来源记录。系统备用字体由用户环境提供，本项目不分发。

本发行版恢复 page.js 渲染所需的 three.js 和纸艺引擎，不附原始照片。引擎来自作者的 paper-city-popup，具体提交与文件摘要见 engine/ENGINE.json；three.js 使用 MIT，保留 engine/vendor/three/LICENSE。`assets/examples/cambridge-card.png` 与 `assets/examples/tower-bridge-card.png` 是上一版 README 的合成展示图：照片按原项目说明由作者自摄，纸艺部分由page.js 3D 流程渲染。仅作为本项目效果展示，用于说明当前恢复的 3D 渲染流程，不纳入代码和文档的 MIT 授权；其他使用需另获权利人许可。外部模型需另行核对当前服务条款；项目不打包模型权重，也不对输出的版权性、独占性或第三方权利作保证。

每次任务的素材来源放在其私有工作目录 `sources.json`，不要将用户照片、人物参考、授权文件或完整日期自动提交进本仓库。
