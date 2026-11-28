# Ollama OpenAI 兼容 API 实测

规范页为 `/en/guides/ollama-openai-compatible-api/`。读者在同一台机器上通过 OpenAI Python SDK 连接 Ollama，列出精确标签并发送最小请求，再根据连接错误、HTTP 404 或不确定状态进入对应步骤。本地模型入门负责安装和启动，OpenCode 指南负责模型发现，Ollama 上下文指南负责核对已加载长度。中英文首页和两篇英文指南加入普通 HTML 入口，新增路径进入站点地图。本轮采用美国英语研究，中文首页入口注明英文。

## 需求和竞争

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=ollama%20openai%20compatible,ollama%20api%20key,ollama%20api%20example,ollama%20connection%20refused&hl=en)为美国、Web、过去 12 个月。同组官方 [CSV 导出](2026-11-28-ollama-api-trends.csv)中，排除 11 月 22 日尚未完整的一周后有 52 条。以下为算术平均及 11 月 15 日一周的相对值。

| 查询 | 均值 | 最新完整周 |
| --- | ---: | ---: |
| ollama openai compatible | 22.9 | 1 |
| ollama api key | 21.2 | 7 |
| ollama api example | 7.0 | 0 |
| ollama connection refused | 0.0 | 0 |

近期信号稀疏，零值可能表示低于报告阈值。OpenSEO 余额不足，未取得月搜索量、KD 或付费排名快照。美国英语查询竞争样本含 [Ollama 官方兼容文档](https://docs.ollama.com/api/openai-compatibility)、[Chat Endpoint Example](https://ollamaapidocs.com/ollama-docs-chat-endpoint-example/) 和 [Developers Digest API 参考](https://www.developersdigest.tech/reference/api-compatibility/ollama)。已有资料提供 SDK、curl、路径和基础故障说明。新增价值来自同一 SDK 和实例的两种 404 对照、真实响应下载与可执行分流。样本未固定城市、未确认排名，也不能预测站点点击。

同期 Search Console 精确资源 `https://ai.ipunk.cn/`，final Web 按日期请求 10 月 29 日至 11 月 26 日，实际最新完整行为 11 月 25 日。11 月 19–25 日合计 21 次曝光、0 次点击。独立按页面读取的区间中，英文 OpenCode 项目页 18 次曝光、0 次点击。MarkItDown、Runway、Sora 网址检查当时均显示 Google 尚未识别。上述数据早于本次交付。

## 实测与范围

macOS arm64，复用已有 Qwen2.5-0.5B-Instruct Q4_K_M GGUF，使用独立 Ollama 0.40.18 实例、临时模型别名和非默认回环端口。OpenAI Python SDK 3.60.0 在隔离环境安装后，实例与客户端在仅允许回环网络的进程策略下运行。Ollama 云功能禁用。无用户输入或凭据。

先列出 `/api/tags` 和 `/v1/models`，二者均出现 `ipunk-small:latest`。随后以相同短提示、温度 0 和 16 token 上限发送无 Authorization 头的 HTTP 请求及使用占位值的真实 SDK 请求。两者均 HTTP 200、返回 `LOCAL_OK`。SDK 的 404 基础地址试验只改变有无 `/v1`，模型试验只改变请求标签。停止独立实例后 SDK 报 `APIConnectionError`。公开记录保留本地响应和 SDK 解析后的结果。单次本地模型试验不涉及其他端点、远程代理、云鉴权或模型能力。来源包括 [Ollama 认证说明](https://docs.ollama.com/api/authentication)。

页面采用英文原生 SVG 分流，沿用站点脚本，仅独立步骤链接跳转。原因是连接故障、HTTP 404、无法确定三种状态需要去不同章节。

localhost 的 390px 和 1440px 验证通过。核对首答、完整图、键盘高亮且不改 hash、放大后独立滚动、三条跳转以及无整页横向溢出。实测浏览器下载与证据文件逐字节一致，禁用 JavaScript 后仍有三条步骤入口和完整代码。发布与正式域验证另记。

## 正式交付

GitHub `main` 的 `8ec3485` 从干净提交归档通过 90 项自动测试。站点检查覆盖 56 个 HTML、55 个可从首页到达的站点地图页面及 304 处静态资源引用。新页和下载证据在 Worker 预览与归档逐字节一致。版本 `4d476717-c7e1-4caf-8259-fd10d28a7708` 在北京时间 11:36 承接 100% 流量，部署 `5ee39579-e05b-4952-8fca-cc0994d9bcfd`。正式域的十个相关路径均 HTTP 200，逐字节符合归档，证据返回 JSON。复核采用直接 HTTP。

[Search Console 网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=vgoRwWz5EuKMOwV7Y1U5hA)显示 Google 当时尚未识别新页。提交一次索引请求后，Google 回执显示已加入优先抓取队列。普通抓取、收录、曝光和点击等待后续数据。
