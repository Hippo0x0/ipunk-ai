# 查找与迁移 Ollama 模型目录

新增英文 /en/guides/ollama-models-location/，覆盖默认目录、确认实际运行的服务端、完整复制模型库、切换路径、验证标签和回滚。英文入门与清理指南以及中英文首页均链接新页。原卸载页维持删除与内存占用的任务，新增页处理保留模型状态的迁移。

## 搜索依据

Search Console 的 10 月 30 日至 11 月 26 日最终版 Web 页面表有 9 行。已观察到英文 OpenCode 项目页 18 次曝光、0 点击，英文 Canva 指南 3 次曝光、0 点击。OpenCode 同一意图在此前已经更新，当前 Canva 浏览器未登录，官方图片转视频说明注明该功能在中国不可用。本轮使用可本机复现的 Ollama 迁移任务。

复用 [Google Trends 官方美国 Web 12 个月数据](https://trends.google.com/trends/explore?geo=US&q=ollama%20delete%20model,ollama%20rm,ollama%20models%20location,ollama%20remove%20model&hl=en) 和已存 [52 个完整周 CSV](2026-11-28-ollama-remove-trends.csv)。ollama models location 在该比较组的平均相对指数为 26.6，最新完整周为 2。本站尚无这个查询的可见展示行，月搜索量、KD、点击和盈利未知。同类 [RunItLocal](https://runitlocal.io/learn/where-ollama-stores-models) 和 [Storage Cleaner](https://storagecleaner.dev/guides/move-ollama-models-external-drive) 已覆盖路径及复制。本页增加空目标对照、原路径不可用时的离线验证和回滚。平台步骤核对 [Ollama FAQ](https://docs.ollama.com/faq#where-are-models-stored)、[Docker 安装示例](https://docs.ollama.com/docker)和 [Docker cp](https://docs.docker.com/reference/cli/docker/container/cp/)。

## 实测

使用此前已导入的 Qwen2.5-0.5B-Instruct Q4_K_M，通过独立 macOS arm64 临时目录、独立 HOME 和回环端口运行 Ollama 0.40.18。服务器和客户端都应用同一只允许回环的 macOS 沙箱配置，同时关闭 Ollama 云功能。测试只读取此前生成的独立模型夹具。

从原库请求返回 HTTP 200 和 LOCAL_OK。切到空目录时已安装列表为空，原生生成 API 返回 HTTP 404。停止服务、通过 rsync -a 复制整个库，确认四个普通文件 SHA-256 与一个相对软链接目标一致。先保留备份并临时移开原路径，再用目标库启动，得到同一标签、摘要和 LOCAL_OK。复原路径和配置后原库也通过验证。只验证 macOS CLI 与同机两个隔离路径。未实测物理拔盘、桌面应用、Windows、Linux 或 Docker。

Chromium 本地验证 390 与 1440 px。五个分支都能用键盘高亮且不改变 URL，步骤链接进入独立的正文目标，图可放大与复位，整页无横向溢出。无 JavaScript 时仍可跳转并读到命令。验证了证据下载与源文件一致。正式发布另记。

## 正式交付

提交 `e75dfb3` 的干净归档通过 93 项测试。站点检查覆盖 79 个 HTML、78 个从首页可达的站点地图页面，及 445 处静态资源引用。Cloudflare 预览的页面和 JSON 与归档一致。北京时间 14:18:26，Worker 版本 `0408509d-8467-4447-bcd3-0e6c1c2eb0ed` 开始接收 100% 流量。直接 HTTP 检查正式域 9 个路径，均返回 200，结果逐字节匹配。新网址已列入站点地图。

发布后的 [Search Console 网址检查](https://search.google.com/search-console/inspect?resource_id=https://ai.ipunk.cn/&id=gtA2b0cGgXdJMq2izS9hAQ) 显示 Google 尚未识别网址。未重复提交站点地图。收录、搜索点击和盈利效果仍待验证。
