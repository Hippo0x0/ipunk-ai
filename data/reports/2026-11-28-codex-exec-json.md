# Codex exec 脚本输出、事件和退出验证

新增英文规范页 `/en/guides/codex-exec-json/`。覆盖在脚本运行 Codex、读取 JSONL 和最终回复、判断失败以及检查指定字段。恢复页继续负责找到历史会话，工作树页负责隔离文件。首页两语言、Codex CLI 项目页和恢复指南增加入口，中文入口注明英文。规范路径进入站点地图。

## 选题证据

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=codex%20exec,codex%20exec%20json,codex%20json%20output,codex%20output%20schema&hl=en)为美国 Web、过去 12 个月。[官方 CSV](2026-11-28-codex-exec-trends.csv)排除 11 月 22 日部分周后有 52 个点。图内均值与 11 月 15 日完整周分别为：codex exec 30.9、3，codex exec json 0.4、0，codex json output 1.1、0，codex output schema 0.0、0。选题由通用 exec 需求支撑，细分词近期信号弱。无月搜索量或点击预测。

英文竞争样本 [JSONL reference](https://codex.danielvaughan.com/2026/04/08/codex-exec-jsonl-reference/)、[Simplified Guide](https://www.simplified.guide/codex/json-output-enable) 与 [Takopi](https://takopi.dev/reference/runners/codex/exec-json-cheatsheet/) 已覆盖事件字段、用法和回复区别。新页提供同一 CLI 的成功、故意违反结构与实际失败对照，以及截断和状态不一致的检查。样本未固定城市或确认排名。

## 可复核实测

复用按官方 npm SHA-512 校验的 Codex 0.172.0，macOS arm64，临时 Git 目录、临时配置、回环 SSE 桩和禁用外网。未接触真实账号、文件、会话或模型服务。执行真实 `codex exec --json --output-last-message`，结构化试验另外加 `--output-schema`。普通回应和符合 schema 的合成回应均退出 0，stdout 包含 turn.completed，单独文件保留相应回复。错误类型负例中，观察到请求确实携带严格 schema，但桩故意忽略，仍以数字返回，CLI 退出 0 并写出该内容。上游 HTTP 400 则实际退出 1、stdout 含 error 与 turn.failed，回复文件为空。桩行为不推导真实供应商的遵守率。

公开四份原始合成 stdout、请求格式摘要、示例 schema、验证脚本和六份检查结果。独立验证接受两个正确输出，拒绝错误字段、真实失败、以零状态传入的失败事件，以及缺少终止事件的截断副本。命令与事件参考 [官方非交互指南](https://learn.chatgpt.com/docs/non-interactive-mode)。用原生 SVG 分成捕获输出、结构检查、失败或不确定。

Search Console 完整数据仍只返回洛杉矶时间 11 月 19–25 日，按日期合计 21 次曝光、0 次点击，早于本轮。上线后再核对规范 URL 的搜索结果。

localhost 在 390px 和 1440px 核对首答、键盘高亮且不改 hash、缩放复位、三个链接、无全页溢出和下载证据字节。禁用 JavaScript 后仍可跳转并读取命令。正式交付另记。
