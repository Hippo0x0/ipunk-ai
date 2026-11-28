# 本地视频时间剪裁

新增英文视频工具 `/en/guides/trim-video/`。支持选择一个连续的起止区间、预览并导出 MP4，显示实际输出时长和音轨状态。作为主站现有画面裁剪工具的相邻入口，从英文首页生成模板、视频转换和已有 Canva 导出指南链接。原来的入口都保留。新页加入站点地图。

## 选题依据

[Google Trends 美国 Web](https://trends.google.com/trends/explore?geo=US&q=trim%20video,video%20trimmer,trim%20mp4,cut%20video%20online&hl=en) 的 [CSV](2026-11-28-video-trim-trends.csv) 排除 11 月 22 日部分周后有 52 周。trim video 与 video trimmer 都有 52 周非零或低于 1，均分上界分别 43.58 与 11.08，最新完整周分别 14 与 4。trim mp4 与 cut video online 各有 51 周，均分上界 1.98 与 4.37。指数用来选择标题和任务表述，无月搜索量或站点流量预测。

[同类工具样本](https://www.cinobilabs.com/tools/video-trimmer) 已提供本地处理和时间范围。本页提供明确的实际导出时长、保留音轨检测和取消反馈，补全站内用法，不将重编码描述为无损。Canva 导出指南此前已收录，作为相关入口。

## 实现口径

复用现有站点 Mediabunny 1.66.4 和 [官方转码接口](https://mediabunny.dev/guide/converting-media-files#trimming)，在浏览器从原始视频起点计算时间戳，输出 MP4。文件最多 250 MiB，支持一个视频轨、最多一个音轨。关闭或更换文件时回收对象 URL，取消不显示部分下载。再次读取生成文件验证轨道和可读时长。输入和输出留在本机，没有新增交互数据采集。任务是单区间顺序剪裁，正文补充多区间和画面裁切的入口，未添重复决策树。

macOS Chrome 在 390px 与 1440px 验证从首页进入工具。四秒带音样片的 1–3 秒剪辑实测 2.008 秒，输出首帧的像素采样与源视频第 1 秒更接近，解码音频峰值约 0.127。竖屏成品维持 1080 × 1920，0.5–1.5 秒输出为 1 秒。MOV 与 WebM 均生成带音轨的 MP4，带错误顺序时间和纯音频文件不给出下载，取消后可以再次剪裁。核对真实 MP4 文件头、无外部请求和全页无溢出。禁用 JavaScript 后保留示例与步骤。

## 正式交付

内容提交 `027d6a5` 干净归档通过 93 项测试。站点检查覆盖 76 个 HTML、75 个首页可达地图页和 426 处静态资源引用。预览页与脚本与归档一致。北京时间 13:49，Worker 版本 `e9db615b-cb2a-4e96-9990-0aef6f32acef` 承接全部流量。正式域 9 个路径均 HTTP 200 且与归档逐字节一致，以直接 HTTP 核对。

[新页网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=DfMeU9i1fRC4JdKUZx63Vw) 显示暂未被 Google 识别。上轮的视频提帧页也尚待收录。新增曝光与点击仍需完整数据。
