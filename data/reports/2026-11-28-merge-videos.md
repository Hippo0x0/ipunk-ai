# 本地视频合并工具

新增英文 `/en/guides/merge-videos/`，可排列 2–8 段视频并合并成 MP4。输出按首段画幅适配其他片段，预览和下载前核对时长及轨道。英文首页生成模板以及剪裁、Canva 导出指南新增入口，新页进入站点地图。

## 选题

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=merge%20videos,combine%20videos,join%20videos,merge%20mp4&hl=en) 的 [CSV](2026-11-28-merge-videos-trends.csv) 排除 11 月 22 日部分周，得到 52 个完整周。combine videos、merge videos、join videos 三词在 52 周都有非零或低于 1 的值，均分上界分别为 78.85、51.92、38.81，最近完整周分别为 77、44、30。merge mp4 有 34 周、均分上界 5.96，最近周为 6。指数用来排列主要搜索用语，无法推算月搜索量。

[ReelSDK 同类工具](https://reelsdk.com/tools/merge-videos) 已提供浏览器内合并和画幅适配。本页补全本站「裁掉片头片尾，再组合」的顺序任务，关注切换处画面、声音顺序和可核对的实际输出。

## 实现

复用自托管 Mediabunny 1.66.4：[CanvasSource 和音频源](https://mediabunny.dev/guide/media-sources) 重新编码 H.264 与可选 AAC。画幅按首段确定，长边最多 1,280，其他画幅等比适配。各段以视频轨的时间区间为基准，声音重采样至 48 kHz 立体声。无音轨的片段在混合任务中留出相同长度的静音，全部无声时不生成音轨。总计 250 MiB、120 秒上限，限制浏览器的内存和编码负担。输出在本机重新检查正时长、预期时间与轨道数后才显示。没有文件上传或素材采集。已有排序控件可完成分流，不另加同任务决策树。

## 浏览器验证

在本机 Chromium 的 390 px 和 1,440 px 宽度验证了两种排序、导出画幅、黑边、声音与静音的衔接、无声输入不生成音轨，以及取消后重试。6 秒竖屏无声和 4 秒横屏有声素材在两个顺序均导出约 10.03 秒。WebM、MP4 和 MOV 三段混合导出 14.036 秒，顺序为有声、无声、有声。另检查了无效输入和禁用 JavaScript 时的导航。

## 发布与收录

2026-11-28 从干净提交 `861d554` 构建，93 项测试及站点检查通过。预览页与工具脚本逐字节比对通过后，Cloudflare Worker 版本 `391dea07-3fef-42f7-bd63-7ffab1d20d20` 已部署至 100% 流量。正式域的页面、站点地图、工具依赖和测试证据等 11 个 URL 均返回 HTTP 200，响应正文与发布文件一致，响应头未见 `noindex`。

发布后的 Search Console URL 检查为「Google 不知道此网址」，暂无抓取和收录记录。正式站点地图已包含该网址，未重复提交整个站点地图。
