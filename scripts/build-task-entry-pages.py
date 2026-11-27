"""Build the two task-selection entry pages; original trial assets stay unchanged."""
from pathlib import Path
import html
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1] / 'dist'
DATE = '2026-11-27'
ORIGIN = 'https://ai.ipunk.cn'

def section(key, title, body):
    return f'<section id="{key}"><h2>{title}</h2>{body}</section>'

def page(slug, title, description, answer, sections):
    route = f'/en/guides/{slug}/'
    toc = ''.join(f'<li><a href="#{key}">{label}</a></li>' for key, label, _ in sections)
    schema = {'@context':'https://schema.org', '@type':'TechArticle', 'headline':title,
              'datePublished':DATE, 'dateModified':DATE, 'inLanguage':'en', 'mainEntityOfPage':ORIGIN+route}
    body = ''.join(section(*s) for s in sections)
    output = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} | iPunk AI Radar</title>
<meta name="description" content="{html.escape(description, quote=True)}">
<link rel="canonical" href="{ORIGIN+route}">
<meta property="og:title" content="{html.escape(title, quote=True)}"><meta property="og:description" content="{html.escape(description, quote=True)}"><meta property="og:url" content="{ORIGIN+route}"><meta property="og:type" content="article">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/guides.css"><link rel="stylesheet" href="/task-choice.css">
<script type="application/ld+json">{json.dumps(schema)}</script>
<script type="module" src="/analytics.mjs"></script></head>
<body class="guide-page"><header class="topbar"><div class="wrap nav"><a class="brand" href="/en/"><span>iP</span>AI Radar</a><nav class="navlinks" aria-label="Main navigation"><a href="#start">Choose by task</a></nav></div></header>
<main class="wrap guide-main"><div class="guide-header"><h1>{html.escape(title)}</h1><p class="guide-answer">{answer}</p><p class="guide-date">Published November 27, 2026 · Original app trials November 25, 2026</p></div>
<article class="article guide-article"><nav class="guide-toc" aria-label="On this page"><ol>{toc}</ol></nav>{body}</article></main>
<footer class="footer"><div class="wrap footer-inner"><a href="/en/">iPunk AI Radar</a><span>Published <time datetime="{DATE}">Nov 27, 2026</time></span></div><p class="wrap" data-analytics-privacy><a href="/en/privacy/">Privacy &amp; analytics</a></p></footer>
<script type="module" src="/task-choice.mjs"></script></body></html>'''
    dest = ROOT / route.lstrip('/') / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(output)
    return route

image_sections = [
('start', 'Which AI image generator should you try first?', '''
<div class="video-table"><table><caption>Start with a task you can check on your own account</caption><thead><tr><th>Your task</th><th>First step</th><th>What to check</th></tr></thead><tbody>
<tr><td>Generate an image without buying another plan</td><td>Try the image feature already available in your ChatGPT or Gemini account.</td><td>Access, quota message and the first saved result.</td></tr>
<tr><td>A poster or exact object count</td><td><a href="#examples">Compare our original samples</a>, then <a href="#brief">build your own brief</a>.</td><td>Every word, number, object and direction.</td></tr>
<tr><td>Edit an existing image</td><td>Use an account with image editing; attach a permitted reference and request one bounded change.</td><td>The requested change and details that should stay unchanged.</td></tr>
<tr><td>Client or production work</td><td>Check the applicable account terms and output requirements before choosing a subscription.</td><td>Rights, required dimensions, revisions and the final downloaded file.</td></tr>
</tbody></table></div>
<p>Our hands-on shortlist here is ChatGPT and Gemini. Both met the visible text and object conditions in the two briefs below. Start with the account you can already use, rather than buying a plan on the strength of these samples. Other products may fit your task; this small trial does not rank the whole market.</p>
<div class="task-actions"><a href="https://chatgpt.com/" target="_blank" rel="noopener">Open ChatGPT</a><a href="https://gemini.google.com/" target="_blank" rel="noopener">Open Gemini</a></div>'''),
('examples', 'Inspect the first outputs before choosing', '''
<p>On November 25, 2026, each app received the same mug brief and the same fictional poster brief once. All four first retained samples showed the requested object count or lettering. Plans, modes and capture sizes were not matched. These are inspectable examples, not reliability or artistic-quality scores.</p>
<div class="trial-gallery">
<figure><a href="/evidence/gemini-chatgpt-images/chatgpt-mugs.png"><img src="/evidence/gemini-chatgpt-images/chatgpt-mugs.png" width="1254" height="1254" loading="lazy" decoding="async" alt="ChatGPT retained first sample of three teal mugs and MUG TEST 2048"></a><figcaption>ChatGPT · three mugs and exact label · <a href="/evidence/gemini-chatgpt-images/chatgpt-mugs.png" download>Download original capture</a></figcaption></figure>
<figure><a href="/evidence/gemini-chatgpt-images/gemini-mugs.webp"><img src="/evidence/gemini-chatgpt-images/gemini-mugs.webp" width="1024" height="1024" loading="lazy" decoding="async" alt="Gemini retained first sample of three teal mugs and MUG TEST 2048"></a><figcaption>Gemini · same mug brief · <a href="/evidence/gemini-chatgpt-images/gemini-mugs.webp" download>Download original capture</a></figcaption></figure>
<figure><a href="/evidence/gemini-chatgpt-images/chatgpt-poster.png"><img src="/evidence/gemini-chatgpt-images/chatgpt-poster.png" width="1254" height="1254" loading="lazy" decoding="async" alt="ChatGPT first fictional Night Sky Club poster with four requested text lines"></a><figcaption>ChatGPT · four-line poster · <a href="/evidence/gemini-chatgpt-images/chatgpt-poster.png" download>Download original capture</a></figcaption></figure>
<figure><a href="/evidence/gemini-chatgpt-images/gemini-poster.webp"><img src="/evidence/gemini-chatgpt-images/gemini-poster.webp" width="1024" height="1024" loading="lazy" decoding="async" alt="Gemini first fictional Night Sky Club poster with four requested text lines"></a><figcaption>Gemini · same poster brief · <a href="/evidence/gemini-chatgpt-images/gemini-poster.webp" download>Download original capture</a></figcaption></figure>
</div><p>For settings, unchanged prompt text, capture limitations and first-output observations, see the <a href="/en/guides/gemini-vs-chatgpt/">Gemini vs ChatGPT image trial</a>. The retained dimensions describe those captures, not either app’s maximum export size.</p>'''),
('brief', 'Build a brief for your own image trial', '''
<p>Write down what must be correct before you generate. This builder assembles your instructions and a manual checklist locally; it does not generate images, upload your description or score an output.</p>
<div class="task-panel" data-brief-app hidden><form data-image-brief>
<label for="brief-kind">Image task</label><select id="brief-kind" name="kind"><option value="objects">Objects and composition</option><option value="poster">Poster and exact text</option><option value="edit">Edit an attached image</option></select>
<label for="brief-subject">Describe the image or requested change</label><textarea id="brief-subject" name="subject" maxlength="500" required>Exactly three teal mugs in one row on a white background. All handles point right. Clean flat illustration.</textarea>
<label for="brief-words">Required text, one line per output line (optional)</label><textarea id="brief-words" name="words" maxlength="300">MUG TEST 2048</textarea>
<div class="task-actions"><button type="submit">Build brief</button><button type="button" data-brief-preset="objects">Use mug example</button><button type="button" data-brief-preset="poster">Use poster example</button></div></form>
<label for="brief-output">Your prompt</label><textarea id="brief-output" data-brief-output readonly></textarea><ul data-brief-checks></ul>
<button type="button" data-brief-download disabled>Download brief and checklist</button><p role="status" data-brief-status></p></div>
<noscript><p>The interactive builder needs JavaScript. The complete original briefs below remain available as text downloads.</p></noscript>
<p><a href="/evidence/gemini-chatgpt-images/mugs-prompt.txt" download>Download the original mug prompt</a> · <a href="/evidence/gemini-chatgpt-images/poster-prompt.txt" download>Download the original poster prompt</a></p>
<ol><li>Submit the same brief in fresh conversations. Record the displayed model or mode and your account plan.</li><li>Save the first result before retries. Read the text at the size you will actually use.</li><li>Record every attempt and correction. For edits, compare both the changed region and the parts meant to stay unchanged.</li><li>Choose the app that meets your actual brief within your acceptable effort and cost. Repeat before making a larger purchase.</li></ol>'''),
('limits', 'Check access, limits and editing before paying', '''
<p>OpenAI’s current instructions describe image creation and editing in ChatGPT, with usage limits depending on the plan and workspace access. Google’s instructions describe image creation, uploaded-reference editing and full-size download in Gemini, subject to account and regional requirements. Check your current app message; two successful samples cannot establish your allowance.</p>
<p>Our November 25 image trial covered creation only. It did not test reference-image editing, photorealism, brand consistency, commercial rights, generation latency or cost per usable output. ChatGPT showed Free; Gemini’s subscription entitlement and both underlying image engines were not established. For exact production lettering, proofread the downloaded image and finish typography separately if needed.</p>
<p>If you need broader assistant features too, use the <a href="/en/guides/chatgpt-alternatives/">ChatGPT alternatives task selector</a>. For turning a still into a clip, see the separately tested <a href="/en/guides/image-to-video-ai-free/">free image-to-video workflow</a>.</p>'''),
('sources', 'Sources and retained evidence', '''
<p>Feature instructions checked November 27, 2026: <a href="https://help.openai.com/en/articles/11084440-images-in-chatgpt">Images in ChatGPT</a> and <a href="https://support.google.com/gemini/answer/14286560?hl=en">Generate and edit images in Gemini</a>. Read the current account instructions when a menu or limit differs.</p>
<p><a href="/evidence/gemini-chatgpt-images/observations.json" download>Download November 25 trial settings, observations and file hashes</a>. The builder and routing were added November 27; the app trials were not rerun for this page. No provider paid for placement.</p>''')]

alternative_sections = [
('start', 'Choose a ChatGPT alternative by the job', '''
<form class="task-panel" data-alternative-form hidden><label for="alternative-task">What do you need to do?</label><select id="alternative-task" name="task"><option value="research">Answer a question with checkable sources</option><option value="writing">Work from a document or small table</option><option value="images">Create an image</option><option value="coding">Work on files in a code repository</option><option value="local">Assess running a model locally</option></select>
<div class="task-result" aria-live="polite"><h3 data-choice-name>Perplexity</h3><p data-choice-reason></p><div class="task-actions"><a data-choice-link href="/en/guides/perplexity-vs-chatgpt/">Read the source checks</a><a data-choice-prompt href="/evidence/research-comparison/prompt.txt" download>Download the shared trial prompt</a></div></div></form>
<p>The shortlist below is organized by task. The selector routes to evidence; it does not calculate a quality score or send your work to an AI service.</p>
<div class="video-table"><table><caption>Alternatives with a specific next step</caption><thead><tr><th>Need</th><th>Try</th><th>Evidence and next action</th></tr></thead><tbody>
<tr><td>Source-based research</td><td>Perplexity</td><td><a href="#research">Check the same facts and their original sources</a>.</td></tr>
<tr><td>Supplied text, tables and a constrained notice</td><td>Claude</td><td><a href="#writing">Inspect the first reply and format correction</a>.</td></tr>
<tr><td>Image creation</td><td>Gemini</td><td><a href="#images">Inspect first-output images, then try your brief</a>.</td></tr>
<tr><td>Repository edits</td><td>A coding-agent workflow</td><td><a href="/en/projects/opencode/">Review OpenCode’s model and permission boundaries</a>.</td></tr>
<tr><td>Local execution</td><td>A hardware-specific feasibility check</td><td><a href="/guides/mac-mini-m4-qwen-local-benchmark/">Read one Mac mini Qwen field report (Chinese)</a>.</td></tr>
</tbody></table></div>'''),
('research', 'Perplexity for a source-checking trial', '''
<p>Start here if you want to inspect a linked source next to an answer. In our November 25 exercise, signed-in Perplexity Search and ChatGPT both answered three questions covering seven required facts with supporting primary links. This small exercise did not separate them on overall accuracy.</p>
<p>The anonymous Perplexity attempt did not return a research answer in that session; the signed-in run did. One extra date qualifier in a ChatGPT answer needed a clearer source or time-zone scope. A source count alone did not prove every claim.</p>
<div class="task-actions"><a href="/en/guides/perplexity-vs-chatgpt/">Open replies and the source-audit worksheet</a><a href="/evidence/research-comparison/prompt.txt" download>Download the shared research prompt</a><a href="https://www.perplexity.ai/" target="_blank" rel="noopener">Open Perplexity</a></div>
<p>Repeat with a low-risk question from your work. Open each linked primary source and record whether it supports the particular claim. Keep unanswered questions and unsupported extras in the comparison.</p>'''),
('writing', 'Claude for a document and table trial', '''
<p>Use a small supplied document rather than judging an assistant by a polished greeting. Our three-part prompt combined paid-order arithmetic, evidence from a fictional policy and a short notice with explicit constraints.</p>
<p>Both first answers identified five paid orders, a net total of 138 USD and order A104 as the highest net order. Claude’s first copied answer included prose around the requested JSON; one explicit correction produced valid JSON. ChatGPT’s retained visible text parsed as JSON. Capture methods differed and the models and plans were not matched, so this is a reproducible task example rather than a product ranking.</p>
<div class="task-actions"><a href="/en/guides/claude-vs-chatgpt/">Inspect original replies and run the checker</a><a href="/evidence/assistant-task/prompt.txt" download>Download the shared document and table task</a><a href="https://claude.ai/" target="_blank" rel="noopener">Open Claude</a></div>
<p>If a workflow needs machine-readable output, test the exact copied response in your parser. Keep the first attempt and count corrections instead of silently cleaning the response.</p>'''),
('images', 'Gemini for an image-creation trial', '''
<p>Gemini is another place to try a visual brief if its image tool is available on your account. In our two November 25 creation briefs, both Gemini and ChatGPT returned the requested three mugs and exact four-line poster wording in the first retained samples. There was no measured overall quality winner.</p>
<p>See the <a href="/en/guides/gemini-vs-chatgpt/">four original images and account observations</a>, or use the <a href="/en/guides/best-ai-image-generator/">AI image generator selector and brief builder</a> to make a trial for your own task. The image tool’s current availability and quotas must be checked on your account.</p>'''),
('switch', 'Try one task before moving your workflow', '''
<ol><li>Write down the reason for switching: unavailable feature, answer quality, source checking, repository access or local execution.</li><li>Choose one task with a result you can independently check. Use a fictional or permitted sample before uploading working material.</li><li>Keep the first output, the corrections and your final result. Check account access and limits before relying on the workflow.</li><li>Compare effort and usable results across several tasks. Choose a plan only after checking its current terms, allowances and the features you actually need.</li></ol>
<p>None of these services is established here as an unlimited free replacement. Our trials do not cover large-file limits, API pricing, confidential-data suitability or all paid tiers. Coding agents and local models need separate setup and permission checks; they do not automatically reproduce ChatGPT’s web tools.</p>
<p>For a single head-to-head question, the linked comparison pages retain the details. This page helps you choose which task trial to run first.</p>'''),
('evidence', 'What was tested and when', '''
<p>The three assistant comparisons were executed November 25, 2026, using English prompts in web apps with Chinese UI controls. Account settings, model access and timing were not controlled uniformly. The source and text exercises are small synthetic tasks; the image exercise has two briefs per app. They establish the stated observations, not a general reliability rate.</p>
<p>Read the <a href="/evidence/assistant-task/expected.json" download>document-task reference</a>, <a href="/evidence/research-comparison/reference.json" download>research reference</a> and <a href="/evidence/gemini-chatgpt-images/observations.json" download>image observations</a>. The full comparison pages link the unchanged first responses and original captures.</p>
<p>Official image instructions checked November 27: <a href="https://support.google.com/gemini/answer/14286560?hl=en">Gemini image creation and editing</a> and <a href="https://help.openai.com/en/articles/11084440-images-in-chatgpt">ChatGPT Images</a>. Access observed on November 25 is a dated session result, not a promise about today’s quota. No provider paid for placement.</p>''')]

routes = [page('best-ai-image-generator', 'Best AI Image Generator for Your Task: Choose and Try a Brief',
 'Compare original ChatGPT and Gemini image samples, build a reusable prompt and checklist, and check your account before choosing an AI image generator.',
 'For a first trial, use the image tool already available in your ChatGPT or Gemini account. Both passed the visible count and text conditions in our two retained briefs. Compare the originals below, then build a brief with the exact details your own image must get right.', image_sections),
 page('chatgpt-alternatives', 'ChatGPT Alternatives: Choose Claude, Perplexity or Gemini by Task',
 'Choose a ChatGPT alternative for research, documents or images using our retained task trials. Open original replies, shared prompts and checks before switching.',
 'Try Perplexity for a source-checking exercise, Claude for a supplied-document task, or Gemini for an image brief. Our small trials show what to check before switching; they do not establish one replacement as best at every job. Choose your task below and inspect the original results.', alternative_sections)]

# Keep discovery links in the existing home pages and comparison cluster.
blocks = {
 'index.html': '<section class="section" data-task-entry><div class="wrap"><h2><span class="zh-only">按任务选择 AI 产品</span><span class="en-only">Choose an AI assistant for your task</span></h2><p><a href="/en/guides/chatgpt-alternatives/"><span class="zh-only">ChatGPT 替代品：按研究、文档和图片任务选型（英文）</span><span class="en-only">ChatGPT alternatives: choose a research, document or image trial</span></a></p><p><a href="/en/guides/best-ai-image-generator/"><span class="zh-only">AI 图片生成器：看原始样图，生成自己的测试 brief（英文）</span><span class="en-only">Find an AI image generator and build your own test brief</span></a></p></div></section>'
}
modified = list(routes)+['/en/']
for rel, block in blocks.items():
    dest = ROOT / rel
    text = dest.read_text()
    if block not in text:
        text = text.replace('</main>', block+'\n</main>')
        dest.write_text(text)
    modified.append('/en/' if rel.startswith('en/') else '/')
for slug in ['claude-vs-chatgpt','perplexity-vs-chatgpt','gemini-vs-chatgpt']:
    route = f'/en/guides/{slug}/'
    dest = ROOT / route.lstrip('/') / 'index.html'
    text = dest.read_text()
    marker = '<section id="choose-another-task">'
    if marker not in text:
        addition = marker+'<h2>Choose a different task</h2><p><a href="/en/guides/chatgpt-alternatives/">Choose a ChatGPT alternative by task</a>. For visual work, <a href="/en/guides/best-ai-image-generator/">compare image examples and build your own brief</a>.</p></section>'
        text = text.replace('</article>', addition+'</article>')
        text = re.sub(r'("dateModified"\s*:\s*")[^"]+', r'\g<1>'+DATE, text)
        dest.write_text(text)
    modified.append(route)

sitemap = (ROOT/'sitemap.xml').read_text()
for route in modified:
    url = ORIGIN+route
    pattern = r'(<url><loc>'+re.escape(url)+r'</loc><lastmod>)[^<]+'
    if url in sitemap:
        sitemap = re.sub(pattern, r'\g<1>'+DATE, sitemap)
    else:
        sitemap = sitemap.replace('</urlset>', f'<url><loc>{url}</loc><lastmod>{DATE}</lastmod></url>\n</urlset>')
(ROOT/'sitemap.xml').write_text(sitemap)
subprocess.run(['node', 'scripts/render-snapshot.mjs'], cwd=ROOT.parent, check=True)
print('Built '+', '.join(routes))
