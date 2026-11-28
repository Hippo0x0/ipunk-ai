# Ollama GPU 加载与 CPU 混合读数

新增英文规范页 `/en/guides/ollama-gpu/`。任务是判断一次本地请求用到的模型装载位置，区分空列表、CPU 或混合、完整 GPU 三种走向。中英文首页及首次运行、上下文长度两篇指南加入普通 HTML 链接，中文入口注明英文。既有上下文指南的生成源同步补链接。站点地图增加规范页。

## 需求依据

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=opencode%20vs%20claude%20code,ollama%20tool%20calling,ollama%20structured%20outputs,ollama%20gpu&hl=en)为美国 Web 过去 12 个月。[官方 CSV](2026-11-28-ollama-gpu-trends.csv)排除 11 月 22 日未完整周后保留 52 个数据点。下列表为同图平均值和最近完整周 11 月 15 日。

| 查询 | 平均 | 最新完整周 |
| --- | ---: | ---: |
| ollama gpu | 44.8 | 11 |
| ollama tool calling | 11.4 | 1 |
| opencode vs claude code | 10.0 | 5 |
| ollama structured outputs | 2.7 | 0 |

相对指数不用于估算月搜索量或点击。竞争样本包含 [OllamaLab](https://ollamalab.com/posts/ollama-not-using-gpu/)、[QuantaCloud](https://quantacloud.net/guides/ollama-not-using-gpu/) 和 [iKnowMyMac](https://iknowmymac.com/guides/how-much-memory-does-ollama-use-mac)，已覆盖处理器字段和常见故障。页内增量为同一机器、模型、上下文的三路对照，同时公布 CLI、API、Metal 和卸载层记录。样本未固定城市或确认排名。

## 实测

Ollama 0.40.18、Apple M4、macOS arm64，复用官方 Qwen2.5-0.5B-Instruct Q4_K_M GGUF。独立模型目录和回环服务，外部连接禁用。每次检查已卸载，随后对同一标签发送相同短提示，固定 4096 上下文、温度 0 与最多 24 生成 token。唯一实验变量是 `options.num_gpu`，分别省略、设为 0、设为 5。三个回复都为 LOCAL_OK。

默认得到 100% GPU 和 25/25 层，设 0 得 100% CPU 和 0/25 层，设 5 得 63%/37% CPU/GPU 和 5/25 层。用 `/api/ps` 的字节数独立核对处理器比例。五层约占层数 20%，API 显示的 GPU 内存占比约 37%。启动日志确认 Metal。未测 GPU 繁忙比例、生成速度、换设备后的差异或量化质量。

依据 [Ollama FAQ](https://docs.ollama.com/faq#how-can-i-tell-if-my-model-was-loaded-onto-the-gpu)、[运行列表 API](https://docs.ollama.com/api/ps)、[硬件支持](https://docs.ollama.com/gpu) 和 [日志指南](https://docs.ollama.com/troubleshooting)。英文原生 SVG 按处理器症状分流，结果独立链接到对应章节。

本轮开始时 Search Console 已确认上一轮 Ollama Embeddings 指南收录，北京时间 12:00:31 成功抓取，Google 采用正式规范路径。OpenCode MCP 仍已收录。MarkItDown、Runway、Sora 当时依旧尚未识别，未重复请求。无本轮上线后效果数据。

localhost 在 390px 和 1440px 核对首答、原生 SVG 可读性、键盘高亮且不改 hash、缩放行为、三个步骤跳转及无横向溢出。下载文件与源字节相同。禁用 JavaScript 后保留步骤链接和示例请求。正式交付另记。

## 正式交付

GitHub `main` 的 `ac88bda` 从干净归档通过 90 项自动测试。站点检查覆盖 60 个 HTML、59 个从首页可达的 sitemap 页面及 324 处静态资源。Worker 预览中的新页和下载证据逐字节符合归档。北京时间 12:07，版本 `77799af8-173a-47bf-9447-2f2b0f00b38e` 接收全部流量，部署 `0c636b67-9428-41e6-8e70-e38fe8073274`。正式站 10 个相关路径返回 HTTP 200，内容与归档逐字节相符。复核采用直接 HTTP。

OpenSEO 网址检查连接本轮未返回该页状态。改用 [Search Console 的精确网址检查](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fai.ipunk.cn%2F&id=2e9Cey6WCpf2zHtvLpshnw)，确认 Google 当时尚未识别。请求触发了实际网址测试，页面随后返回未收录视图，未看到已加入优先抓取队列的回执。保留已上线站点地图与站内入口。收录和上线后的曝光、点击仍待核实。
