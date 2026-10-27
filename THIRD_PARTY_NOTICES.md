# 第三方依赖与素材范围

本项目的 MIT 授权仅适用于本仓库自行提供的代码与文档。第三方软件、字体、用户照片、参考作品和生成结果不因使用本项目而改为 MIT。

| 组件 | 使用方式 | 上游许可与来源 |
|---|---|---|
| Playwright 1.63.0 / playwright-core | npm 安装，不随仓库分发源码包 | Apache-2.0；https://github.com/microsoft/playwright/blob/main/LICENSE |
| Chromium | 由 Playwright setup 下载，不随仓库分发 | 使用下载包所附许可证及第三方声明；https://www.chromium.org/chromium-projects/ |
| Courier Prime | Google Fonts 远程加载；不附字体文件 | SIL Open Font License 1.1；https://github.com/google/fonts/blob/main/ofl/courierprime/OFL.txt |
| Noto Serif SC | Google Fonts 远程加载；不附字体文件 | SIL Open Font License 1.1；https://github.com/notofonts/noto-cjk/blob/main/Serif/LICENSE |

重新分发依赖、浏览器或字体文件时须保留其上游许可证及必要声明，不能只附本项目 MIT。浏览器自己的第三方组件遵守各自许可；Apache-2.0/OFL 不要求给普通图片输出套用软件或字体许可。

`licenses/` 保存 Playwright 的许可证与 NOTICE，以及两种字体的许可证作为来源记录。系统备用字体由用户环境提供，本项目不分发。

本发行版不包含 three.js、旧 3D 引擎、照片或示例图片。外部模型需另行核对当前服务条款；项目不打包模型权重，也不对输出的版权性、独占性或第三方权利作保证。

每次任务的素材来源放在其私有工作目录 `sources.json`，不要将用户照片、人物参考、授权文件或完整日期自动提交进本仓库。
