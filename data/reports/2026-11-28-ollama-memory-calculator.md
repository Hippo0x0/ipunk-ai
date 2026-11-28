# Ollama Mac 内存计算器

新增双语规范页，覆盖选模型前估算内存、按上下文看缓存变化、实际加载后核对三种连续任务。首页按语言链接对应版本，英文上下文指南和中文 Mac mini 实测新增同语种入口。两页互链并加入 sitemap。英文证据支持主要选题，中文已有 Mac mini 基准页有搜索曝光，作为同任务的现有入口。

## 选题证据

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=llm%20vram%20calculator,ollama%20memory%20requirements,llm%20memory%20calculator,ollama%20ram%20requirements&hl=en) 美国 Web 最近 12 个月，[CSV](2026-11-28-ollama-memory-trends.csv) 排除 11 月 22 日部分周。52 周中，ollama memory requirements 有 23 周非零或低于 1，均分上界约 22.75，ollama ram requirements 有 25 周，均分上界 21.71。两词在最近完整周均为 0。通用 calculator 查询更稀疏。数据用于定位 Ollama 的具体内存需求，不能推算月搜索量或承诺点击。

竞争样本 [CanIRunLLM](https://canirunllm.dev/) 和 [localmodel.run](https://localmodel.run/calculator) 已有广泛型号和硬件选项。本页聚焦 Mac 的可调预算、GB 与 GiB 单位和已有 Ollama 实测对照。Search Console 上一轮对 AI 站近 30 天的最终页面行查询显示，已发布的中文 Mac mini M4 本地模型基准页有 7 次曝光、0 次点击。

## 核对口径

Qwen 0.5B、7B、14B 预设使用 Qwen 官方模型配置的注意力参数及目录 API 的原始文件大小。Q4_K_M 字节数分别为 491,400,032、4,683,073,632（两片）、8,988,110,496（三片）。理论公式只处理单序列、全注意力、FP16 的原始 KV 缓存，排除混合、滑动窗口及其他计算架构。系统和推理预留为用户可改的初始假设。自定义设置接受实际文件合计和注意力参数。表单不发请求，输入值留在标签页。

复用 11 月 27 日相同 GGUF、相同 M3 Pro 主机的两条原始 Ollama 0.40.18 API 快照，并按二进制单位重新计算。2,048 → 8,192 token 的理论缓存从 24 MiB 到 96 MiB，API 加载量从 297.27 到 418.79 MiB；两者口径不同。保留原始测试日期，不将模型预设值写成试运行结果。工具直接显示预算有余或不足，正文提供同语种核对步骤，未再加重复的分流图。

localhost 在 390px 与 1440px 分别检查双语页面、默认预设、自定义 GGUF 参数、预算超出、无效预留、语言切换、章节跳转和全页无溢出。禁用 JavaScript 后保留公式与实测，加三项自动测试覆盖字节换算、KV 缓存精确量和预算边界。

## 正式交付

内容提交 `0aec652` 首次发布。中文 Apple 资料入口核对为官方的中文链接后，以 `bea3896` 更新。最终归档 93 项自动测试通过。站点检查覆盖 68 个 HTML、67 个首页可达地图页和 376 处静态资源引用。北京时间 13:01，Worker 版本 `13f82af9-e961-4be3-945f-d63784cac0f5` 承接全部流量，部署 `ffd4cc24-c04a-4e58-96a4-8ec4e78ea76b`。生产 12 个路径均 HTTP 200 且与最终归档逐字节一致，使用直接 HTTP 验收。

上线后 Search Console 对[英文计算器](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=zoiT-kbzr47hjF6mHt2nfQ)和[中文计算器](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=4f4IpqXmlbrsrFmY1XihoA)均显示暂未识别。提供链接的中文 Mac mini M4 基准页已收录，最后抓取 11 月 19 日。新增曝光、点击尚未验证。
