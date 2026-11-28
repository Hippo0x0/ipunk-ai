# Ollama 结构化输出与结果校验

新增英文规范页 `/en/guides/ollama-structured-output/`。覆盖原生 JSON 模式、原生 JSON Schema、OpenAI 兼容格式、完成状态及提取结果验证。双语首页集成分组、已有安装和 SDK 指南提供入口，中文首页注明英文。原生 SVG 分流普通 JSON、指定字段和不确定或验证情形。

## 搜索依据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=ollama%20structured%20output,ollama%20json%20schema,ollama%20json%20mode,ollama%20json%20output&hl=en) 的 [CSV](2026-11-28-ollama-structured-trends.csv) 排除 11 月 22 日部分周。ollama json schema 在 52 个完整周中有 12 周非零或低于 1，均分上界 15.52；ollama structured output 为 6 周、6.90；另外两词更稀疏，最近完整周四词均为 0。只是图内搜索兴趣，不能推算流量。

[Ollama 官方 structured outputs 文档](https://docs.ollama.com/capabilities/structured-outputs) 已提供通用示例。本页用同一小模型对照原生和兼容响应，以及 HTTP 成功但输出不可用的场景。

## 实测

Apple M4、macOS 26.4.1 arm64、Ollama 0.40.18。临时模型目录中导入已核对的 Qwen2.5-0.5B-Instruct Q4_K_M，网络仅回环。相同冲突提示的 JSON 模式输出有多余键，原生和兼容 Schema 返回了满足结构的整数 1。换成明确要求提取七颗螺丝的提示，两种端点都返回 7。将原生生成限制为一 token 时返回 HTTP 200 和 length，回复为空。不能从一组约束推断复杂模式支持或提取准确率。

公开两种示例请求、六个观察和可下载的 Python 校验器。校验器在真实原生/兼容响应对照中通过四组，拒绝有多余键和被截断的两组；另验证已知值不符、布尔值、数字字符串、重复键、非正常结束等失败场景。调用样例要求读者核对本地模型标签。

localhost 390px 和 1440px 检查首答、键盘高亮、缩放、章节跳转、表格和页面无横向溢出、证据下载和三个请求或脚本入口。禁用 JavaScript 后仍可读命令并跳转。

## 正式交付

内容提交 `96cb09f` 干净归档通过 93 项测试。站点检查覆盖 73 个 HTML、72 个首页可达地图页及 407 处静态资源引用。预览新页和校验器与归档一致。Worker `5aff913b-b0d1-4e3a-9b02-f652cc1585eb` 部署至 100% 生产流量。正式域 11 个路径均返回 HTTP 200，且与归档逐字节一致，采用直接 HTTP。

[新页网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=MaF-X-UgyNRo0R9N6_fXzA) 显示 Google 暂未识别。已有 SDK 指南已收录，最近抓取 11 月 28 日 03:38 UTC，早于加入新链接。AI 站 Web 完整数据更新到 11 月 26 日，11 月 19–26 日共 25 次曝光、0 次点击，也早于本次上线。待新完整窗口验证。
