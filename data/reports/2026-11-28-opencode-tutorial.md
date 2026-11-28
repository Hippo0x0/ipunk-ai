# OpenCode 2 首次运行教程

新增英文 /en/guides/opencode-tutorial/。从确认安装版本、选择本地或托管提供商，走到小项目的运行验证。中英文首页、英文项目页及 Ollama 接入页链接新页。集成、权限、配置和会话的详细排查继续由对应页面提供。纳入站点地图。

## 搜索依据

[Google Trends 官方美国 Web](https://trends.google.com/trends/explore?geo=US&q=opencode%20tutorial,opencode%20setup,how%20to%20use%20opencode,opencode%20install&hl=en) 的 [CSV](2026-11-28-opencode-tutorial-trends.csv) 保留 52 个完整周。四词的平均相对指数依序为 4.35、17.17、28.73、49.46，出现可见热度的周数为 21、40、48、50，最近完整周为 2、8、17、33。安装与教程词的需求有交集，未推算月搜索量或预期点击。英文项目页已有 Search Console 曝光，暂未观察到本教程精确词的本站流量。[OpenCode 官方安装](https://opencode.ai/docs/)与 [Ollama 集成文档](https://github.com/ollama/ollama/blob/main/docs/integrations/opencode.mdx)已有类似操作，竞争样本也包括 [AI Frontier Post](https://aifrontierpost.com/articles/opencode-ai-coding-agent-tutorial/)。本页提供受限本地首跑、同会话附件和基线对照。

## 实测

OpenCode 2.4.1 与 Ollama 0.40.18，macOS arm64，另建 Git 仓库和用户目录。两进程只允许回环，OpenCode 拒绝工具动作。Qwen2.5-0.5B-Instruct Q4_K_M 是此前已导入的本地 GGUF，本次配置独立端口、32 token 输出上限与温度零。启动前运行列表空，发现目标模型后首条请求得到 READY_CHECK，Ollama 运行列表出现同一模型。用相同会话附上两行 Python，模型答 5，与本地 Python 输出一致。Git 状态前后均干净，脚本 SHA-256 未变。范围限已装的本机 CLI。未实测安装过程、托管服务、其他平台或模型质量。

Chromium 从 390 与 1440 px 验证首答、规范地址、三路分流、键盘高亮、缩放、章节跳转和证据下载。无 JavaScript 时保留静态路径与文本。

## 正式交付

内容提交 `a13564f` 的干净归档通过 93 项测试。站点检查覆盖 84 个 HTML、83 个站点地图可达页面和 470 处静态资源引用。预览新页和证据与归档一致。北京时间 15:01:09，Cloudflare Worker `b483bb2b-c55b-4da8-8937-d4db372604ca` 承接全部流量。正式域相关 9 个路径均返回 HTTP 200、响应逐字节一致。

[Search Console 网址检查](https://search.google.com/u/1/search-console/inspect?resource_id=https%3A%2F%2Fai.ipunk.cn%2F&id=mtuQDKIGSnv41ND-FGfNQA&hl=zh-CN) 显示 Google 尚未识别新网址。单次请求编入索引返回「超出了配额」，没有进入优先队列。正式站点地图已包含新页，普通发现、收录与点击效果待确认。
