# 本地模型选型与上下文核验页面

日期：2026-11-27。范围：两个英文既有方向的新任务页，以及同机实测、下载脚本和本地报告读取工具。效果目标为搜索点击与进入核验工具的使用；本轮尚无点击或渗透提升结论。

## 选题依据与意图区分

| 规范路径 | 主要任务 | 与既有内容的区别 |
| --- | --- | --- |
| `/en/guides/ollama-vs-lm-studio/` | 判断本地运行时是否适合当前工作流，迁移同一模型文件与 API 请求，并检查缓存后的受限进程重启 | 原 Mac mini 页测 M4 32GB 上的大模型；新页在另一台 M3 Pro 上验证小 GGUF 的接入，不复写宽泛跑分榜 |
| `/en/guides/ollama-context-length/` | 设置原生 API 的 num_ctx，并核对正在运行的 context_length | 与产品选型分开，解决一个配置是否生效的问题；不扩大为泛 Ollama 内存排障页 |

需求复用 11 月 24 日已保存研究：OpenSEO 项目报告 `5c3f50ee-1215-471a-9dc6-8c9b03906934`。本轮实际读取完整报告，保留其观测日期及目标 US/en、Web、过去 12 个月范围。

- Google Trends 组 B：Ollama vs LM Studio 的图内均值为 9；该次留存图表最近完整周 11 月 15 日为 5。
- Google Trends 组 A：Ollama context length 图内均值为 14；未取得该系列最近一周的独立数值，不补写。
- 第三方旧估算分别为 1,900/月、210/月，日期为 11 月 24 日；它们不是官方绝对量，更不是预测本站点击。两张图分别归一化，不跨组比较原始指数。

报告当时已按美国英文桌面结果检查竞争，并指出 Dottie 已有同模型 Mac 测试。本轮补读 Local UseCases 同题文章及官方资料；其内容已经覆盖模型管理、API、无界面运行和既有测试。原创增量在可下载的严格 loopback 客户端、模型 ID 的实际踩坑、同文件哈希核对及受限进程重启回执，不声称独占或低竞争。本轮没有复购关键词、保存关键词或新建跟踪器。

原始需求链接：

- https://app.openseo.so/p/d805176c-6e1f-4ca4-834b-9aa48dfd74a0/reports/5c3f50ee-1215-471a-9dc6-8c9b03906934
- https://trends.google.com/trends/explore?geo=US&q=ollama%20vs%20lm%20studio,run%20llm%20locally,llm%20memory%20calculator,mac%20mini%20ai%20server,codex%20usage%20limits&hl=en
- https://trends.google.com/trends/explore?geo=US&q=ollama%20context%20length,codex%20token%20usage,mac%20mini%20local%20llm,mlx%20vs%20gguf,markitdown&hl=en
- https://localusecases.com/guides/ollama-vs-lm-studio/

## 本轮原始执行证据

实际机器是 Apple M3 Pro，系统报告内存 19,327,352,832 字节、macOS 27.2.1；不能使用旧 M4 页的设备或性能数据替代。

从 Qwen 官方 Hugging Face 仓库下载 Qwen2.5-0.5B-Instruct Q4_K_M GGUF，初次超时后续传完整文件，共 491,400,032 字节。SHA-256 为 `74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db`，与官方文件页显示一致。两种运行时复用同一个源文件，没有再下载第二份 Qwen 权重。

Ollama 0.40.18 以 Homebrew `arm64_golden_gate` bottle 临时解包运行，bottle 哈希经核对。跳过归档中指向外部 MLX 依赖的链接，GGUF 实测使用包内 llama.cpp/Metal 后端，`/api/ps` 报告 runner 为 llamacpp。曾尝试 Homebrew 安装，但其计划升级现有依赖，已在下载阶段中止；没有通过这次安装完成软件或依赖升级，也未修改 tap trust。官方大归档下载较慢且未完成，不把它记录成已验收的运行包。

Ollama 使用专用 loopback 端口 11435、临时模型目录、云功能关闭及 4096 默认上下文。创建 ipunk-small 测试模型后，模型 layer digest 与源 GGUF 相同。新版模型存储使用 manifests-v2 链接，读取其真实 model layer 核对，未把 tag manifest digest 当作权重 digest。

LM Studio 使用官方 `install.sh --no-modify-path` 安装 llmster，无需登录、未购买服务。实际 daemon 为 0.1.2+1，CLI 报告 commit 138dcff，GGUF 后端为 llama.cpp 2.83.0。通过 symbolic-link 导入上述源文件，沿导入路径再次计算哈希一致。首次用文件名前缀作为 load key 失败，`lms ls` 返回真实 key `qwen2.5-0.5b-instruct` 后加载成功，指定 API alias `ipunk-small`、context 4096、gpu max、parallel 1。仅启用 loopback 1235，不启用宽泛 CORS、不启动登录项。

普通和流式请求使用同一份 Python 客户端，两边均接受相同 alias，正文保持相同，仅 base URL 不同。温度 0，最多 32 个输出 token，固定合成 prompt 要求 LOCAL_OK。两边普通响应和流式响应均返回该文本，均有 stop 与 DONE。客户端普通运行回执保留在 `dist/evidence/local-runner/*-online-report.json`。

随后停止各测试进程，使用同一 macOS sandbox-exec 策略重新启动：默认允许、禁止外连、仅允许 loopback。模型和后端已经缓存。两边在此启动条件下再次完成普通和流式请求，回执单独存为 `*-restricted-report.json`，没有覆盖第一批。

同策略负控：loopback HTTP 返回 200/LOOPBACK_OK；显式外部数字 IP 的 socket 连接返回 PermissionError、errno 1。电脑本身没有断网；这是受限进程的缓存重启，不是系统重启、空缓存冷启动、抓包审计或完整离线／隐私保证。没有把常规操作系统文件缓存称为已清空。

独立上下文试验：Ollama 的模型和服务默认 4096，每次卸载此测试模型后分别请求 2048 与 8192；立即读取 `/api/ps`，context_length 分别为 2048 和 8192，回复均为 LOCAL_OK。原生完整请求、响应和运行值保存为 `ollama-context-checks.json`。短 prompt 只核对配置报告，不验证长文本回忆、架构最大窗口或准确率。

完整权重和运行时二进制不加入网站源码。公开文件只保留合成请求、API 回执、非唯一硬件信息、模型来源和哈希；不发布环境密钥、会话 ID、本机个人目录或原始完整服务日志。两套模型加载的速度、内存字段口径及内部模板未做公平控制，不提供性能赢家。

## 可用性与交付验收

Python probe 仅允许带显式端口的 127.0.0.1 或 ::1，限制到 `/v1`。关闭代理读取与重定向，限制响应长度、流帧和超时。API key 仅从本机 `LOCAL_LLM_API_KEY` 读取，不写报告；失败不保存服务器原始错误正文。外部地址和跳转负控通过。

浏览器端仅生成命令、读取本地文件，不从网站直接查询本地服务。报告解释器重新计算 LOCAL_OK 和流完成标记，不信任导入文件的结论字段，不认证运行时、权重等价、离线条件或性能排名。上下文工具生成原生请求并读取模型快照，缺失 context 字段为未知。

已完成：

- 70 项 Node 站点检查通过，其中包括 Python probe 测试包装；Python 内部 6 项用例另行执行通过。
- 47 个 HTML、254 处静态资源检查通过，所有新规范 URL 纳入 sitemap。
- Chrome localhost 实际生成探测命令；导入 Ollama/LM Studio 两份真实普通运行报告，导出 1,841 字节比较 JSON，独立解析确认没有擅自认证相同权重或性能赢家。
- 上下文工具实际解析合成的原生 JSON 形状，生成 num_ctx 8192 与 `/api/ps` 命令；外部地址被拒绝。发现提示混用 `/v1` 后已修复并在浏览器复核。
- 390px 检查两个页面的表格、字段、命令和文件入口。静态正文与下载保留，无 JS 时隐藏工具；未冒称完成实际禁用 JS 的全路径验收。
- 修复生成器重复运行时的断言，当前重建字节一致。原选型页生成器也同步新入口，后续日更不会抹去入口。
- Python 测试禁用 public 目录中的 bytecode 写入，移除自检产生的 pyc；公开证据扫描没有个人绝对路径或实际凭据。

分支选择已由任务表、模型列表和命令工具完成，未添加重复 SVG 决策树。两页显示真实测试／来源核对日期，不提前把尚未验证的部署日期写作 datePublished。版本和部署以交付回执为准。

## 后续回收

在同一正式版本确认统计接入后，分别观察两页的搜索引荐落地与后续行为：脚本／证据下载发起、命令生成、本地报告读取、比较记录导出和相关指南进入。同一会话至少一次目标行为占合格落地会话的比例才作为候选渗透口径；事件计数不能替代会话比例。

脚本在访客自己电脑运行，不应从下载次数推断执行成功；导入回执也只是客户提供的观测，不能当作独立认证。新增两个 tool_id 沿用既有白名单和隐私过滤，不采集模型名、地址、报告或快照内容；localhost 验收不产生正式域访问。

新增页等待真实上线、普通抓取和完整窗口。发布前数据不是零流量基线。分别核对查询、排名与点击，不以新增页数量、部署或工具点击称为增长，不把内部互链带来的流量转移直接算作全站新增。

两套本次测试服务与预览服务已关闭，loopback 端口复核无监听。保留已安装 headless 工具、缓存模型和源码证据以便复现，没有创建新定时任务或通知渠道。最终授权复核仍报告 Cloudflare OAuth 过期；本轮未重复启动登录、改 DNS 或创建其他站点，不能把源码提交描述为正式上线。
