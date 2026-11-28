# 更新与回滚单个 Ollama 模型

新英文页面 /en/guides/update-ollama-model/ 处理同一库标签更新、自定义模型重建和保留回滚副本。中英文首页和英文入门页均有入口，加入站点地图。迁移页面继续处理存储位置，Modelfile 页面继续处理创建与参数。

## 搜索依据

[Google Trends 官方美国 Web 对比](https://trends.google.com/trends/explore?geo=US&q=ollama%20pull,ollama%20update%20model,update%20ollama%20models,ollama%20cp&hl=en) 的 [CSV](2026-11-28-ollama-update-trends.csv) 保留 52 个完整周。四词同图平均相对指数依序为 15.60、3.31、2.17、0.08，出现可见热度分别为 50、27、24、1 周，最近完整周分别为 3、1、1、0。未推算月搜索量、难度或预计点击。[Open WebUI 文档](https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-ollama/) 与 [Convly AI](https://convly.ai/how-to-update-ollama/) 已覆盖更新操作。新页核对替换同名标签后的完整摘要、重启后的保留标签和回滚实测。

## 本地离线对照

使用独立的 macOS arm64 环境和 Ollama 0.40.18，同一 Qwen2.5-0.5B-Instruct Q4_K_M GGUF 分别构建 num_ctx 为 1024 和 2048 的版本。服务器与客户端只允许回环连接，云功能关闭。ollama cp 把原值保存到新标签，普通 blob 文件长度合计不变。经 ollama create 重建同名标签并重启服务后，原标签摘要和参数发生变化，保存标签能继续运行。再用 ollama cp 回滚，原摘要、参数和已知请求的 LOCAL_OK 回复恢复。只验证这两个本地构建及当前版本，没有模拟上游发行日期。

三路原生 SVG 将库标签、自定义和不确定引到对应正文。Chromium 的 390 和 1440 px 测试覆盖键盘高亮、链接目标、缩放、无整页横向溢出以及无 JavaScript 内容。证据下载与源文件一致。

## 官方库拉取对照

使用另一独立模型库下载并核对 smollm:135m 官方清单和五个文件的 SHA-256 与长度。首次直接拉取遇到对象存储连接错误。采用独立下载并校验的本地文件预填充，Ollama 随后实际连接官方仓库解析清单并完成拉取。把自定义构建用作旧版本，其摘要前缀 3533754c2af6。拉取恢复官方 b0b2a4617438，再拉一次保持相同摘要。保存标签在过程中仍指向 3533754c2af6，回滚后原名也恢复该摘要。没有测量全量下载速度，也没有重放真实历史上游发布。
