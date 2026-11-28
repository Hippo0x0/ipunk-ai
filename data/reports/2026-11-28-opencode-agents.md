# OpenCode AGENTS.md 项目指令

新增英文 /en/guides/opencode-agents-md/，覆盖全局、根目录和子目录规则，CLAUDE.md 回退，配置中的 instructions，以及原会话下一次请求何时收到更改。中英文首页和英文 OpenCode 项目、配置页均有入口。加入站点地图，独立于同站 Codex 的 AGENTS.md 指南。

## 搜索依据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=opencode%20agents.md,opencode%20rules,opencode%20init,agents.md%20opencode&hl=en) 的 [CSV](2026-11-28-opencode-agents-trends.csv) 保留 52 个完整周。opencode agents.md、opencode rules、opencode init、agents.md opencode 的同图平均相对指数为 16.15、32.00、0.02、15.21，出现可见热度的周数为 25、30、1、23，最近完整周依序为 5、3、1、5。未推算月搜索量或预期点击。泛词 rules 与权限等任务有交集，本页定向项目说明文件。[OpenCode 官方指令文档](https://opencode.ai/docs/instructions) 已描述范围、顺序和更新。本页提供实际请求证据，而不把模型答复当作加载证明。

## 实测

OpenCode 2.4.1 在 macOS arm64 的独立临时 Git 仓库和 XDG 资料中运行，关闭自动更新，禁止工具动作，出站限制为回环。回环端点读请求中的合成标记并返回固定文本。根、包、深层三个工作目录，均匹配全局、当前工作目录逐级向上、配置附加文件的顺序。仓库在独立 HOME 之外，Git 根目录上方标记未进入请求。同目录两种文件都有时仅出现 AGENTS.md；上级目录只有 CLAUDE.md 时可与其他层同时出现。全局回退和禁用开关都通过。修改包文件后，用新的独立 CLI 命令继续同一会话，下一请求含新标记，历史中也保留旧标记。仅验证读取、合并顺序和发送，不验证模型遵循效果或探索子目录时的发现。

Chromium 在 390 与 1440 px 核对首答、规范地址、三条分流、键盘高亮、章节链接、缩放复位、表格和整页宽度及证据下载。禁用 JavaScript 后仍可阅读和跳转。
