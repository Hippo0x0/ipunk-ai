# Ollama stop 与 keep_alive

新增英文规范页 `/en/guides/ollama-stop-keep-alive/`，覆盖停掉单个已运行模型、预加载、请求和服务端驻留时间、以及运行列表与已下载列表核对。英文删除指南继续负责移除标签和共享磁盘文件。两个首页及已有运行、删除指南提供入口，中文首页注明英文。原生 SVG 分流卸载、后续复用和不确定情况。

## 搜索依据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=ollama%20keep%20alive,ollama%20keep_alive,ollama%20stop,ollama%20unload%20model&hl=en) 的 [CSV](2026-11-28-ollama-keep-alive-trends.csv) 排除 11 月 22 日部分周后有 52 周。主词 ollama stop 有 44 周非零或低于 1，均分上界 37.67，最近完整周 8。ollama keep_alive 为 16 周、均分上界 5.19、最近完整周 0。ollama unload model 为 5 周、均分上界 0.98、最近完整周 2。带空格的 keep alive 本图均为零。数值是图内相对指数。

[Ollama 官方 FAQ](https://docs.ollama.com/faq#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately) 和 [同类英文指南](https://llmhardware.io/guides/ollama-keep-alive) 已覆盖常见指令与调度说明。本页用真实的运行列表证据验证请求值、服务默认值、同机冷热两次和负值被调度换出的场景。

## 实测

macOS 26.4.1 arm64、Apple M4、Ollama 0.40.18、独立临时模型目录和回环网络。Qwen2.5 0.5B Q4_K_M 与 Nomic Embed Text 1.5 F16 来自此前核对过的测试文件。将服务默认设为 6 秒、最多驻留 1 个模型。省略请求值时约 6.02 秒后消失，单请求的 2 秒约 2.04 秒后消失，空请求的 0 在下一次轮询时已消失。-1 超过 7 秒仍在，加载另一嵌入模型后被换出。CLI stop 的嵌入标签从运行列表消失，两标签仍在安装列表。两次短提示的 load_duration 约 270.4 ms 和 0.62 ms，仅作同一模型的 API 记账对照，未以此估计真实请求耗时。

localhost 在 390px 和 1440px 核对首答、键盘高亮、缩放、章节跳转、全页无溢出与证据下载。禁用 JS 后保留命令和跳转。
