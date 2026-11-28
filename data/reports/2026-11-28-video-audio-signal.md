# Video Has No Sound 新工具页

新增 `/en/guides/check-video-audio/`，按无音轨、零信号、有信号和无法确认四条路径排查 MP4 无声。适用范围覆盖导出的 Canva 视频，也包括其他编辑器的 MP4、MOV、WebM。保留原 Canva 指南里的生成、导出、音轨计数和裁剪，补上从结果到实际信号检查的入口。中英文首页及静音工具也加入入口。英文首发，中文入口标明语言。

## 搜索依据

同日 Search Console 的 Canva 指南有 3 次页面曝光和 0 次点击，公开查询 `canva ai video generator` 有 2 次曝光。这说明相邻主题已出现搜索能见度，不能据此估算无声排查词的点击。Google Trends 美国网页搜索过去一年图表去掉首尾未满周，以下是 2025-11-30 至 2026-11-15 的 51 个完整周，指数在同一组内归一化。 [趋势比较](https://trends.google.com/trends/explore?geo=US&q=mp4%20no%20sound,video%20has%20no%20sound,canva%20video%20no%20sound&hl=en)

| 查询 | 周均相对指数 | 有信号周 | 最后完整周 |
| --- | ---: | ---: | ---: |
| video has no sound | 67.65 | 50 | 73 |
| mp4 no sound | 2.24 | 5 | 13 |
| canva video no sound | 0.59 | 2 | 4 |

通用无声排查信号较稳定。选用通用工具页承接该意图，将 Canva 的操作放在对应结果里。Canva 步骤依据官方[音轨与音量说明](https://www.canva.com/help/trim-audio-and-adjust-volume/)和[视频导出说明](https://www.canva.com/help/download-video-as-separate-files/)。

## 处理与验证

- 懒加载现有自托管 Mediabunny。通过容器读取音轨数。单音轨按用户输入的起点解码最多 60 秒，逐声道取绝对峰值。结果仅针对解码到的窗口。样本全部为零、窗口没有样本、解码失败给出不同结果。小于 −120 dBFS 的非零结果按很低信号显示。没有上传、转码或写回源视频。
- 桌面 Chrome 在 390 px 和 1440 px 核对合成 MP4 三种结果，分别为无音轨、静音 AAC 和有声 AAC。有声 MP4 峰值为 −16.08 dBFS。另测有声 MOV、WebM、晚于末尾的时间点、尾段、不完整文件、替换与清除、解析模块不可用、无脚本降级。交互测试期间只观察到 localhost 的 GET 请求，未提交视频数据。
- 用浏览器合成一个 64 秒 WebM 检查时间窗口。0 至 60 秒为极低的非零信号，62 秒起有明确测试音，峰值 −13.56 dBFS。两音轨 WebM 正确提示逐轨检查。新增测试覆盖窗口边界、逐声道峰值和无样本情形。
- SVG 图的四个结果链接分别跳到真实章节。桌面和手机宽度核对键盘高亮、缩放、章节跳转、44 px 链接和无整页横向溢出。样例均为合成文件，本轮未做 Canva 实际生成、Safari 或 Firefox 验证。

## 发布

北京时间 11 月 28 日 16:02，内容提交 `0aa4111` 推送到 `main`，Cloudflare Worker 版本 `d9e0beb2-585b-418b-a7c4-429410e2f6e3` 接收全部流量。发布包通过 98 项测试，站点检查覆盖 91 个 HTML、90 个 sitemap 页面与 512 处静态资源引用。预览域 TLS 超时。正式域 15 个请求均返回 200，正文与发布包一致，响应头未见 noindex。

Search Console 显示新工具页暂未被 Google 发现。Canva 指南仍已收录，最近一次抓取是 11 月 25 日 09:01 UTC，本轮新增链接尚无抓取证据。等待常规抓取后的页面曝光与点击。
