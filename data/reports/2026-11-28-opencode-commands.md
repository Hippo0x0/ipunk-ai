# OpenCode 自定义斜杠命令

新增英文 /en/guides/opencode-custom-commands/。覆盖 Markdown、JSONC、参数、作用域与 V2 的脚本用法。英文项目页、配置指南及中英文首页设置入口。正式 XML 站点地图新增规范地址。

## 搜索依据

[Google Trends 官方美国 Web](https://trends.google.com/trends/explore?geo=US&q=opencode%20commands,opencode%20custom%20commands,opencode%20slash%20commands,opencode%20command&hl=en) 的 [CSV](2026-11-28-opencode-commands-trends.csv) 有 52 个完整周。四词同图平均相对指数为 10.10、0.29、0.27、40.50，可见热度周数为 26、1、1、46，最近完整周依序为 4、0、0、20。广义命令同时包含安装和 CLI 参数，不按自定义命令需求全量归因。无月搜索量或预计点击。[OpenCode 官方命令](https://opencode.ai/docs/commands)已有模板语法，[上游公开问题](https://github.com/anomalyco/opencode/issues/49903)已讨论 V2 的无界面行为，本页补上三种展开、真实请求与纯 CLI 对照。

## 实测

OpenCode 2.4.1、macOS arm64。另建 Git 目录、用户资料和认证的本机 API 服务。网络仅允许回环，禁止代理工具，模板不含 Shell。用合成模型记录发布的请求文字。嵌套同名 Markdown 取项目文件，位置参数保留引号中的词组并将剩余文本加入最高占位符。JSON 的全量参数保留原引号，无占位符则在空行后追加。三个命令 API 请求均返回 204，另核对实际模型请求。直接在 opencode run 传斜杠消息，服务器收到原文，旧 --command 标志退出失败。未把终端 UI 文档步骤写成实测。

Chromium 在 390 和 1440 px 核对三条分流、独立步骤链接、键盘高亮和缩放复位、表格宽度、下载及无 JavaScript 正文。
