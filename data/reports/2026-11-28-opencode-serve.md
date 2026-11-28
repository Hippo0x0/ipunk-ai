# OpenCode Serve 本机认证指南

## 搜索依据

Search Console 精确资源 `https://ai.ipunk.cn/`，Web final，洛杉矶时间 2026-10-29 到 2026-11-25，按页面分组。英文 OpenCode 项目页有 18 次曝光、0 次点击，平均位置 11.3，是该区间曝光最多的单页。中文项目页有 5 次曝光、0 次点击。前一天结束的查询与页面联合报告中，`opencode 安全性` 及 `opencode permissions` 各有 1 次曝光，分别进入中文和英文项目页。这几条查询只能作为选题线索，未取得 `opencode serve` 的本站曝光或独立搜索量。

原项目页只有服务密码和监听范围的原则说明。现增加中英文任务页，说明如何启动独立前台实例、验证监听和 HTTP 认证，再按无法连接、401 与意外 200 分流。原项目页与 Shell 权限页分别加入同语言入口。两篇各有自身 canonical、互指 hreflang、sitemap 和预渲染正文。

## 实测

2026-11-28 用 OpenCode 2.4.1 的 macOS arm64 二进制及回环网络限制，在两个一次性目录启动前台实例。各进程的 lsof 结果均只显示 127.0.0.1。分别配置新旧环境变量，对 /api/info 请求，无凭据、错密码、错用户名均为 401，正确用户名和密码为 200。再用指南里的两个 curl 请求验证 401、200。公开结果仅保留监听与状态码，无密码或本地路径。

说明以官方 [Web 文档](https://opencode.ai/docs/cli/web/)、[V1 迁移说明](https://opencode.ai/docs/migrate-v1/#server-authentication) 与 [API 参考](https://opencode.ai/docs/api/) 为准。实际运行范围为 V2 macOS 本机前台服务。V1、远程服务、后台服务和其他系统未实测。

中英文各有三路原生 SVG。localhost 用 Chromium 检查 390 px 与 1440 px 的宽度、分支文字、独立链接、键盘高亮、缩放、下载与禁用 JavaScript 时的跳转。
