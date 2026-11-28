# 浏览器移除视频音轨

新增英文工具页 `/en/guides/mute-video/`。MP4、MOV 或 WebM 在本机复制兼容画面流、移除所有音轨，生成可预览和下载的静音文件。MP4/MOV 导出 MP4，WebM 继续用 WebM。英文首页、视频转换、时间剪裁和已收录的音频提取页提供入口，站点地图增加规范网址。

## 选题依据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=remove%20audio%20from%20video,mute%20video,remove%20sound%20from%20video,remove%20audio%20from%20mp4&hl=en) 与 [原始 CSV](2026-11-28-mute-video-trends.csv)，52 个完整周，排除 11 月 22 日部分周。mute video、remove audio from video、remove sound from video 均在 52 周有非零或低于 1 的读数，均分上界分别为 73.27、39.87、24.75，最新完整周分别为 61、33、21。remove audio from mp4 为 6 周、均分上界 0.73，最近周为 4。指数仅用于同图选题，不代表本站流量。

公开样本 [Candid Tools](https://candidtools.com/mute-video) 也提供本地去声。本页在站内既有视频编辑任务中补全静音导出，并公开视频包逐项核验，便于核对复制结果。[音频提取页](https://ai.ipunk.cn/en/guides/extract-audio-from-video/) 的目标是保存声音，Search Console 显示已收录、11 月 26 日 21:36 UTC 抓取。它新增通往保留画面的明确入口。

## 实现与验收

使用固定版本 Mediabunny 1.66.4 的强制复制模式，不兼容时显示失败。重新打开输出，确认只保留一个视频轨、编码一致且时长可读。多音轨输入删除全部声音，已无音轨的文件不重复生成。其它轨道需要可保留它们的编辑器。文件最多 250 MiB。取消或失败不显示下载，一般换文件时回收预览 URL。只有一条输出路径，正文按来源和任务分流，未加重复决策树。

macOS Chrome 在 390px 与 1440px 检查首页入口、预览、实际下载、全页无溢出与无外发素材。四组样片分别为单音轨 MP4、双音轨 MP4、MOV 和 WebM。每组输出均为零音轨、尺寸相同、编码相同，且前后 96 个视频包的 SHA-256 顺序完全相同。另核对已静音视频、非视频输入和无 JavaScript 的说明与章节跳转。公开对照为原始合成素材的检查摘要。
