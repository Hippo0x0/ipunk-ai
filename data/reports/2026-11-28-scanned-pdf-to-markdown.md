# Mac 本地扫描 PDF 转 Markdown

新增英文 `/en/guides/scanned-pdf-to-markdown/`，下载 Swift 工具后可以一次处理含原生文字页、扫描页和混合页的 PDF。输出 Markdown 保留物理页码和每页的文字来源。已有 MarkItDown 页保留直接提取、表格和单页 OCR，新增整份文件处理入口。中英文首页增加入口，中文入口标明正文为英文。

## 需求依据

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=pdf%20to%20markdown,scanned%20pdf%20to%20markdown,pdf%20ocr%20mac,ocr%20pdf%20to%20markdown&hl=en) 美国网页搜索近一年，排除首尾未满周，2025-11-30 至 2026-11-15 的 51 个完整周。指数在同组查询内归一化。

| 查询 | 完整周均值 | 有信号周 | 最晚完整周 |
| --- | ---: | ---: | ---: |
| pdf to markdown | 39.98 | 51 | 10 |
| scanned pdf to markdown | 0 | 0 | 0 |
| pdf ocr mac | 1.78 | 23 | 1 |
| ocr pdf to markdown | 0.49 | 6 | 0 |

通用 PDF 转 Markdown 有持续信号，扫描子查询在这组对比中的观察值很低。选择解决已有页和读者任务中的实际缺口，并用新页实测数据验证内容。Search Console 首轮核对时原 MarkItDown 指南已发现、尚未收录，无单独搜索效果数据。

## 实测结果和限制

- Apple M4、macOS 26.4.1、Swift 6.2.3。用 PDFKit 取文本和渲染，Apple Vision 识别英文印刷体。两种运行方式均通过，分别编译后运行和直接用 `swift` 执行。测试中限制外部网络访问。
- 原三页样例的页 1、2 走文字层，页 3 走 OCR。保留页 2 的两行记录和页 3 的 `SCAN-43`、`72 hours`。强制扫页 2 时，表格行内关联被打散。工具用普通文本块保存识别结果并保留页码。
- 临时混合页同时有文字标题和图片正文。默认提取标题，明确指定 OCR 后恢复图中的编号和时限。空白页会保留页码并提示无文字。已存在的输出、原 PDF 不被覆盖。页码错误与输入缺失时拒绝生成结果。仅公开既有合成样例、两份实际输出和检查摘要。
- 390 px 和 1440 px 在 localhost 检查首答、SVG 三分支、键盘、缩放、正文锚点、资源下载和无 JavaScript 跳转。英文印刷体和这一台 Mac 已验证。手写、其他语言和 Windows／Linux 无实测。

## 发布

北京时间 11 月 28 日 16:36，内容提交 `9d067d2` 推送到 `main`，Cloudflare Worker `3221cfbc-8325-4985-b27b-8999c6558896` 接收全部流量。103 项测试通过，站点检查覆盖 95 个 HTML、94 个 sitemap 页面及 543 处静态资源。预览页一致，正式域 12 项检查均返回 200，正文与发布包逐字节一致，响应头未见 noindex。

Search Console 尚未识别新页。原 MarkItDown 页仍已发现、尚未收录，没有上次抓取时间。新页已进原站点地图，等待常规抓取和实际曝光数据。
