# Ollama 流式 API 与完成检查

新增英文规范页 `/en/guides/ollama-streaming/`。原生 /api/chat 的 NDJSON、兼容 /v1/chat/completions 的 SSE、协议终止与长度截断各自给出明确检查。已有兼容 SDK 指南、结构化输出指南与双语首页增加入口，中文入口注明英文。英文决策树分流原生、兼容和完成状态不确定。首要操作保留可复制 curl 和双协议的离线 Python 检查器。

## 选题

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=ollama%20streaming,ollama%20stream,ollama%20streaming%20api,ollama%20streaming%20response&hl=en) 和 [CSV](2026-11-28-ollama-streaming-trends.csv) 显示，排除 11 月 22 日部分周后，52 周里 ollama streaming 有 36 周非零或低于 1，均分上界 28.50，最新完整周为 1。ollama stream 为 31 周、16.00、最新 1，ollama streaming api 则为 10 周、2.94、最新 0。相对指数用于明确意图，不能当作月搜索量或站点曝光。

[Ollama 官方 streaming](https://docs.ollama.com/api/streaming) 说明原生 NDJSON，[兼容文档](https://docs.ollama.com/api/openai-compatibility) 对应以 SDK 接入。本页补全相同模型在两种协议的原始响应、usage 事件与结束顺序和两种不完整场景。

## 实测

Apple M4、macOS 26.4.1 arm64、Ollama 0.40.18、本机受限测试服务。导入已核对的 Qwen2.5-0.5B-Instruct Q4_K_M。四次真实 API 调用分别得到原生正常、兼容正常、原生一 token 和兼容一 token 流。正常输出 LOCAL_OK 并 stop，短额度输出 LOCAL 并带 length。兼容路线的空 choices usage 事件在 finish reason 之后、DONE 之前。另在本地副本删除终止记录，检查器拒绝两类提前 EOF。额外检查多行 data 与 CRLF、缺结束空行、缺 finish reason、流内 error 和 UTF-8。公开四个未经改写的合成内容响应、两份可修改模型标签的请求与检查结果。

localhost 在 390px 和 1440px 核对首答、键盘高亮、缩放、分支跳转、表格无横向溢出和资源下载。禁用 JavaScript 后保留命令和链接。原始 SSE 文件末尾空行是终止事件分隔符，发布时按原样保留。

## 正式交付

内容提交 `74f44dc` 的归档通过 93 项测试。站点检查覆盖 74 个 HTML、73 个首页可达地图页、412 处静态资源引用。预览新页和兼容 SSE 逐字节核对。首次查询 Cloudflare 部署状态因连接失败中断，重试完成。北京时间 13:35，Worker 版本 `9b346d10-6035-4ed6-8bc8-9719633a8beb` 承接 100% 流量。正式域 15 个相关路径均 HTTP 200 且与归档逐字节一致，采用直接 HTTP。

[新页 URL 检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=SX82RSxkqt7Y5BKKO1f0eg) 显示 Google 暂未识别。提供链接的兼容指南已收录，上次抓取为当天 03:38 UTC，早于本次更新。新增曝光和点击待完整数据。
