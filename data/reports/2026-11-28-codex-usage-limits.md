# Codex 额度与重置时间指南

新增英文规范路径 `/en/guides/codex-usage-limits/`。它处理订阅额度用完、刷新时间、工作区预算和 API rate limit 的分流。现有 Codex token usage 页仍负责解析本地 JSONL 计数。两页互链，中英文首页提供入口，中文入口注明英文。

搜索依据为 11 月 24 日 [OpenSEO US/en 研究](https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/5c3f50ee-1215-471a-9dc6-8c9b03906934)。第三方估算 1,300/月，KD 32，CPC 2.37 美元。该次官方 Trends Web 组 B 图内均值 29。供应商估算、相对趋势和广告价格均不能当作本站点击预测。重新检查英文竞争样本，官方说明和 Codex Tracker 均已有 5 小时／每周解释，未确认低竞争，也未复购关键词。新增价值是根据实际登录方式分流，以及用独立实测说明次级窗口可以为空，不要求读者猜固定消息数。

用本机 Codex CLI 0.164.0 生成协议 schema，并通过 stdio 调用一次只读 `account/rateLimits/read`。已登录 ChatGPT 的样本返回主窗口 10,080 分钟、存在重置时间、次级窗口为空。只保留字段存在性与窗口长度，未记录用量、余额、真实重置时间、账号标识或原始响应。没有发起模型生成、购买或执行重置。不同计划的额度以使用者当前界面和官方文档为准，未实测其他计划或 API 错误。

核对了 OpenAI Help Center 的计划与重置文档、CLI 命令说明及 API rate limit 指引。页面保留各自的操作入口。localhost 验证 1440px、390px、键盘高亮、缩放、锚点及无横向溢出。禁用 JavaScript 后核对跳转和公开证据链接。正式站发布、普通抓取以及搜索点击另行验收。
