"""Build two task guides only after their executed evidence is available."""
from pathlib import Path
import html
import json
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
EVIDENCE=DIST/'evidence/local-runner'
DATE='2026-11-27'

machine=json.loads((EVIDENCE/'model-and-machine.json').read_text())
for name in ['ollama-online-report','lmstudio-online-report','ollama-restricted-report','lmstudio-restricted-report']:
    report=json.loads((EVIDENCE/(name+'.json')).read_text())
    assert report['status']=='completed' and report['stream']['protocol_completed'],name
assert machine['sha256']==machine['lmstudio_import_sha256']
checks=json.loads((EVIDENCE/'ollama-context-checks.json').read_text())['observations']
assert [r['running_models']['models'][0]['context_length'] for r in checks]==[2048,8192]

def section(key,title,body):return f'<section id="{key}"><h2>{title}</h2>{body}</section>'

def page(slug,title,description,answer,sections):
    url='https://ai.ipunk.cn/en/guides/'+slug+'/'
    schema={'@context':'https://schema.org','@type':'TechArticle','headline':title,'dateModified':DATE,'inLanguage':'en','mainEntityOfPage':url}
    toc=''.join(f'<li><a href="#{key}">{label}</a></li>' for key,label,_ in sections)
    body=''.join(section(*s) for s in sections)
    out=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} | iPunk AI Radar</title><meta name="description" content="{html.escape(description,quote=True)}"><link rel="canonical" href="{url}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/guides.css"><link rel="stylesheet" href="/task-choice.css"><link rel="stylesheet" href="/local-runner.css"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{html.escape(description,quote=True)}"><meta property="og:url" content="{url}"><meta property="og:type" content="article"><script type="application/ld+json">{json.dumps(schema)}</script><script type="module" src="/analytics.mjs"></script></head><body class="guide-page"><header class="topbar"><div class="wrap nav"><a class="brand" href="/en/"><span>iP</span>AI Radar</a><nav class="navlinks" aria-label="Main navigation"><a href="#check">Check your setup</a></nav></div></header><main class="wrap guide-main"><div class="guide-header"><h1>{title}</h1><p class="guide-answer">{answer}</p><p class="guide-date">Tested and source-checked November 27, 2026</p></div><article class="article guide-article"><nav class="guide-toc" aria-label="On this page"><ol>{toc}</ol></nav>{body}</article></main><footer class="footer"><div class="wrap footer-inner"><a href="/en/">iPunk AI Radar</a><span>Tested <time datetime="{DATE}">Nov 27, 2026</time></span></div><p class="wrap" data-analytics-privacy><a href="/en/privacy/">Privacy &amp; analytics</a></p></footer><script type="module" src="/local-runner.mjs"></script></body></html>'''
    target=DIST/'en/guides'/slug/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(out)
    return url

comparison=[
('choose','Choose around model management and verification','''
<div class="video-table"><table><caption>Both can run local APIs and headless services</caption><thead><tr><th>Your task</th><th>What to try</th><th>Check before switching</th></tr></thead><tbody>
<tr><td>Keep scripts that use Ollama names and native settings</td><td>Stay with Ollama first; import a local GGUF when necessary.</td><td>The model tag, effective context and native API behavior.</td></tr>
<tr><td>Browse models and configure a desktop chat workflow</td><td>Review LM Studio’s desktop workflow. Our executed test below uses its headless llmster service.</td><td>Your desktop requirements separately; this test does not measure its GUI.</td></tr>
<tr><td>Serve a model without opening a desktop app</td><td>Either Ollama serve or LM Studio’s llmster can provide a local service.</td><td>A process restart after the model and runtime are cached.</td></tr>
<tr><td>Move an API client between them</td><td>Use the <a href="#check">same loopback-only probe</a>.</td><td>Model-list IDs, non-stream responses and complete streaming output.</td></tr>
</tbody></table></div><p>A desktop interface versus a terminal is no longer a complete comparison: LM Studio has the <code>lms</code> CLI and llmster, and Ollama offers local serving as well as other entry points. Choose a workflow you can operate and verify. We did not compare all desktop features, cloud features or supported models.</p>'''),
('tested','One GGUF file, four completed API checks','''
<p>On an Apple M3 Pro with 18 GiB of physical memory reported by macOS 27.2.1, we imported Qwen2.5-0.5B-Instruct Q4_K_M into both systems. The source file, Ollama model layer and LM Studio imported path have the same SHA-256. The 491,400,032-byte model was downloaded once; LM Studio imported a symbolic link to it.</p>
<div class="video-table"><table><caption>Our local request exercise, not a speed or quality ranking</caption><thead><tr><th>Observation</th><th>Ollama</th><th>LM Studio headless</th></tr></thead><tbody>
<tr><td>Installed runtime</td><td>0.40.18; Homebrew bottle; llama.cpp backend</td><td>llmster 0.1.2+1; CLI commit 138dcff; llama.cpp runtime 2.83.0</td></tr>
<tr><td>Configured and observed loaded context</td><td>4,096</td><td>4,096; parallel setting 1</td></tr>
<tr><td>Ordinary chat response</td><td>LOCAL_OK</td><td>LOCAL_OK</td></tr>
<tr><td>Streaming chat response</td><td>LOCAL_OK, stop reason and DONE marker</td><td>LOCAL_OK, stop reason and DONE marker</td></tr>
<tr><td>Cached model after a network-restricted process restart</td><td>Ordinary and streaming requests completed</td><td>Ordinary and streaming requests completed</td></tr>
</tbody></table></div>
<p>The common requests used temperature 0, at most 32 output tokens and the prompt <code>Reply with exactly LOCAL_OK and nothing else.</code> Both accepted the API alias <code>ipunk-small</code>; the shared request body stayed unchanged while the base URL changed. Chat templates, runtime builds and all internal defaults were not controlled uniformly. No throughput, answer-quality or memory-efficiency winner follows from this exercise.</p>
<p><a href="/evidence/local-runner/ollama-online-report.json" download>Ollama ordinary-run report</a> · <a href="/evidence/local-runner/lmstudio-online-report.json" download>LM Studio ordinary-run report</a> · <a href="/evidence/local-runner/model-and-machine.json" download>Model hash and machine details</a></p>'''),
('move','Reuse a file, then confirm the model identifier','''
<p>Keep the GGUF in a location you intend to retain. In Ollama, create a Modelfile pointing to it and create a test model:</p>
<pre><code>FROM /path/to/qwen2.5-0.5b-instruct-q4_k_m.gguf
PARAMETER num_ctx 4096</code></pre>
<pre><code>ollama create ipunk-small -f Modelfile
ollama list</code></pre>
<p>For LM Studio, the tested CLI supports linking an existing file rather than downloading it again:</p>
<pre><code>lms import --symbolic-link --user-repo Qwen/Qwen2.5-0.5B-Instruct-GGUF /path/to/qwen2.5-0.5b-instruct-q4_k_m.gguf
lms ls
lms load qwen2.5-0.5b-instruct --context-length 4096 --gpu max --parallel 1 --identifier ipunk-small
lms server start --bind 127.0.0.1 --port 1235</code></pre>
<p>Use the key returned by <code>lms ls</code>. Our first attempt to load a filename-derived key returned <strong>Model not found</strong>; loading the listed key worked. The assigned API identifier was <code>ipunk-small</code>. Ollama listed <code>ipunk-small:latest</code> and also accepted <code>ipunk-small</code> in our requests.</p>
<p>For our isolated Ollama test we used port 11435; the usual local examples use 11434. Confirm your actual port. A symbolic link depends on the source file staying available: moving or deleting the source can break a later load. An API model name by itself does not prove equivalent weights; keep the file digest separately.</p>'''),
('check','Check your own local API','''
<p>Download the Python script, run it on your computer, then open the resulting report here. It sends only the synthetic LOCAL_OK request to the loopback address you choose. It does not load a new model or expose a server to the network. Python 3 is required; there are no third-party Python packages to install.</p>
<p><a href="/evidence/local-runner/probe-local-api.py" download>Download probe-local-api.py</a></p>
<div class="task-panel" data-local-runner-app hidden><form data-probe-command><label for="probe-runtime">Runtime label</label><select id="probe-runtime" name="runtime"><option value="ollama">Ollama</option><option value="lmstudio">LM Studio</option></select><label for="probe-base">Local API URL</label><input id="probe-base" name="base" value="http://127.0.0.1:11434/v1" required><label for="probe-model">Model ID from your local list</label><input id="probe-model" name="model" value="ipunk-small" maxlength="200" required><button type="submit">Build probe command</button></form><label for="probe-command">Run on your computer</label><textarea id="probe-command" data-probe-command-output readonly></textarea><p role="status" data-probe-command-status></p>
<label for="probe-reports">Open one or two generated JSON reports</label><input id="probe-reports" data-probe-reports type="file" accept="application/json,.json" multiple><div data-probe-summary aria-live="polite"></div><button type="button" data-probe-download disabled>Download comparison record</button><p role="status" data-probe-import-status></p></div>
<noscript><p>The command builder and local report reader need JavaScript. Download the script and use the command below instead.</p></noscript>
<pre><code>python3 probe-local-api.py --base-url http://127.0.0.1:1235/v1 --model ipunk-small --label lmstudio --output lmstudio-report.json</code></pre>
<p>If your server requires authentication, set <code>LOCAL_LLM_API_KEY</code> in your local environment. The script does not put the key in its JSON report, follows no redirects and ignores proxy settings for these local requests. You do not need to enable broad browser CORS access. Imported reports stay in this tab; a downloaded record remains on your device.</p>
<p>A completed report means the client received a model list, a normal response and a finished stream. Exact text matching is a separate field. The worksheet cannot verify model-file hashes, who actually ran the server, or whether external networking was blocked.</p>'''),
('restart','What our restricted restart proves','''
<p>After an ordinary successful run, we stopped each test service and launched its process through a macOS sandbox policy that denies outbound networking except loopback. The model and inference runtime were already cached. Both returned LOCAL_OK through the same ordinary and streaming requests after restart.</p>
<p>A control HTTP server on loopback remained reachable; an explicit external-IP connection in a process using the same policy failed with <code>PermissionError</code>, errno 1. The computer itself stayed online. This is a process-level restart check with a warm filesystem cache, not a machine reboot, an empty-cache installation, a packet audit or a general privacy guarantee.</p>
<p><a href="/evidence/local-runner/ollama-restricted-report.json" download>Ollama restricted-run report</a> · <a href="/evidence/local-runner/lmstudio-restricted-report.json" download>LM Studio restricted-run report</a> · <a href="/evidence/local-runner/restricted-restart-method.json" download>Control checks and method</a> · <a href="/evidence/local-runner/loopback-only.sb" download>Process policy</a></p>
<p>If a restart fails, distinguish a missing model or runtime download from an incorrect model ID, blocked authentication or a failed inference request. A working local service with cached files does not establish every feature’s behavior without internet access.</p>'''),
('sources','Sources, settings and next checks','''
<p>Official sources checked November 27, 2026: <a href="https://docs.ollama.com/import">Ollama model import</a>, <a href="https://docs.ollama.com/faq">Ollama local configuration</a>, <a href="https://lmstudio.ai/docs/developer/core/headless">LM Studio headless service</a>, <a href="https://lmstudio.ai/docs/cli/local-models/load">lms load</a> and <a href="https://lmstudio.ai/docs/cli/serve/server-start">local server configuration</a>. The model is from <a href="https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/blob/main/qwen2.5-0.5b-instruct-q4_k_m.gguf">Qwen’s published GGUF file</a>; its listed SHA-256 matches our retained source file.</p>
<p><a href="/evidence/local-runner/ollama-loaded-settings.json" download>Observed Ollama loaded settings</a> · <a href="/evidence/local-runner/lmstudio-loaded-settings.json" download>Observed LM Studio loaded settings</a>. Ollama used a temporary Homebrew-bottle extraction; LM Studio used the official headless installer. We did not test both desktop apps or isolate compiler and engine differences.</p>
<p>Starting without a downloaded model? <a href="/en/guides/run-llm-locally/">Run your first local LLM on Mac</a> and check that the server loaded it.</p>
<p>For a setting-specific task, <a href="/en/guides/ollama-context-length/">set and verify Ollama context length</a>. For larger-model observations on a different machine, see the <a href="/guides/mac-mini-m4-qwen-local-benchmark/">Mac mini M4 32GB Qwen field report (Chinese)</a>. That machine’s speed and memory observations should not be substituted for this M3 Pro run.</p>''')]

context=[
('set','Set context at the scope you intend','''
<p>For a controlled request, set <code>options.num_ctx</code> on Ollama’s native chat or generate endpoint. A Modelfile can save a model-specific default with <code>PARAMETER num_ctx</code>; <code>OLLAMA_CONTEXT_LENGTH</code> configures the server process’s default. Check the current version and actual loaded model rather than assuming every installation has the same default.</p>
<div class="video-table"><table><caption>Configuration and observation are different steps</caption><thead><tr><th>Scope</th><th>Example</th><th>How to verify</th></tr></thead><tbody>
<tr><td>One native API request</td><td><code>options.num_ctx: 8192</code></td><td>Inspect <code>/api/ps</code> immediately after that request.</td></tr>
<tr><td>A model default</td><td><code>PARAMETER num_ctx 4096</code> in its Modelfile</td><td>Create the intended alias and load that exact model.</td></tr>
<tr><td>A server default</td><td><code>OLLAMA_CONTEXT_LENGTH=4096 ollama serve</code></td><td>Confirm which server process and port your client reaches.</td></tr>
</tbody></table></div>
<p>In our fixture, the saved model and server default were 4,096. Native requests asking for 2,048 and 8,192 both changed the running value reported by <code>/api/ps</code>. This verifies the observed request override for that model and version; it does not establish every configuration precedence rule.</p>'''),
('measured','Two values verified on the running model','''
<p>We used Ollama 0.40.18 with Qwen2.5-0.5B-Instruct Q4_K_M on an M3 Pro with 18 GiB physical memory. Before each request we unloaded this test model, then sent a short synthetic prompt with temperature 0 and at most 16 generated tokens.</p>
<div class="video-table"><table><caption>November 27, 2026 · native chat followed by /api/ps</caption><thead><tr><th>Requested num_ctx</th><th>Reported running context_length</th><th>Reply</th></tr></thead><tbody><tr><td>2,048</td><td>2,048</td><td>LOCAL_OK</td></tr><tr><td>8,192</td><td>8,192</td><td>LOCAL_OK</td></tr></tbody></table></div>
<p><a href="/evidence/local-runner/ollama-context-checks.json" download>Download exact requests, responses and running-model snapshots</a>. The two calls verify an effective setting reported by the runtime. A short prompt does not test recall across 8,192 tokens, answer quality or the model’s full advertised window.</p>'''),
('check','Build a request and read your snapshot','''
<p>Use the native server URL, such as <code>http://127.0.0.1:11434</code>, without <code>/v1</code>. The controls below build commands only; they do not contact your local server from this website.</p>
<div class="task-panel" data-context-app hidden><form data-context-command><label for="ctx-base">Local Ollama server URL</label><input id="ctx-base" name="base" value="http://127.0.0.1:11434" required><label for="ctx-model">Model name</label><input id="ctx-model" name="model" value="ipunk-small" maxlength="200" required><label for="ctx-tokens">Requested context tokens</label><select id="ctx-tokens" name="tokens"><option value="2048">2,048</option><option value="4096">4,096</option><option value="8192" selected>8,192</option></select><label for="ctx-snapshot">Paste /api/ps JSON (optional)</label><textarea id="ctx-snapshot" name="snapshot" maxlength="100000" spellcheck="false" placeholder='{"models":[...]}'></textarea><button type="submit">Build commands and read snapshot</button></form><label for="ctx-output">Run on your computer</label><textarea id="ctx-output" data-context-output readonly></textarea><div data-context-rows aria-live="polite"></div><p role="status" data-context-status></p></div>
<noscript><p>The builder needs JavaScript; the complete request below remains available.</p></noscript>
<pre><code>curl --noproxy '*' http://127.0.0.1:11434/api/chat \\
  -H 'Content-Type: application/json' \\
  --data-binary '{"model":"ipunk-small","messages":[{"role":"user","content":"Reply with exactly LOCAL_OK and nothing else."}],"options":{"num_ctx":8192,"temperature":0,"num_predict":16},"stream":false,"keep_alive":"60s"}'

curl --noproxy '*' http://127.0.0.1:11434/api/ps</code></pre>
<p>Read the row for the exact model you requested. Our API listed <code>ipunk-small:latest</code> while accepting <code>ipunk-small</code> as the request alias. Missing or unsupported context fields remain unknown in this reader. Inputs stay in the current tab; model names and snapshots are not uploaded.</p>'''),
('trouble','If the value is missing or different','''
<ol><li>Check the server port and model tag. A request sent to another daemon can have different defaults.</li><li>Inspect immediately after a completed request. An unloaded or expired model can leave the <code>models</code> array empty.</li><li>Make sure you used the native API’s <code>options.num_ctx</code>. An OpenAI-compatible <code>max_tokens</code> field limits output and does not by itself establish Ollama’s loaded context.</li><li>Check the installed Ollama version, selected model and any client-specific overrides. If a snapshot has no context field, do not substitute the request value as if it were observed.</li><li>For a clean comparison, unload only your test model when no other work depends on it, then make another bounded request and inspect again.</li></ol>
<p>A larger configured context can require more cache memory. It does not make a small model more accurate or override its architecture limits. This guide did not benchmark long-context retrieval, speed or a maximum safe setting for your hardware. <a href="/en/guides/ollama-gpu/">Verify GPU placement after changing context</a>.</p>'''),
('sources','Sources and complete evidence','''
<p>Checked November 27, 2026: <a href="https://docs.ollama.com/faq">Ollama local FAQ and context configuration</a>, <a href="https://docs.ollama.com/api/openai-compatibility">OpenAI-compatible context settings</a> and <a href="https://docs.ollama.com/import">local model import</a>. Exact request bodies and native running-model responses are in the <a href="/evidence/local-runner/ollama-context-checks.json">two-setting observation file</a>; <a href="/evidence/local-runner/model-and-machine.json">source hash and machine details</a> are separate.</p>
<p>For moving a client between local services, use the <a href="/en/guides/ollama-vs-lm-studio/">Ollama and LM Studio same-file API exercise</a>. For a different machine and larger models, read the <a href="/guides/mac-mini-m4-qwen-local-benchmark/">Mac mini M4 Qwen field report (Chinese)</a>. These observations should not be combined into one performance score.</p>''')]

urls=[page('ollama-vs-lm-studio','Ollama vs LM Studio: Same GGUF and Local API Checks',
 'See one Qwen GGUF run through Ollama and LM Studio headless. Check model IDs, ordinary and streaming APIs, and cached restarts with a downloadable local probe.',
 'Both served the same local Qwen GGUF in our M3 Pro exercise, including ordinary and streaming requests after a network-restricted process restart. Keep the workflow you can manage, then verify model IDs and API behavior before migrating. The check below reuses one small Python client; it does not rank generation quality or speed.',comparison),
 page('ollama-context-length','Ollama Context Length: Set It and Verify the Running Model',
 'Set Ollama num_ctx, then check context_length in /api/ps. See verified 2048 and 8192 settings, build a local request and read your own running-model snapshot.',
 'Set options.num_ctx on a native Ollama request, then inspect /api/ps for the exact running model. In our Ollama 0.40.18 checks, requests for 2,048 and 8,192 tokens produced matching reported context values. A request setting alone does not prove long-context recall or available memory.',context)]

block='<section class="section" data-local-model-entry><div class="wrap"><h2><span class="zh-only">本地模型接入与配置核验</span><span class="en-only">Verify local model APIs and context</span></h2><p><a href="/en/guides/run-llm-locally/"><span class="zh-only">在 Mac 运行第一个本地大模型（英文）</span><span class="en-only">Run your first local LLM on Mac</span></a></p><p><a href="/en/guides/opencode-ollama/"><span class="zh-only">让 OpenCode 发现并调用 Ollama 本地模型（英文）</span><span class="en-only">Connect OpenCode to an Ollama model</span></a></p><p><a href="/en/guides/ollama-vs-lm-studio/"><span class="zh-only">Ollama 与 LM Studio：同一 GGUF 的 API 与重启检查（英文）</span><span class="en-only">Ollama vs LM Studio: same-file API and restart checks</span></a></p><p><a href="/en/guides/ollama-context-length/"><span class="zh-only">设置 Ollama 上下文并核对运行值（英文）</span><span class="en-only">Set and verify Ollama context length</span></a></p></div></section>'
p=DIST/'index.html';s=p.read_text()
if 'data-local-model-entry' not in s:p.write_text(s.replace('</main>',block+'\n</main>'))

old='<a href="/guides/mac-mini-m4-qwen-local-benchmark/">Read one Mac mini Qwen field report (Chinese)</a>.'
new='<a href="/en/guides/ollama-vs-lm-studio/">Check Ollama and LM Studio with the same local API request</a>, then review hardware-specific measurements.'
for rel in ['dist/en/guides/chatgpt-alternatives/index.html','scripts/build-task-entry-pages.py']:
 p=ROOT/rel;s=p.read_text()
 if old in s:p.write_text(s.replace(old,new))

p=DIST/'task-choice-core.mjs';s=p.read_text();old="local: {name:'A local-model feasibility check', path:'/guides/mac-mini-m4-qwen-local-benchmark/', reason:'Check hardware memory and a dated machine-specific run before downloading a large model. Our Qwen field report is in Chinese and covers one Mac mini M4 with 32 GB; it does not guarantee your speed or complete offline isolation.', evidence:'One-machine Qwen field report (Chinese)', prompt:null}"
new="local: {name:'A local API and restart check', path:'/en/guides/ollama-vs-lm-studio/', reason:'Verify the actual model identifier, ordinary response and finished stream before moving a client between local runtimes. The retained same-GGUF exercise covers one M3 Pro and a small model, not a general speed or privacy guarantee.', evidence:'Same-GGUF Ollama and LM Studio API checks', prompt:null}"
if old in s:p.write_text(s.replace(old,new))
else:assert new in s,'Local-model selector source differs from both known versions.'

p=DIST/'sitemap.xml';s=p.read_text()
for url in urls:
 if url not in s:s=s.replace('</urlset>',f'<url><loc>{url}</loc><lastmod>{DATE}</lastmod></url>\n</urlset>')
p.write_text(s)
subprocess.run(['node','scripts/render-snapshot.mjs'],cwd=ROOT,check=True)
print('Built '+', '.join(urls))
