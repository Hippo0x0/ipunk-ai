# OpenCode 本地 MCP 配置和排查

新增英文规范页 `/en/guides/opencode-mcp-server/`。读者可连接只有固定回执的本地示例，核对项目配置、启动状态和工具清单。权限、插件、技能和 Ollama 模型仍有各自的指南。中英文首页和 OpenCode 中英文项目页加入入口，中文入口注明英文。新页进入站点地图。

## 搜索需求

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=opencode%20mcp,opencode%20mcp%20server,opencode%20mcp%20config,opencode%20mcp%20not%20working&hl=en)为美国 Web、过去 12 个月。[官方 CSV](2026-11-28-opencode-mcp-trends.csv)排除 11 月 22 日未完整周后保留 52 周。以下是同图相对指数，以及 11 月 15 日完整周。

| 查询 | 平均 | 最新完整周 |
| --- | ---: | ---: |
| opencode mcp | 43.9 | 17 |
| opencode mcp server | 8.1 | 4 |
| opencode mcp config | 0.8 | 0 |
| opencode mcp not working | 0.0 | 0 |

零值可能低于报告阈值。没有月搜索量、KD 或预计点击。英文竞争样本 [Valv](https://valv.sh/resources/opencode-mcp/)、[Tempreon](https://tempreon.com/guides/add-mcp-server-to-opencode) 和 [Serverdex](https://serverdex.io/for-client/opencode) 已覆盖配置、连接状态与远程服务。本页增加可下载的无外部依赖示例、同服务重复检查、缺失脚本负例和 V1 兼容实测。样本未固定城市或确认排名。

## 实测

复用此前校验包完整性的官方 OpenCode 2.4.1，运行于 macOS arm64、Node.js 25.2.1。使用独立的临时 Git 项目、配置和回环网络限制。OpenCode 进程结束时关闭实例。先实际用 `opencode mcp add` 生成并核对本地配置。然后同版本测试正确 V2、缺失脚本和简单 V1 三种配置。所有首次 `--standalone` 列表均退出 0 并显示空，`debug config` 能看到配置。分别连到各自持续运行的回环服务后，第二次查询区分两个 `connected` 和一个带 `MODULE_NOT_FOUND` 的 `failed`。缺失脚本时列表命令也退出 0。默认后台服务复核正确 V2 同样先空后连接成功，随后停止该隔离后台。

OpenCode 服务日志报告工具数为 1。通过直接 stdio 测试独立确认样本列出 `healthcheck` 并返回 `MCP_OK`。不将独立调用写成 OpenCode 内模型执行。简单 V1 条目的 `enabled: true` 被规范化为 V2 的 `disabled: false`。未调用模型、云端、OAuth 或访问项目数据。只发表合成配置与过滤后的输出，随机回环服务口令未写入证据。

官方来源为 [MCP 配置](https://opencode.ai/docs/mcp-servers/)、[V1 迁移](https://opencode.ai/docs/migrate-v1/#mcp-servers)、[stdio 规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#stdio) 及 [空列表上游报告](https://github.com/anomalyco/opencode/issues/63053)。排障按缺失／不确定、连接失败、已连接分流，复用原生 SVG 和既有交互。

localhost 的 390px 和 1440px 验证首答、键盘路径高亮、缩放复位、三条章节跳转、证据下载字节和无全页横向溢出。禁用 JS 后导航和例程依然可读。

11 月 28 日本轮读取 Search Console。此前的 Ollama 删除指南和 OpenAI 兼容 API 指南均已收录。普通抓取分别为北京时间 11:44:28 和 11:38:26，Google 选择规范 URL 为各自正式路径。MarkItDown PDF 指南当时仍未识别。此次收录核对没有点击或收入读数。

## 正式交付

GitHub `main` 的 `db93645` 从干净归档通过 90 项自动测试。站点检查覆盖 58 个 HTML、57 个可从首页到达的站点地图页面及 314 处静态资源。Worker 预览中的新页、脚本和 JSON 与归档逐字节吻合。北京时间 11:51，Worker 版本 `ee67fb05-3d93-4093-ae28-a88ae456af78` 承接 100% 流量，部署 `d59b663a-62b2-41e2-b90f-b37788cd39ae`。正式域 11 个相关路径均 HTTP 200，内容与发布归档一致。复核使用直接 HTTP。

[OpenCode MCP](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=yxr9U48hrnvrvih6ExT6bg)与[此前的 MarkItDown PDF 指南](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=OAFvc8l6-aOe_R7Cv3pzkw)提交开始时均显示未识别。两个独立回执均确认进入 Google 优先抓取队列。普通抓取、收录和上线后点击仍有待确认。
