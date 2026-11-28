# 11 月 28 日两篇新指南的索引请求

北京时间约 10:43，在 Search Console 的精确网址前缀资源 `https://ai.ipunk.cn/` 内确认了两次独立提交。两条均显示「已请求编入索引」和「已将网址添加到优先抓取队列中」。

| 页面 | 发布后、提交前的普通索引状态 | 请求回执 |
| --- | --- | --- |
| [Mac 本地模型首次运行](https://ai.ipunk.cn/en/guides/run-llm-locally/) | Google 无法识别此网址 | [网址检查](https://search.google.com/u/1/search-console/inspect?resource_id=https%3A%2F%2Fai.ipunk.cn%2F&id=6l_wuz0mhD1A58cY5lhM8A&hl=zh-CN) |
| [Codex 用量限制与重置时间](https://ai.ipunk.cn/en/guides/codex-usage-limits/) | Google 无法识别此网址 | [网址检查](https://search.google.com/u/1/search-console/inspect?resource_id=https%3A%2F%2Fai.ipunk.cn%2F&id=3ZeR1NZ16N6A60qAdRInqg&hl=zh-CN) |

正式站复查了中英文首页、robots.txt、站点地图、项目快照、统计入口及配置，七项均与本地发布内容一致。两篇的 HTTP 与源码指纹见[发布回执](2026-11-28-worker-release.md)。本次索引请求回执补齐了发布时未确认的操作。

现有可比 Search Console 数据仍是发布前的 final Web，洛杉矶时间 10 月 28 日至 11 月 24 日。按页面返回 8 行，均为零点击。按日期的汇总保留在[独立搜索记录](2026-11-28-independent-search.json)。两个页面都没有该期间的有效落地观测，不能把空样本写成上线后的零点击。

后续依次核对普通抓取时间、Google 选择的规范网址及已收录状态。普通抓取后的完整可比窗口按规范 URL 读取曝光、点击、CTR 与查询。索引请求没有揭示抓取完成时间，也未提供曝光或点击的证据。
