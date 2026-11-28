# MarkItDown 本地 PDF 转 Markdown 与扫描补录

新增英文规范路径 `/en/guides/markitdown-pdf-to-markdown/`，解决 PDF 转出来后如何检查正文、表格与扫描页，再交给 AI 检索。MarkItDown 项目页保留整体评审，并和新指南互链。中英文首页有入口，中文入口标注英文。

复用 11 月 24 日 [OpenSEO 研究](https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/5c3f50ee-1215-471a-9dc6-8c9b03906934)。US/en 宽词 `PDF to Markdown` 第三方估算 3,600/月、KD 22，主要需求是即时转换。精确词 `MarkItDown PDF to Markdown` 约 50/月、KD 0。品牌词 Trends 信号不能借给精确词。11 月 28 日英文竞争样本已有本地 CLI、表格与 OCR 说明及实测比较，未固定城市名次。此次提供可下载的同一三页原件、未改的转换结果、离线 OCR 和检索问题。宽词的量不能作为该指南的流量预估。

使用 ReportLab 和 Pillow 生成三页合成 PDF，在 Poppler 渲染并逐页检查。用独立 PDF 读取确认前两页有文本层、第三页没有。临时 Python 3.13 环境从 PyPI 安装 MarkItDown 0.1.9 的 PDF extra。安装后在禁止外连的进程策略下执行本地 CLI，无 OCR 或云插件。第 1 页 BASIC-52、第 2 页两行表格均保留；第 3 页 SCAN-43 与 72 小时未进入输出。

以 Poppler 150 DPI 渲染第 3 页，再用 macOS Apple Vision 英文识别，输出找回 SCAN-43 与 72 小时。独立比对 PDF 可见文本、Markdown 行和 OCR。公开原 PDF、原始转换、独立 OCR 文本与 Swift 脚本。未实测复杂双栏或其他语言、未将任何文件发送给模型供应商，也未实测检索系统的导入、召回和引用准确率。来源为 Microsoft 的官方 README 与 PDF 转换实现。

localhost 390px 和 1440px 核对首答、原生 SVG 分流、键盘与缩放、章节跳转、下载文件字节和无横向溢出。禁用 JavaScript 后，命令、分流链接及溯源示例仍可用。发布和普通抓取效果另记。

## 正式交付

GitHub `main` 的 `0be2d01` 通过 90 项自动测试。站点检查覆盖 55 个 HTML、54 个可从首页到达的规范页及 299 处静态资源。PDF 样本在 Git 标为二进制，保留实际渲染与转换时使用的文件字节。预览比对通过后，Worker 版本 `580ea345-52d1-46c4-a890-e599d0a3fa33` 于北京时间 11:27 承接全部流量，部署 `dd518d76-a8fb-4df0-9e55-5dbef22d5c65`。正式域 11 个相关路径均 HTTP 200、内容与发布版本一致；PDF 返回 application/pdf。检查采用直接 HTTP。

新页已进入站点地图和站内链接。正式发布时未手工请求索引。同轮 Search Console 对之前的 Runway 和 Sora 页面仍返回未识别，暂未产生可比的上线后效果数据。
