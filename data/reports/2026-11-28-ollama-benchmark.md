# Ollama 原生速度计算器

新增英文 `/en/guides/ollama-benchmark/`，用于从单次完整的 Ollama 原生 API 响应计算输入处理和输出生成 token/s，显示各阶段耗时和 token 数。补上已有本地模型指南与同机实测之间的复现入口。中英文首页、Ollama 流式和 GPU 指南、中文 Mac mini 实测页链接新工具，中文入口明确标注英文。

## 搜索依据

Search Console 的 2026-10-30 至 11-26 Web final 页面表中，中文 Mac mini M4 Qwen 实测页 7 次曝光、0 次点击，平均位置 26.9。可见查询明细没有列出该页的查询，不推断出这些曝光来自 Ollama。

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=ollama%20benchmark,ollama%20tokens%20per%20second,llm%20tokens%20per%20second,ollama%20performance&hl=en) 的美国网页搜索 51 个完整周覆盖 2025-11-30 至 2026-11-15，排除首尾未满周。同组归一化指数如下。

| 查询 | 完整周均值 | 有信号周 | 最晚完整周 |
| --- | ---: | ---: | ---: |
| ollama benchmark | 8.31 | 30 | 1 |
| ollama tokens per second | 2.88 | 22 | 1 |
| llm tokens per second | 10.41 | 45 | 1 |
| ollama performance | 31.67 | 41 | 1 |

近期信号低于年中。开发重点是可完成的测速任务和实际结果，后续单独核对新页的搜索表现。

## 真实请求

Apple M4、32 GiB、macOS 26.4.1、Ollama 0.40.18，Qwen2.5-0.5B-Instruct Q4_K_M GGUF。单 worker 和客户端、回环网络、2048 上下文、相同非私密提示、temperature 0、生成上限 64。首次请求前确认模型不在 `/api/ps`，未清除系统文件缓存。模型驻留后同提示重复 3 次，另测 1 次非流式请求。全部实际生成 64 tokens，完成原因为 length。

| 口径 | 生成 token/s | 首个非空文本 |
| --- | ---: | ---: |
| 未驻留时首次请求 | 146.71 | 0.6012 秒 |
| 同提示重复 3 次 | 162.42–165.26 | 0.0076–0.0079 秒 |
| 另一次非流式 | 162.71 | 未测 |

首次服务加载时间 0.5570 秒。驻留加重复输入可能受缓存影响，此次未将缓存收益单独隔离。首个文本由客户端计时，浏览器工具不从服务器总时长推算。保留逐次指标、非流式原始响应和运行产生的 NDJSON。字段语义依据 [Ollama Generate](https://docs.ollama.com/api/generate) 和 [Ollama Chat](https://docs.ollama.com/api/chat)。

## 验证

- 本机浏览器对原始 JSON、完整 NDJSON 和仅终点指标给出预期结果。断流、兼容 SSE、零时长、缺字段、无效计数、混合和过大的输入有单独的数值或提示。只解析一个已完成响应。
- 390 px 与 1440 px 核对首答、计算、重置、SVG 分支、键盘、缩放和下载。关闭 JavaScript 后保留公式与静态章节入口。测试中只观察到 localhost 的资源读取，合成粘贴标记未出现在请求中。
- 中文 Mac mini 文章保留 11 月 7 日实测与来源日期，本轮只添加另一个测量口径的入口。

## 发布

北京时间 11 月 28 日 16:20，内容提交 `48b6864` 已推送 main，Cloudflare Worker `4ed92efc-d180-4e57-a7a4-3c398cf8f588` 接收全部流量。102 项测试通过，站点检查覆盖 93 个 HTML、92 个 sitemap 页面和 526 处静态资源。预览与归档一致。正式域 14 项请求均为 200，响应正文与发布包逐字节一致，响应头未见 noindex。

Search Console 首查显示新页尚未被 Google 发现。中文 Mac mini 实测页保持已收录，最近一次抓取在 11 月 19 日 04:05 UTC。本次只增加一条 sitemap 网址，等待常规重读与相同口径的点击数据。
