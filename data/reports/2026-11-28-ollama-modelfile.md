# Ollama Modelfile 创建与核对

新增英文页 `/en/guides/ollama-modelfile/`，覆盖现有 tag 派生、本地 GGUF 导入、查看保存参数、重建与运行上下文检查，补上现有上下文和本地入门页里仅简述的独立任务。首页两种语言和本地入门、上下文指南新增链接，中文首页注明英文。英文页使用原生 SVG 分流现有 tag、GGUF、不确定或检查设置。

## 选题

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=ollama%20modelfile,ollama%20create,ollama%20modelfile%20example,ollama%20show%20modelfile&hl=en) 的 [原始 CSV](2026-11-28-ollama-modelfile-trends.csv) 排除 11 月 22 日部分周后有 52 周。ollama modelfile 34 周非零或低于 1，均分上界 19.04，最近完整周为 1。ollama create 49 周，均分上界 30.35，最近完整周为 6。两个长尾查询本次样本均为零。指数仅用于同图比较，无月搜索量或点击预测。

[Ollama 官方 Modelfile 文档](https://docs.ollama.com/modelfile) 已有基础语法和示例。新页补充可观察的保存和运行状态、同一权重 SHA-256 对照，以及创建失败的实际输出。

## 实测

macOS 26.4.1 arm64、Apple M4、Ollama 0.40.18。在仅允许回环的独立仓库和 HOME 使用事先校验的 Qwen2.5-0.5B Q4_K_M。真实 CLI 在配方目录以外执行相对路径导入，正常文件成功，缺文件报 invalid model name。派生基模型与新 tag 在 manifest 指向同一权重 SHA-256。生成的 Modelfile 指向本机 blob。编辑配方后 show 输出仍相同，重建后上下文从 2,048 升到 4,096。一次原生 API 的请求覆盖将运行上下文设为 8,192。另两组同名不同 tag 对照中，已列出的 `:v1` 可派生，`:local` 引发尝试从 registry 拉 `:latest`。未把现象推广到其他版本。公开证据为脱敏日志和选定结果。

本地 390px 和 1440px 验收首答、SVG 键盘高亮、缩放、三条链接、全页无溢出和证据下载字节。禁用 JavaScript 后保留命令和锚点。
