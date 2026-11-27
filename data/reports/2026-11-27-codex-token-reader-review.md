# Codex 本地用量核对页

日期：2026-11-27。新增 `/en/guides/codex-token-usage/`，目标是承接 Codex token usage 的具体核对需求，并让访客完成本地读取、解释和摘要导出。本轮没有本站搜索点击或使用渗透提升结论。

## 选题及证据

复用此前已读取的 OpenSEO 报告 `5c3f50ee-1215-471a-9dc6-8c9b03906934`（2026-11-24、US/en）：Codex token usage 的第三方估算为 260/月、KD 6，Google Trends 组 A 图内均值 13。这些数值是旧研究线索，不是官方绝对量、本站流量或效果预测；不与独立归一化图表横比。报告链接：

https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/5c3f50ee-1215-471a-9dc6-8c9b03906934

竞争页 Rollcage 的 https://rollcage.app/guides/codex-usage 已覆盖本地 JSONL 用量追踪。本页不声称本地统计是新功能，增量是：区分两种持久化用量记录、去重、冲突与分支边界、合成反例、可下载的计数摘要。没有复购关键词或新建跟踪器。

本机 CLI 为 0.167.0，匹配官方 tag rust-v0.167.0，解析 tag 对象确认 commit `086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a`。读取其 `protocol/src/protocol.rs`、`history/src/rollout_payload.rs`、`rollout/src/policy.rs` 等源码核对字段、累计、显示和落盘规则。补读官方当前 slash-commands、pricing 文档；没有把竞品解释当作 OpenAI 行为的权威来源。

## 实现与边界

- 一个未压缩 UTF-8 JSONL 文件，上限 5 MiB、20,000 行、每行 262,144 字符；扩展名和常见压缩头拒绝。未读取用户真实 Codex 会话。
- `token_usage_record.payload.usage` 按 thread/response 去重；不再次叠加 turn/thread 的累计字段。冲突响应 ID 或没有首部可定范围的多个线程抑制合计。
- 首个 session header 可用时决定响应范围，排除其他线程记录；后续 header 可能是继承历史，不替换范围。快照仅报告文件最后一条有效观察，不认证为分支新增或一生总量。
- `event_msg/token_count` 的累计快照不求和，不与响应合计相加。缺失、空 info 不补零；计数下降、非加和形状、残缺行等保留警告。
- CLI 风格数值按 checked source 的 uncached input + output 计算，与原始 total_tokens 分列；reasoning/cache detail 不再次相加。缺失 cache-write detail 为未知。
- 原始日志仅在当前页读取，无上传和浏览器存储。摘要白名单只输出数字、固定范围文字和警告代码；不含提示词、路径、文件名、模型、身份、ID、时间及 rate-limit 数据。
- 不估算账单、credits、剩余额度、上下文余量，不把单个文件视为完整账号用量。其他 CLI 版本有提示，未声称全面兼容。

## 验收

13 项新测试覆盖去重、冲突、分支、无范围多线程、计数回退、context-fill 形状、rate-only、残缺行、负数/小数/缺失/精度溢出、版本差异、边界、压缩头及导出/埋点隐私。连同既有 70 项，共 83 项 Node 测试通过（既有 Python probe 测试仍在包装中）。站点检查通过：48 个 HTML、261 个静态资源引用。全量 Worker dry run 接收 302 个资产。

Chrome localhost 实际操作：合成示例得到 2 个唯一响应、1 个重复响应、2 个不同快照、1 个重复快照；原始合计 4,300，CLI 风格合计 1,300。通过系统文件选择器导入同一合成 JSONL，得到相同结果。下载 1,169 字节 JSON，与预期摘要逐字段一致且不含私有标记。清空后文件入口归零、结果移除、下载禁用。390px 响应视口检查表格、文本和按钮；控制台 0 条消息。浏览器与本轮预览服务在交付前关闭。

首页中文/英文入口均来自 dist/index.html，再由现有 renderer 派生英文首页。Codex 项目页增加相关入口并同步 dateModified/sitemap；新页加入 sitemap、来源、静态正文、下载与 noscript 提示。没有添加与任务表重复的决策树。没有提前填写尚未发生的正式发布日期。

## 效果回收

正式域部署验证后，以搜索引荐落地会话为分母，分别观察本地导入、摘要导出、证据下载和相关内容进入。合成示例 stage=process，不当作真实文件导入；import/export 按会话去重，避免把一次访问中的多次操作当作多人渗透。

埋点成功代表读取流程完成，不认证日志完整或使用量准确；未知和部分结果仍可输出诊断摘要。事件不包含日志或计数，因此不能从遥测判断每个用户的结果质量。不可把下载发起当作已保存、已执行或已证明节省额度。内部 localhost 验收不进入 production 统计。

待正式上线及完整窗口后，再分别比较查询覆盖、位置、点击与使用会话比例；提交代码、增加页面和内部互链都不是已验证增长。Cloudflare whoami 复核仍返回 OAuth 过期且无法刷新，dry run 不代表上线。未重复启动登录、改 DNS 或发布到另一个 Sites 域名；main 源码交付与正式 Worker 发布状态分开报告。
