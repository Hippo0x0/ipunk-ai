# LM Studio 本地 API 指南

2026-11-28 新增英文页面 `/en/guides/lm-studio-api/`，处理 OpenAI 客户端怎么填地址、如何读取实际模型 ID，以及如何发出第一条请求并核对响应。首页提供中英文入口，对比页与本地运行指南提供英文入口。

## 搜索需求

[Google Trends](https://trends.google.com/trends/explore?geo=US&q=lm%20studio%20api,lm%20studio%20server,lm%20studio%20openai%20api,lm%20studio%20local%20server&hl=en) 的美国过去一年网页搜索共取 52 个完整周。排除 11 月 22 日开始的未完成周。原始导出见 [CSV](2026-11-28-lm-studio-api-trends.csv)。

| 查询 | 平均相对指数 | 有信号周 | 11 月 15 日当周 |
| --- | ---: | ---: | ---: |
| lm studio api | 35.06 | 43 | 5 |
| lm studio server | 33.65 | 46 | 5 |
| lm studio openai api | 12.02 | 32 | 1 |
| lm studio local server | 18.02 | 33 | 2 |

这些是同一组查询的归一化指数。上线后的曝光、点击和收益仍待 Search Console 与经营数据核对。

## 实测与页面验收

- 11 月 27 日在限制网络访问为 loopback 的环境中预载 Qwen 模型。兼容接口列出了 `ipunk-small`。普通聊天返回该模型 ID 和 `LOCAL_OK`，流式聊天返回相同内容并以 `[DONE]` 结束。页面链接原始 JSON 和可下载的复测脚本。
- 11 月 28 日核对 LM Studio 官方服务、OpenAI 兼容接口、原生 REST 接口和令牌文档。独立环境安装先因临时文件写入失败中断，改用工作卷后官方运行时下载仍失败。本轮的真实 API 示例沿用 11 月 27 日结果。
- 页面含服务无法连接、模型列表无法读取和聊天请求失败三条 SVG 决策路径。1440 px 和 390 px 下核对首答、目录、锚点、缩放、键盘和正文宽度。

## 发布

- 北京时间 2026-11-28 15:32，提交 `388b3dc` 已推送到 `main`，Cloudflare Worker `ipunk-ai` 版本 `1f7e2573-7f48-4f37-ac32-cdc2837541ea` 接收 100% 流量。
- 发布包通过 95 项测试以及 87 个 HTML、86 个 sitemap 页面和 486 个静态资源引用的检查。Worker 预览地址 TLS 超时。正式域的 10 个检查目标均返回 HTTP 200，响应正文与发布包逐字节一致，响应头未发现 `noindex`。
- 发布后 Search Console 显示新 URL 尚未被 Google 发现。后续用相同 URL 核对收录及搜索表现。
