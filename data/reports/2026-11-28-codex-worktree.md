# Codex 会话分叉与独立 Git 工作树

新增英文规范页 `/en/guides/codex-worktree/`。覆盖保留原会话另开思路、用工作树隔离文件，以及继续原会话三种任务。区别于现有 resume 页的找会话和 ID 校验。两种语言首页、Codex CLI 项目页和 resume 指南增加普通链接，中文入口注明英文。新页进入 sitemap。

## 搜索需求

[Google Trends 官方图](https://trends.google.com/trends/explore?geo=US&q=codex%20worktree,codex%20worktrees,codex%20fork,codex%20fork%20session&hl=en)为美国 Web、过去 12 个月。[官方 CSV](2026-11-28-codex-worktree-trends.csv)排除 11 月 22 日部分周后有 52 个数据点。

| 查询 | 图内均值 | 11 月 15 日完整周 |
| --- | ---: | ---: |
| codex worktrees | 26.8 | 2 |
| codex worktree | 25.8 | 6 |
| codex fork | 17.1 | 8 |
| codex fork session | 0.4 | 0 |

相对指数不能换算月量或预计点击。英文竞争样本 [Harness Notes](https://harnessnotes.com/session-forking)、[Shuriken](https://shuriken.sh/guides/codex-worktrees-parallel-agents) 与 [Arantic](https://docs.arantic.com/codex/worktrees) 已覆盖 fork 与工作树的区别。本页提供同一父会话、同一脏工作目录的两个真实 CLI 结果，以及公开的 Git 路径、提交、文件对照。未确认城市排名。

## 运行与范围

复用前一轮按官方 npm SHA-512 校验的 macOS arm64 Codex CLI 0.172.0。仅使用新建临时 Git 仓库、临时配置和合成会话。外网禁用。回环 Responses 桩只返回固定字符串并核对输入含合成父提示标记。没有使用真实模型、用户会话或外部 API。

测试原始目录以一个提交为基线，另有一个未提交的跟踪文件改动和一个未跟踪文件。先创建保存的父会话，再用同一父 ID 执行普通 `exec fork` 和 `exec fork --worktree`。两个子会话 ID 均新，第二轮各有一个请求带父提示标记，父会话文件逐字节不变。普通 fork 记录原路径。工作树 fork 的记录路径与 `git worktree list` 新目录一致，新目录处于 detached HEAD，起始提交与原目录相同。原目录两项未提交内容均未出现在新目录。测试者从终端编辑新目录的跟踪文件，核对原目录文件不变。未测桌面设置、跨机、合并或模型改代码。

依据 [Codex CLI fork 参考](https://learn.chatgpt.com/docs/cli/reference#codex-fork) 与 [工作树文档](https://learn.chatgpt.com/docs/environments/git-worktrees)。交互命令来自文档和 CLI 帮助，实际试验覆盖非交互命令。使用原生 SVG 将继续对话、分叉会话和创建工作树链接至相应步骤。

本轮开始时 Search Console 已确认英文 Ollama 配置页收录，北京时间 12:18:34 抓取，规范与站点声明一致。Codex resume、中文 Ollama 配置和 GPU 指南当时仍未识别。当前没有新工作树页上线后的搜索效果数据。

localhost 在 390px 和 1440px 验证首答、键盘高亮且不改 hash、缩放及复位、三个步骤跳转、无全页溢出和下载文件字节。禁用 JavaScript 后仍有步骤入口与命令。正式交付另记。
