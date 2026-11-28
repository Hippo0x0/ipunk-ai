# Apple Silicon Mac 首次运行本地大模型

新增规范路径 `/en/guides/run-llm-locally/`。面向美国英文搜索意图，帮助没有本地模型的读者完成下载、第一次推理和运行状态核对。现有 Ollama／LM Studio 页继续负责运行时迁移，Ollama 上下文页负责配置生效验证，Mac mini Qwen 页保留旧机器上的模型与速度记录。中文首页入口注明英文。

## 搜索依据

复用 11 月 24 日 [OpenSEO 研究](https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/5c3f50ee-1215-471a-9dc6-8c9b03906934)。Run LLM locally 的 US/en 第三方估算是 590/月、KD 16，Google Trends US Web 组 B 图内均值 13。CPC 未知，Trends 是相对热度。11 月 28 日重新核对英文竞争样本，Ollama 官方和独立指南已提供安装、首次请求和断网建议，不能宣称低竞争。此次增量是失败后的 GGUF 导入、卸载核对和受限进程重启的完整实测回执。较窄的 LLM memory calculator 样本为 40/月、KD 19，现有工具已覆盖相近任务，本轮将实际内存字段解释留在新指南里。竞争结果未验证固定美国城市的排名。

同日读取 AI 精确属性的 final Web 查询与页面明细，2026-10-28 至 11-24 返回 11 行，均零点击。网站日期维度的汇总单独见同日搜索记录。未复购关键词或新增跟踪器。[本轮选题报告](https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/2ad1ca78-deb8-4f05-b094-79bd42df207a)

## 执行证据

在 Apple Silicon、macOS 26.4.1 上用哈希校验后的 Ollama 0.40.18 命令行构建，测试进程绑定临时 loopback 端口，采用初始空模型目录和关闭云功能的设置。注册仓库的 qwen2.5:0.5b 下载遇到存储端重定向解析到非公网地址后被 Ollama 拒绝。保留原限制，以官方 Qwen 仓库下载的 491,400,032 字节 GGUF 继续，并核对了权重哈希。别名 qwen-local-first 的原生 API 返回 LOCAL_OK、done=true，运行列表报告 2,048 上下文和 100% GPU。停止后列表为空。

使用已有模型数据和 loopback-only 策略重新启动测试进程，重复请求仍成功。同策略外连负控返回 PermissionError 1。这是单次合成请求、缓存进程重启和指定外连负控。没有实际断开整台机器，也没有实测桌面版安装和注册仓库下载成功。教程标明这两条下载路径，实验回执在 dist/evidence/local-first/，只公开合成请求和相应的 API 结果。

## 页面验收与效果回收

站点地图、中英文首页和现有运行时对比页包含入口。首页由现有渲染器同步，原指南生成脚本保留新链接。加入原生 SVG 分流图，涵盖连接失败、模型缺失、收到回复或不确定。localhost 在 1440px 和 390px 实测键盘高亮、缩放、锚点和无页面横向溢出；禁用 JavaScript 后核对跳转和命令可用。测试进程在验收后停止。

正式 Worker 发布仍需要可用的 Cloudflare 授权。上线后先确认规范 URL 与证据文件的 HTTP 回执，再等待普通抓取，以首个完整可比窗口核对曝光、查询、点击和 CTR。搜索表现与部署、实测和浏览器检查分别记录。
