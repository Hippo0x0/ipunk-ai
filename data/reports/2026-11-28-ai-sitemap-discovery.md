# AI 站点地图重读与新页发现

2026 年 11 月 28 日，AI 站独立 Search Console 属性 `https://ai.ipunk.cn/` 的站点地图报表显示，`/sitemap.xml` 之前最近成功读取日期为 11 月 25 日，发现 33 个网页。同期正式站直接 HTTP 返回 200、application/xml，XML 有 75 个去重规范网址，与 Git 归档内容一致。robots.txt 允许抓取并声明同一 sitemap。抽查的时间剪辑、视频提帧和 Canva HTML 正式路由都是 200 且自规范化。

按 [Google 对站点地图较大变更的说明](https://support.google.com/webmasters/answer/7451001?hl=en)，对同一属性提交现有的地图地址一次。界面显示提交成功，表格随即更新为 11 月 28 日提交、11 月 28 日成功读取、发现 75 个网页。内容和 URL 与已发布版本相同。地图发现数与 Google 索引数口径不同。

## 新页发现状态

提交前，同属性抽查或前一轮的精确网址记录均显示 Google 无法识别下列地址。重读后精确 URL 检查返回 `Discovered - currently not indexed`，各页未报告最后抓取时间。

- [英文视频剪辑](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=R0ELhHW9K919a6Yy8sFQdA)
- [英文视频提帧](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=C5rembjX_2KzLF6M3MwV6Q)
- [英文 Ollama 排障](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=qcwsKMXdOOPapg7Q5bdhhQ)
- [英文 Ollama 结构化输出](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=xpHPMP4-bjok_Ec2psUunw)
- [英文 Ollama 流式 API](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=pvy0r4vDlPMlU2FOUDm0vg)

[英文 Ollama 兼容 API 对照页](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=sfqu6J5j5q5Zwmya67I7qg) 仍显示已收录，最近抓取 11 月 28 日 03:38 UTC。以上只表示抽查样本状态。

[Search Console 完整 Web 表现](https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fai.ipunk.cn%2F) 按太平洋时间日维度核对，11 月 13–19 日和 11 月 20–26 日两个完整周均为 19 次曝光、0 次点击。这两个窗口早于本次地图重读。收录与点击的实际变化待 Google 更新。
