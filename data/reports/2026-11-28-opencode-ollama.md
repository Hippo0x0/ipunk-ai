# OpenCode 调用 Ollama 本地模型

新增英文规范路径 `/en/guides/opencode-ollama/`。任务是让 OpenCode 2 发现本地模型，并用一次可验证请求确认服务地址。Ollama 首次运行页负责启动模型，Ollama 上下文页负责设置与验证，OpenCode 项目页负责版本与权限。中英文首页均有入口，中文注明英文。既有 OpenCode 项目页、Ollama 入门页提供相关链接。

## 搜索依据

复用 11 月 24 日 [同组官方 Google Trends](https://trends.google.com/trends/explore?geo=US&q=opencode%20plugins,opencode%20ollama,ollama%20out%20of%20memory,llm%20vram%20calculator&hl=en)，美国 Web 过去 12 个月，`opencode ollama` 图内均值 39，11 月 15 日最后完整留存周 21。11 月 22 日部分周为 25。第三方月量、KD、CPC 未知，未复购或开追踪。保留此前暂缓原因。[原始研究摘录](2026-11-24-opencode-plugins-review.json)

11 月 28 日重新核对英文竞争样本和产品资料，Everpod、Aventail、LaneBench 及 OpenCode 官方已有 V2 自动发现、macOS 和自定义地址说明。样本未固定美国城市排名。本页增量是错端口对照、区分列表退出码与实测请求、保留超时和成功请求两份结果。来源为 [OpenCode Ollama 设置](https://opencode.ai/docs/providers/#ollama)、[OpenCode 模型配置](https://opencode.ai/docs/models/)及[Ollama 集成说明](https://docs.ollama.com/integrations/opencode)。

## 执行及范围

使用此前哈希校验的 OpenCode 2.4.1、Ollama 0.40.18 和已导入的官方 Qwen GGUF。macOS arm64，独立 OpenCode 临时 Git 配置，禁止外连的进程策略仅允许运行在 loopback。Ollama 使用同一缓存模型和 8192 上下文。所有进程结束后关闭。未调用云端、模型商用 API 或执行代码修复。

先从两个新配置测试同一机器的空闲端口和实际服务端口。两次 `opencode models --standalone` 均退出 0，仅实际端口包含精确别名。实际端口的第一次无上限请求到达 Ollama，客户端在 55 秒超时。保留 HTTP 路径和状态，并记录首次未完成。第二次在独立配置切换至 32 token 上限与温度 0，OpenCode 返回 LOCAL_OK、stop，Ollama 的运行列表从空变为同一标签，报告上下文 8192。辅助与主请求的底层日志只保留 HTTP 方法、路径和状态，不将两次 HTTP 调用当作两个用户试验。保留前后结果，不推导模型代码能力、性能、默认端口实测或所有环境的隐私保证。

本轮开始时，Search Console 精确资源显示 Mac 本地模型入门及 AI 编程工具选型已收录，Google 规范与声明一致，抓取时间分别为北京时间 10:42:14 与 10:50:15。Codex 用量指南在 10:44:14 抓取成功但尚未收录。该状态属于前几轮页面，尚无上线后的完整搜索效果窗口。

## 页面验收

沿用本地指南导航和已有原生 SVG 交互，包含端口不同、模型缺失、已列出或不确定。纯 HTML 提供命令、操作与证据下载。localhost 验证 390px 和 1440px 的首答、锚点、键盘高亮和缩放、下载及全页横向溢出；关闭 JavaScript 后仍可跳转和读取证据。上线和索引另记独立回执。
