# OpenCode token 用量与日志查看器

新增英文 /en/guides/opencode-token-usage/。覆盖项目过滤、逐步日志、缓存和费用的区别。中英文首页、英文项目页和 Go 限额指南均新增入口。Go 页继续处理订阅窗口和额度，新页处理 CLI 可观察的用量。站点地图收录该规范网址。

## 搜索依据

[Google Trends 官方美国 Web](https://trends.google.com/trends/explore?geo=US&q=opencode%20stats,opencode%20token%20usage,opencode%20usage,opencode%20cost&hl=en) 的 [CSV](2026-11-28-opencode-usage-trends.csv) 保留 52 个完整周。四词同图平均指数依次为 7.62、0.63、20.96、37.58，出现可见热度的周数为 26、4、43、45，最近完整周分别为 1、2、13、7。更泛的 usage 或 cost 同时可能指额度和价格，不能直接推算本页需求或绝对点击。[OpenCode CLI 命令](https://opencode.ai/docs/cli/commands)和 [LeanOps](https://leanopstech.com/blog/opencode-token-usage/) 已说明用量入口，本页补充可复现的逐步与项目合计对照。

## 实测与校验

OpenCode 2.4.1、Ollama 0.40.18、macOS arm64，使用 Qwen2.5-0.5B-Instruct Q4_K_M。隔离项目禁用工具，出站限定回环。同一会话两次，再在新会话提交同样的第二个提示，总计 3 steps、2 sessions。逐步字段加总 754 input、11 output、1,451 cache.read，与当前项目 lifetime 报告一致。不同首次提交的另一项目报 0 个会话。保留部分真实数字并替换 ID，样本不含原始命令、提示、路径或模型回答。未测试托管账单、费用精度或跨供应商是否等效。

查看器本地读取 NDJSON，分开汇总报告的各字段。跳过坏行、不完整步骤和可识别重复，不把缺数据算成零。新增两项回归测试核对汇总和坏行／重复。Chromium 390 与 1440 px 验证示例导入、错误反馈、清除、表格宽度、键盘分支和步骤链接。禁用 JavaScript 后仍可读 jq 示例和实测表。
