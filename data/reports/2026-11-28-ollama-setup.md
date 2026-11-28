# Ollama 中英文配置检查与任务入口

新增 `/guides/ollama-setup/` 和 `/en/guides/ollama-setup/`。两页分别有完整中文和英文正文、各自的 canonical、互相声明的两组 hreflang、可见语言切换及相应首页入口。两条路径已进 sitemap。英文首次运行与兼容 API 页、中文 Mac mini 本地模型实测加了靠近对应段落的入口。首次运行页仍负责 Mac 平台细节，新页负责核对服务、聊天和向量端点，并把已建立的实测任务串起来。语言对应按 [Google Search Central 的本地化页面说明](https://developers.google.com/search/docs/specialty/international/localized-versions)复核。

## 搜索需求

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=ollama%20tutorial,ollama%20setup,ollama%20guide,how%20to%20use%20ollama&hl=en)为美国、Web、过去 12 个月。[官方 CSV](2026-11-28-ollama-setup-trends.csv)排除 11 月 22 日未完整周后有 52 个数据点。下表为同一图内平均值和 11 月 15 日完整周。

| 搜索词 | 均值 | 最新完整周 |
| --- | ---: | ---: |
| how to use ollama | 44.0 | 15 |
| ollama setup | 35.8 | 8 |
| ollama guide | 32.9 | 2 |
| ollama tutorial | 10.2 | 1 |

相对指数不能换算成月量或预计点击。该数据仅支持英文选题，中文页为此次本地化判断，未确认中文关键词月量。英文竞争样本 [Local AI](https://local-ai.net/learn/getting-started/run-your-first-local-llm/)、[Steven Phan](https://stevenphan.ca/blog/run-a-local-llm-with-ollama/) 和 [垦荒学园](https://kenhuang.com/en/ollama/index.html)已覆盖安装、示例模型和 API。新增可运行的价值是检查同一进程的两种列表及可选端点，并保留空库、成功、缺失和关停回执。样本未固定美国城市排名。

## 脚本与新实测

在 Apple M4、macOS arm64 和 Ollama 0.40.18 中，用全新存储和仅允许回环的进程策略启动服务。先对空库运行只读检查，再导入已验证的 Qwen2.5-0.5B-Instruct Q4_K_M 与 Nomic Embed Text v1.5 F16 两个 GGUF。实际执行随页面下载的 Python 脚本。空库时版本和两种空列表都返回成功。导入后列表均包含两条标签，聊天回 `LOCAL_OK`，两条合成文本产生两个 768 维向量。随后用不存在的聊天标签获得单项失败而向量仍成功，关闭服务后只返回版本连接失败。退出值依次为 0、0、1、1。实际聊天使用原生接口，OpenAI 兼容接口仅请求模型列表。

默认检查仅读取，无模型下载或大模型推理。两个推理标志由读者显式选择。实际请求仅包含合成测试内容，未读取读者文件。各项结果分开呈现，读者按脚本和正文对应状态自助排查。目录和任务链接已覆盖选择，因此本轮不额外放重复的 SVG 树。命令与接口参考 [Ollama CLI 文档](https://docs.ollama.com/cli) 和 [API 入门](https://docs.ollama.com/api/introduction)。

开始时 Search Console 已确认 Ollama Embeddings、OpenCode MCP 收录。Ollama GPU 和 MarkItDown 仍未识别。以上不代表新中英文页面的曝光或点击。

localhost 在中英文首页分别打开正确语言的新页，390px 与 1440px 在关闭 JavaScript 时验证 canonical、互指 hreflang、目录跳转、两个语言切换、七条相关指南入口和无全页横向溢出。实际下载脚本内容与发布源字节一致。正式交付另记。

## 正式交付

GitHub `main` 的 `87feb9c` 在干净归档通过 90 项自动测试。站点检查覆盖 62 个 HTML、61 个从首页可达的 sitemap 页面和 336 个静态资源引用。预览中英文页、Python 脚本和 JSON 与归档逐字节一致。北京时间 12:16，Worker 版本 `59ced800-1969-47ae-98b6-d7c5bc695513` 承接全部流量，部署 `71f30c76-c8bb-443c-9ea3-6c0aff5d1acd`。正式站 12 个相关路径均为 HTTP 200、与归档逐字节相符。验收使用直接 HTTP。

发布后两页在精确 Search Console 资源中均显示尚未识别。[英文页](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=taVp44zmFSKQNQJHCDmTcQ)收到已加入优先抓取队列的回执。[中文页](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=tVI1eCz50VWbvDMFLswIMA)因当天手工提交配额被拒绝，保持站点地图和站内入口，未重复提交。两页普通收录和上线后效果待验证。
