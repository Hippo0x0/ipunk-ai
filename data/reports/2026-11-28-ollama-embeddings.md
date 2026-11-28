# Ollama embeddings 本地检索实测

新增规范页 `/en/guides/ollama-embeddings/`。任务是使用 Ollama 原生 `/api/embed` 对源页和问题生成向量，按余弦相似度排序并核对原文。MarkItDown 页负责提取和 OCR，OpenAI 兼容 API 页负责 Chat Completions 接入。中英文首页及两篇相邻指南新增普通 HTML 链接，中文入口注明英文。新页列入 sitemap。

## 需求和竞争

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=ollama%20embeddings,ollama%20embedding%20api,ollama%20structured%20output,ollama%20json%20schema&hl=en)为美国 Web、过去 12 个月。[官方 CSV](2026-11-28-ollama-embedding-trends.csv)排除 11 月 22 日未完整周后有 52 个数据点。以下是同图均值和 11 月 15 日完整周的相对指数。

| 查询 | 均值 | 最新完整周 |
| --- | ---: | ---: |
| ollama embeddings | 35.2 | 2 |
| ollama embedding api | 0.3 | 0 |
| ollama structured output | 2.5 | 0 |
| ollama json schema | 5.7 | 0 |

主题在这组历史数据中信号较强，最新完整周较弱，零值可能低于报告阈值。未获取月搜索量、难度或预计点击。英文竞争样本 [LocalAI Scope](https://localaiscope.com/en/setup/ollama-embeddings/)、[Multigrid](https://multigrid.ai/learn/ollama-embeddings-api-tutorial) 和 [CodingKit](https://codingkit.com/ollama/embeddings-rag/) 已覆盖批请求、模型差异和基本余弦排序。实测增量为同一公开 PDF 的 OCR 候选对照、逐条原文复核及原始向量下载。样本未锁定城市或确认排名。

## 实测与边界

Ollama 0.40.18、macOS arm64。尝试下载官方 registry 标签时，客户端拒绝了本地网络环境解析到的非公开重定向地址。改从 [Nomic 官方仓库](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/blob/main/nomic-embed-text-v1.5.f16.gguf) 下载发布方 F16 GGUF。274,290,560 字节，SHA-256 `f7af6f66802f4df86eda10fe9bbcfc75c39562bed48ef6ace719a251cf1c2fdb` 与发布方指纹相同。用独立模型目录和 `ipunk-nomic-embed:v1.5` 标签导入。此 GGUF 与 registry 标签提供的文件指纹不同。页面区分官方标签安装步骤和已执行的本地导入。导入及模型试验在隔离回环服务内进行，外部网络禁用。

前两页采用历史 MarkItDown 无修改输出，第三页采用同一 PDF 的单独 OCR 文本。每页带独立引用。使用 Nomic 的 `search_document:` 与 `search_query:` 前缀、`truncate: false`，一次批处理返回六个 768 维向量。复用同一批向量，只改变候选页，再计算每个问题的排序。

SCAN-43 在没有 OCR 时的首位是第 2 页，余弦 0.604229，该页没有答案。有 OCR 时第 3 页首位，余弦 0.845218，文本包含 72 hours。Extended 保留期与 BASIC-52 审核问题的首位和原文答案不变。使用此公开合成文档的三道问题，不推导通用命中率、产品对比或模型生成质量。未调用生成模型或向量数据库。脚本、页级文本和原始向量随文章公开。

使用原生 SVG 连接向量请求、排序和缺失文本。参考 [Ollama 原生 API](https://docs.ollama.com/api/embed)、[向量文档](https://docs.ollama.com/capabilities/embeddings) 和 [Nomic 任务前缀](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5#task-instruction-prefixes)。本轮开始时的 Search Console 仍未识别此前已提交的 OpenCode MCP 与 MarkItDown PDF 两页，未重复提交。

从公开原始向量独立重算排序并核对首位页文本。localhost 在 390px 和 1440px 验证首答、决策树、键盘高亮且不改变 hash、缩放复原、所有步骤跳转、原始向量下载字节和无全页横向溢出。禁用 JavaScript 后仍可读取命令和打开步骤。正式发布状态另记。

## 正式交付

GitHub `main` 的 `9bf6fad` 从干净归档通过 90 项自动测试。站点检查覆盖 59 个 HTML、58 个从首页可达的 sitemap 页面和 319 个静态资源引用。预览中新页、样本、脚本和向量逐字节符合归档。北京时间 11:59，Worker 版本 `52cdbf77-c223-441d-9bfe-94ab93503997` 承接全部流量，部署 `3dba4367-ce05-425f-93fc-9ea9216c95ee`。正式站 11 个路径均 HTTP 200、与发布内容逐字节一致，直接 HTTP 核对未触发浏览器统计。

发布后的网址检查已确认此前的 [OpenCode MCP 指南](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=QPKpTMCGzM7ilSPFPnPRPQ) 收录，Google 选择规范与声明一致，北京时间 11:54:31 抓取。最新完整 final Web 数据为洛杉矶时间 11 月 19–25 日，按日期行合计 21 次曝光、0 次点击，早于本次发布。

[新指南网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=pOAIG9wHQrAZMd4TaKZJLQ)在开始提交时显示 Google 尚未识别。回执确认加入优先抓取队列。新页收录和上线后曝光、点击仍有待确认。
