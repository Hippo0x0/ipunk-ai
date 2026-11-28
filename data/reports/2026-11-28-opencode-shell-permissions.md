# OpenCode Shell 权限指南

2026-11-28 增加中英文指南，处理 V2 Shell 的规则顺序、命令没有确认提示、组合命令被拦截，以及无人值守时如何辨别实际执行结果。已有 OpenCode 项目页保留版本迁移、项目评测和文件写入实测，首页和配置页引到更具体的 Shell 指南。

## 搜索依据

Search Console 精确资源 `https://ai.ipunk.cn/`，Web final，洛杉矶时间 2026-10-28 至 2026-11-24。英文 OpenCode 项目页 18 次曝光、0 点击，平均位置 11.3。`opencode permissions` 关联该页，1 次曝光、0 点击、位置 65。中文项目页 3 次曝光，其中 `opencode 安全性` 1 次曝光、0 点击、位置 5。具体查询样本很小，仅作选题线索。GitHub 官方项目有针对已保存审批的真实问题报告，操作以当前官方[权限文档](https://opencode.ai/docs/permissions/)和[策略文档](https://opencode.ai/docs/policies/)为准。本次未独立测得关键词搜索量。

## 实测

OpenCode 2.4.1、macOS arm64。六次试验分别用独立 Git 仓库和用户目录、合成模型、回环网络限制。检查真实 Shell 工具事件和标准输出。两个 `git status` 请求执行成功。未批准的 `git log -1` 及被通用询问规则覆盖的 `git status --short` 在无人值守下被拒绝。包含被拒绝子命令的组合请求无命令输出。使用 `--auto` 时明确拒绝仍有效。六条进程退出码都是 0，工具状态区分成功与拦截。未实测 Desktop、已保存授权的持久性或向远端推送；已保存授权的说明基于官方文档，推送拒绝示例用无害的 `printf` 验证同类规则。

中英文各有三路 SVG 排查图。检查 390 px 与 1440 px 下的正常宽度、键盘高亮、缩放、目标章节、无脚本降级和公开结果下载。页面通过 sitemap 和各自语言的首页／项目页链接提供入口。

## 发布与首查

北京时间 11 月 28 日 15:40，提交 `7d0d113` 推送到 `main`，Cloudflare Worker `f3405870-c2d3-4f7d-a182-d7d5f3e22b31` 接收全部流量。发布包通过 95 项测试，检查覆盖 89 个 HTML、88 个 sitemap 页面与 500 处静态资源引用。Worker 预览域 TLS 超时。正式域 11 个检查目标全部返回 HTTP 200，正文与发布包一致，响应头未见 noindex。

初次 Search Console 检查显示两页均未被 Google 发现。保留当前链接和 sitemap，后续按同一 URL 核对实际收录、曝光和点击。
