# Ollama 模型卸载与删除实测

英文规范路径为 `/en/guides/delete-ollama-model/`。处理运行中模型占内存、删除精确标签及核对磁盘变化的完整任务。Ollama 入门页保留最短的卸载提示，并链接独立清理步骤。中英文首页均有入口，中文注明英文，新增页纳入 sitemap。没有另建同意图的模型存储路径页。

## 搜索需求

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=ollama%20delete%20model,ollama%20rm,ollama%20models%20location,ollama%20remove%20model&hl=en)为美国 Web、过去 12 个月。下载[官方时间序列](2026-11-28-ollama-remove-trends.csv)并排除 11 月 22 日未完整周，共 52 周。下表为同图平均值和最新完整周 11 月 15 日的相对指数。

| 搜索词 | 平均 | 最新完整周 |
| --- | ---: | ---: |
| ollama delete model | 9.8 | 9 |
| ollama rm | 4.7 | 0 |
| ollama models location | 26.6 | 2 |
| ollama remove model | 23.2 | 11 |

零值可能低于报告阈值。没有月搜索量、KD 或预期点击数据。英文竞争样本包括 [DiskCity](https://diskcity.app/guides/delete-ollama-models)、[RunItLocal](https://runitlocal.io/learn/how-to-update-and-delete-models) 和 [Storage Cleaner](https://storagecleaner.dev/guides/delete-ollama-models)。现有多篇已经解释共享权重。新页增加同一版本的四步对照、可下载文件记录、剩余标签真实运行，以及内存与盘空间的任务分流。该样本没有固定城市排名。官方来源为 [Ollama CLI](https://docs.ollama.com/cli) 和 [本地常见问题](https://docs.ollama.com/faq#where-are-models-stored)。

## 实测范围

macOS arm64、Ollama 0.40.18、Qwen2.5-0.5B-Instruct Q4_K_M。为实验新建回环实例和空的模型存储，使用外部已有 GGUF 导入测试标签，通过 `ollama cp` 创建共享数据的另一标签。未删除任何用户模型或原始 GGUF。试验进程仅允许回环网络且禁用 Ollama 云功能。

记录 `ollama list`、`ollama ps`、原生 tags 和运行列表。停用已运行标签后，运行列表为空，两个已安装标签及三个 blob 保留。删除第一个标签后，保留标签仍返回 `LOCAL_OK`，三个文件的字节数均未变化。停止并删除最后一个标签后，三份 blob 从独立目录中移除。页面记录 blob 文件长度合计，证据另保留文件的已分配字节数。未将文件移除折算为卷可用空间变化，未测试其他模型、操作系统或手工迁移。初次采集发现此版本无法用旧的 manifests 文件目录数代表标签，以 API 与 CLI 的标签清单为准。

本轮开始时，Search Console 精确资源确认 OpenCode Ollama 指南已收录，Google 规范与声明一致。Ollama OpenAI API、MarkItDown、Runway、Sora 当时仍显示未识别。已有索引请求没有重复提交。没有可用于判断本轮新页点击的上线后时段。

沿用原生 SVG 和站点交互，分流为运行内存、盘空间和不确定。只发布英文任务页。localhost 在 390px 和 1440px 验证首答、图形可读性、键盘高亮且不改 hash、独立滚动和缩放复位、三个步骤链接、证据下载字节和无整页横向溢出。关闭 JavaScript 后，步骤链接与示例命令依然可用。正式发布另记。

## 正式交付

GitHub `main` 的 `aeb8586` 在干净归档通过 90 项自动测试和站点检查，覆盖 57 个 HTML、56 个可从首页到达的站点地图页面及 309 处静态资源。Worker 预览中的新页与证据逐字节符合归档。北京时间 11:43，Worker 版本 `df2969a1-f3f4-4ce6-98be-31e8475b4810` 接收 100% 流量，部署 `12df9658-7b5b-4207-9d96-2f3263328b32`。正式域九个相关路径均 HTTP 200、逐字节吻合，证据以 JSON 返回。正式站核对采用直接 HTTP。

[Search Console 网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=p3pSkOTVoxI4as9tlVrDfQ)确认提交前 Google 尚未识别该 URL。提交后回执显示已加入优先抓取队列。索引和上线后的搜索效果有待后续确认。
