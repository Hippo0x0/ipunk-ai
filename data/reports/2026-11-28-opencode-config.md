# OpenCode 配置文件和生效顺序

新增英文 /en/guides/opencode-config/，核对文件位置、工作目录及覆盖顺序。中英文首页、英文项目页与 Ollama 接入页均有入口。保持原有权限、插件加载和模型端口排查页的任务分工。新页进入 sitemap。

## 搜索依据

Search Console 独立 AI 属性 10 月 30 日至 11 月 26 日最终版 Web 页面表，英文 OpenCode 项目页 18 次曝光、0 点击、平均排名 11.3，在 9 个返回页中曝光最高。该数据用于选择产品，未观察到本站 opencode config 的明确查询行。

[Google Trends 官方美国 Web 对比](https://trends.google.com/trends/explore?geo=US&q=opencode%20config,opencode%20json,opencode%20config%20file,opencode%20debug%20config&hl=en) 的 [CSV](2026-11-28-opencode-config-trends.csv) 保留 52 个完整周。opencode config、opencode json、opencode config file 的同图平均相对指数分别为 39.40、8.75、3.38，出现可见热度的周数分别为 45、26、15，最近完整周分别为 11、4、3。opencode debug config 显示为 0，可能低于阈值。没有月搜索量、难度或点击预测。[OpenCode 官方配置](https://opencode.ai/docs/config/)与 [Everpod](https://everpod.ai/guides/opencode-config) 已覆盖路径或命令。本页增加同版的已读取文件和最终代理字段对照，以及从 monorepo 根目录与包目录运行的差异。

## 实测

OpenCode 2.4.1，macOS arm64，七个临时 Git 或仓库外目录。独立 HOME 和 XDG 配置，自动更新关闭，出站仅允许回环。使用合成模型 ID 和生效字段作为探针。分别读取 debug config 的源文件条目和 debug agents 中 Build 的最终模型。根目录 JSONC 覆盖同名 JSON 设置，.opencode 中同字段覆盖根目录。仓库外显式 OPENCODE_CONFIG 可覆盖用户配置，进入仓库后测试的冲突由项目文件胜出。子包仅在当前工作目录位于该包内时覆盖测试的根配置。标题代理的全局模型在七组中均保留。另验证 debug paths 会显示 XDG 指定目录。没有测试托管配置、实际供应商调用或模型输出。初次尝试通过本地响应夹具验证实际请求超时，未计为成功；公开结果只使用已通过的诊断命令。

沿用原生 SVG 按「文件缺失、值冲突、不确定」分流。Chromium 在 390 与 1440 px 核对首答、规范地址、三个独立章节链接、键盘高亮、缩放复位、证据下载、表格与整页宽度。关闭 JavaScript 后仍可跳转并阅读步骤。

## 正式交付

内容提交 `0431209` 的干净归档通过 93 项测试。站点检查覆盖 81 个 HTML、80 个可从首页到达的站点地图页面、455 处静态资源引用。Cloudflare 预览的新页与公开证据均与归档一致。北京时间 14:44:13，Worker 版本 `8279ad38-c30a-45e8-8305-a764508b292e` 开始承接全部流量。正式域 9 个相关 URL 均 HTTP 200，响应与归档逐字节一致。

[Search Console](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=rx2GyBPpITS1bsRm_LVAhg) 显示发布后 Google 尚未识别新网址。正式站点地图已包含该页。收录及新版搜索点击仍待后续验证。
