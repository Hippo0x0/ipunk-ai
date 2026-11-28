# Codex AGENTS.md 加载顺序与排障

新增英文规范页 `/en/guides/codex-agents-md/`，覆盖启动目录、全局与仓库文件、同目录覆盖、备用文件名、字节限制，以及如何在本机核对模型输入。双语首页、Codex CLI 项目页、会话恢复指南和站点地图提供入口。中文站内入口注明英文，当前选题证据来自美国英语搜索词，未制作中文对照页。

## 选题与搜索信号

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=codex%20agents.md,codex%20agents%20md,codex%20project%20instructions,codex%20agents%20override&hl=en) 选美国 Web 最近 12 个月。[原始 CSV](2026-11-28-codex-agents-trends.csv) 按 52 个完整周统计，排除 11 月 22 日部分周，区间值 `<1` 仅用于计算上界。主词 `codex agents.md` 有 51 周记录到非零或低于 1，均分上界 21.2，11 月 15 日完整周为 1。词形变体和项目指令词信号较低，`codex agents override` 全部为 0。近期主词信号弱，量纲为同图 0–100 指数，无法推算月搜索量。

搜索结果包含 [OpenAI 官方指引](https://learn.chatgpt.com/docs/agent-configuration/agents-md) 和 [TellWorld 的使用示例](https://www.tellworld.net/practice/practice-codex-agents-md)，已有设置和覆盖说明。本页以可本地执行的加载检查和空覆盖文件的实测行为为独立价值。上线前，Search Console 精确查询显示会话恢复、Git 工作树、exec JSON 和 token 使用指南 URL 均暂未被 Google 识别。

## 实测与验收

macOS arm64 的 Codex CLI 0.172.0 连跑八组隔离测试。临时 Git 仓库和 Codex 配置只含合成标记，进程禁用网络。读取 `debug prompt-input` 的 JSON 且公开证据只保留合成标记与顺序。验证全局文件先读、工作目录路径外的同级规则缺席、备用名依赖配置、全局覆盖优先。项目子目录里的零字节或纯空白 override 均使同目录基础文件缺席，父目录规则仍加载。移除覆盖文件后基础文件恢复。结果只描述此 CLI 版本读取规则的行为。

使用原生 SVG 分流启动路径、覆盖文件和不确定情况。英文图链接到英文正文，中文入口标明英文。正式验收记录见下。

localhost 核对 390px 和 1440px 的首答、决策树键盘高亮、缩放、三条章节链接、证据下载和无全页溢出。禁用 JavaScript 后仍可读取命令并跳转。Search Console 的站点地图报表显示 `/sitemap.xml` 最后于 11 月 25 日成功读取，已发现 33 个页面，早于本轮。
