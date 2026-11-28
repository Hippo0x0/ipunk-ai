# 视频单帧 PNG 提取

新增英文工具页 `/en/guides/video-frame-extractor/`。输入本地视频和时间，预览并保存主视频轨单帧 PNG，也可直接选末帧。显示实际解码时间和输出尺寸。英文首页的生成模板、视频格式转换、GIF 工具和 Canva 导出指南增加入口，保留原有任务。新页进入站点地图。

## 搜索证据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=extract%20frame%20from%20video,video%20frame%20extractor,video%20to%20png,video%20screenshot&hl=en) 的 [原始导出](2026-11-28-video-frame-trends.csv)，取 52 个完整周，排除 11 月 22 日部分周。video screenshot 均分上界 65.29，最近完整周 40。video to png 均分上界 28.04、最近周 15，两词都有 52 周非零或低于 1。extract frame from video 和 video frame extractor 各 6 周有记录，最近完整周均为 1。这些相对指数支持按 video to PNG 和 screenshot 组织入口，无月搜索量或点击预测。

[Mastershot](https://mastershot.app/extract-frame/) 和 [ImageOnline](https://imageonline.io/video-frame-extractor/) 已有单帧导出。本页聚焦按时间选择、末帧和可核对的实际时间，复用站内同一套本地视频解码器。站点 Search Console 11 月 19–27 日最终页面报表中，Canva 指南有 3 次曝光、0 次点击。这里从其具体导出步骤提供提帧入口。

## 处理方式与验收

自托管 Mediabunny 1.66.4 从 Blob 读主视频轨，按相对首帧时间取帧，返回帧实际时间戳和显示尺寸。浏览器本机编码 PNG，文件和结果不上传。没有新增文件或工具交互采集。用户直接用时间和末帧控件完成选择，正文提供格式、显示尺寸和打不开时的下一步，不再添加重复决策树。

macOS Chrome 在 390px 和 1440px 分别从首页进入工具，验证 MP4 标准样片首帧及 1.125 秒 PNG 为 1280 × 720 且数据不同，四秒视频末帧为 3.958 秒。WebM 320 × 180、MOV 1280 × 720、竖屏 MP4 1080 × 1920 均成功。超出时长的输入和无视频轨 WAV 均不创建结果。检查页面无横向溢出、PNG 文件签名和本机测试无上传请求。禁用 JavaScript 时，示例和正文可读。
