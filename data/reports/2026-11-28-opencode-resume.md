# 恢复 OpenCode 会话

新增英文 /en/guides/opencode-resume/。处理继续最近会话、按 ID 打开、列表与历史对不上、导出和导入。中英文首页均有入口，英文项目页和配置页链接新页。纳入站点地图。

## 搜索依据

美国 Web [Google Trends 官方对比](https://trends.google.com/trends/explore?geo=US&q=opencode%20resume,opencode%20session,opencode%20session%20list,opencode%20continue&hl=en) 的 [CSV](2026-11-28-opencode-resume-trends.csv) 保留 52 个完整周。opencode session、opencode resume、opencode session list、opencode continue 平均相对指数分别为 32.38、2.88、0.67、2.65，出现可见热度的周数为 44、9、3、9，最近完整周指数为 18、2、1、3。opencode session 含其他会话任务，不能将其热度都归给恢复。本轮无绝对搜索量、难度、可归因点击预测。[OpenCode 官方命令](https://opencode.ai/docs/cli/commands)已有操作，[Noteheld](https://noteheld.com/guides/resume-opencode-session)和 [GetAgentTools](https://getagenttools.com/blog/opencode-resume/) 已讨论项目范围。本站补上同版会话 ID 与实际请求历史标记的对照，以及导出、脱敏和导入恢复。

## 实测

OpenCode 2.4.1 在 macOS arm64 的临时 Git 仓库和独立 XDG 资料中运行。回环夹具只回复固定文本并记录合成提示标记。启用回环网络限制和全量工具拒绝规则。两次新会话得到不同 ID。--continue 保留第二个 ID 与同会话标记，--session 恢复第一个。完整导出保留提示标记，脱敏导出未含这些标记。完整导出导入新资料后保留 ID，下一请求包含原提示。额外测试显示，干净资料下指定缺失的 ID 会按同 ID 创建新会话，未发送原历史。不同首次提交的另一仓库列表为空，两个未提交仓库的列表则看到了同一条 global 记录；从第二个未提交目录继续创建了新会话。仅覆盖被测试的 CLI 和记录，未测试真实模型表现、图形客户端、跨版本迁移或脱敏对所有敏感字段的覆盖。

390px 和 1440px 用 Chromium 核对独立章节跳转、键盘高亮和缩放、表格宽度、证据下载与无脚本浏览。决策树按最近、较旧和缺失／不确定分流。
