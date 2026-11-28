# Ollama 排障双语入口

新增中英文 `ollama-troubleshooting/` 规范页，按连接失败、查不到标签、HTTP 404 分流客户端排障。互相提供语言切换，进入站点地图。在首页把原创指南按「安装与排障」「接入与模型配置」分组，保留旧入口。已收录的英文安装指南（本日 Search Console 已核实）及中文安装页加同语种正文链接。安装页继续负责首次运行和端点检查，OpenAI 兼容页继续负责 SDK 模式和详细请求示例。新页重点是把故障定位到客户端实际访问的服务、模型标签或请求路径。

## 搜索选题

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=ollama%20connection%20refused,ollama%20model%20not%20found,ollama%20api%20not%20working,ollama%20troubleshooting&hl=en) 的 [CSV](2026-11-28-ollama-troubleshooting-trends.csv) 取 52 个完整周，排除 11 月 22 日部分周。ollama troubleshooting 有 28 周非零或低于 1，均分上界 25.69，11 月 15 日为 2。ollama model not found 为 3 周、均分上界 1.98，ollama api not working 为 1 周、上界 0.46，精确 connection refused 样本均为零。英文宽词决定标题，具体错误服务于解决任务。指数只能同图比较。中文页服务现有中文安装内容，没有估算中文月搜索量。

[Ollama 官方排障](https://docs.ollama.com/troubleshooting) 覆盖服务日志和显卡问题，[Open WebUI](https://docs.openwebui.com/troubleshooting/connection-error/) 已有特定客户端排障。新页提供两套 Ollama 服务的同版本、不同标签对照，并把具体下一步连到已有本地实践。

## 实测

Apple M4、macOS 26.4.1 arm64、Ollama 0.40.18，临时 HOME、独立模型目录、仅允许回环。两进程的 /api/version 都是 200 和相同版本，一端有 Qwen 测试模型，另一端标签返回空列表。对同一正确服务，/v1/api/tags 返回纯文本 404，/api/chat 请求缺失标签返回带模型名的 JSON 404。正确的 /v1/models 与聊天均成功。关闭空服务后，版本探测得到 curl 7 且没有 HTTP 响应。发布两进程的精简观察结果。Docker 地址与网络边界来自 [官方说明](https://docs.docker.com/desktop/features/networking/#use-cases-and-workarounds)，本轮未执行容器实测。

两版原生 SVG 都用本语言分流到对应正文。另提供成功接通后的 GPU、上下文、内存和驻留指南。

localhost 在 390px、1440px 逐语言检查首页分组到实际页面的链接、首答、规范地址、决策树键盘高亮、缩放与章节跳转、证据下载字节和全页无溢出。禁用 JavaScript 仍可读命令并跳转。

## 正式交付

内容提交 `9bd94f2` 干净归档通过 93 项测试。站点检查覆盖 72 个 HTML、71 个首页可达地图页和 402 处资源引用。预览双语页及证据与归档一致。北京时间 13:22，Worker `1a8e79f3-f9bb-47be-9a03-759e1f101e95` 承接 100% 流量。正式域 10 个相关路径均 HTTP 200，与归档逐字节一致，使用直接 HTTP 核对。

[Search Console 的站点地图](https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fai.ipunk.cn%2F) 仍显示上次成功读取为 11 月 25 日，发现 33 页。上线后分别使用网址检查，中英文新页都显示暂未识别。曝光与点击尚未验证。
