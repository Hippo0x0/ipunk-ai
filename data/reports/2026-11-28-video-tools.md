# 浏览器视频工具入口与组合实测

新增英文 `/en/video-tools/`。按时间／画幅、大小／格式、声音和不确定四种情况引导读者，链接 10 个已经可用的浏览器工具。增加从同一输入到可交付竖屏 MP4 的步骤、逐步测量和最终样片。中英文首页增加入口，Canva、裁剪和 AI 视频选型页增加相关路径。

## 搜索与发现

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=browser%20video%20editor,online%20video%20tools,video%20editor%20no%20upload,local%20video%20editor&hl=en) 美国网页搜索过去一年，去除首尾未满周后覆盖 2025-11-30 至 2026-11-15 的 51 周。同组归一化指数来自页面图表数据。

| 查询 | 完整周均值 | 有信号周 | 最后完整周 |
| --- | ---: | ---: | ---: |
| online video tools | 20.75 | 51 | 5 |
| browser video editor | 1.55 | 35 | 1 |
| local video editor | 2.94 | 36 | 1 |
| video editor no upload | 0.08 | 2 | 0 |

选择通用工具组合做落地页，保留各任务页承接剪辑、压缩等单一意图。Google Trends 指数未用于估算搜索量。新页只首发英文，首页中文链接标明语言。

Search Console 抽查中，英文首页和 Canva 指南已收录。视频压缩与 AI 视频选型页已抓取、尚未收录。剪辑页已发现、未报告抓取。无声检测页尚未被识别。加入新页前，英文首页已直链全部 10 个工具。保持这些直链，新增入口也直链 10 个工具。根首页、英文首页和 Canva 页到各个工具的最短 HTML 路径均保持原长度。新增的是任务选择、组合实测和可抓取的备用导航路线，待后续核对是否带来发现或点击。

## 操作验收

桌面 Chrome 158 在 localhost 用原有 4 秒 640 × 360 合成 MP4（1 条音轨）连续运行 3 个工具。剪取 1–3 秒后得到 2.008 秒、640 × 360、1 条音轨。以居中 9:16 裁剪后为 198 × 352、2.008 秒，保留音轨。删除音轨后得到 198 × 352、2.000 秒、0 条音轨和 8125 字节。音频检测确认无音轨，独立浏览器播放器播放到结束。数字只适用于这份样例。没有用 Canva 生成视频或在 Safari、Firefox 上验证。

在 390 px 和 1440 px 下核对原生 SVG 四分支、键盘高亮、缩放、44 px 链接和正文锚点，下载样例与源文件一致，无 JavaScript 时仍可走到正文。复测复用同样四分支布局的视频音频检测页。

## 发布与地图重读

北京时间 11 月 28 日 16:09，内容提交 `04441ec` 推送到 `main`，Cloudflare Worker `b306ab74-20d8-42f7-a926-7f7b79e913d4` 承接全部流量。98 项测试通过，站点检查覆盖 92 个 HTML、91 个 sitemap 页面和 518 处静态资源引用。预览页和正式域内容均与发布包一致。13 项正式域请求全为 200，响应头未见 noindex。

正式 sitemap 是 HTTP 200、application/xml，解析得到 91 个去重规范网址。Search Console 报表仍对应上次读到的 75 个网址，较本版少 16 个。依据 [Google 的地图改动说明](https://support.google.com/webmasters/answer/7451001?hl=en)，对同一属性的 `/sitemap.xml` 提交当前版一次，回执成功，报告刷新为发现 91 个网页。未提交单页索引请求。

重读后，视频工具入口、视频音频检测、llama.cpp API、LM Studio API 和中英文 OpenCode Shell 权限共 6 个精确 URL 均显示 `Discovered - currently not indexed`，没有最后抓取时间。发现数与收录数分开，后续以页面级抓取和一致口径的曝光、点击复核。
