# Codex CLI 恢复会话与核对工作目录

新增英文规范页 `/en/guides/codex-resume/`，覆盖按 ID、当前目录最新、跨目录选择以及找不到会话。与用量限制和日志计数各自承接不同任务。中英文首页、Codex CLI 项目页、英文日志计数页新增 HTML 入口。新增规范 URL 列入 sitemap，中文入口注明英文。

## 搜索依据

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=codex%20resume,codex%20session%20history,codex%20cli%20resume,codex%20resume%20session&hl=en)为美国 Web、过去 12 个月。[官方 CSV](2026-11-28-codex-resume-trends.csv)排除 11 月 22 日未完整周后有 52 个数据点。以下为图内均值和 11 月 15 日完整周。

| 查询 | 均值 | 最新完整周 |
| --- | ---: | ---: |
| codex resume | 29.5 | 10 |
| codex cli resume | 8.7 | 1 |
| codex resume session | 3.9 | 3 |
| codex session history | 0.4 | 1 |

相对指数不用于估计月量或点击。英文竞争样本 [Shabash](https://shaba.sh/blog/codex-resume-session-and-history/)、[Shuriken](https://shuriken.sh/guides/codex-resume-session) 和 [Crowsnest](https://crowsnest.app/guides/resume-codex-session/) 已覆盖基础命令、路径与交互过滤。新页的可复核增量是真实 CLI 事件与合成会话对照，覆盖空目录回落新会话、临时会话不能按 ID 恢复和记录的工作目录。竞争样本未固定城市或排名。

## 独立实测

从官方 npm 下载 macOS arm64 的 Codex 0.172.0 包，对照 npm SHA-512 完整性指纹，解包到临时目录。另用本机 0.164.0 核对关键现象。没有替换系统 CLI。测试设置独立 CLI 配置、临时 Git 目录及外部网络禁用的进程策略。回环 Responses SSE 桩只返回固定字符串，未读取真实用户会话，不使用账号、模型服务或 API 计费。

0.172.0 初始新建 A、B 两个合成会话。在 A 执行 `--last` 得 A 原始 ID。接着在 B 新建更新的会话，在 A 执行 `--last --all` 得 B 最新 ID，按明确 ID 能恢复 B 较早会话。两次跨目录恢复的最新合成 `turn_context` 都保留 B 路径。只有 `--ephemeral` 记录的第三目录里，脚本确认该 ID 没有保存会话文件，直接按 ID 恢复退出 1，没有模型请求。随后从该目录运行 `--last`，返回新的 ID、一次合成请求及退出 0。公开 JSON 仅保留合成路径标记、命令、CLI 事件类型、ID、退出结果及记录的 cwd。

操作来源为 [CLI 选项](https://learn.chatgpt.com/docs/cli/reference#codex-resume)、[非交互模式](https://learn.chatgpt.com/docs/non-interactive-mode) 和 [0.172.0 发布说明](https://github.com/openai/codex/releases/tag/rust-v0.172.0)。交互选择器和目录提示按文档与本机帮助说明，本次实际测试覆盖非交互命令。原生 SVG 分支对应固定 ID、当前目录最新和未找到。

开始时 Search Console 中上一轮 Ollama 双语配置页及 GPU 页仍显示未识别。英文配置页此前已进入抓取队列，中文配置页此前遇到当日手工配额。未重复提交。新增 Codex 页面还没有上线后效果数据。

localhost 390px 与 1440px 核对首答、键盘高亮且不改 hash、缩放复原、所有步骤跳转、证据下载字节和无全页横向溢出。禁用 JavaScript 后仍有命令示例和跳转。正式交付状态另记。

## 正式交付

GitHub `main` 的 `a2d519d` 在干净归档通过 90 项自动测试。站点检查覆盖 63 个 HTML、62 个从首页可达的 sitemap 页面和 341 处静态资源。Worker 预览的新页和原始 JSON 与归档逐字节一致。北京时间 12:25，Worker 版本 `a525a211-c7d8-414f-84ca-f778c755a290` 承接全部流量，部署 `27c948ac-67dc-469d-b5a3-737735413285`。正式站九个相关路径均 HTTP 200、逐字节符合归档。正式域复核采用直接 HTTP。

发布后[精确网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=Sk95DHYROtEVhVA5I9PFsQ)显示 Google 尚未识别该页。本日已有手工配额限制，这次沿用已核验的站点地图与站内链接，未另外提交手工请求。收录和搜索效果有待核对。
