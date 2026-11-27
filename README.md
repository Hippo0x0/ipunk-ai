# iPunk AI Radar

Live site: [AI project radar](https://ai.ipunk.cn/) · [English edition](https://ai.ipunk.cn/en/)

This static radar separates observed GitHub metrics from editorial scores and keeps dated snapshots for 1-day, 7-day, and 30-day comparisons. The current watchlist contains twelve projects across agent tooling, personal assistants, decision models, coding agents, browser agents, and document processing.

The home page supports search, category filtering and evidence-aware sorting. `/compare/` lets readers compare two or three projects side by side and creates a shareable query-string selection; `/choose/` builds an explainable shortlist from workflow, license and evidence preferences; `/trends/` separates the latest snapshot delta from an available-history timeline generated from up to 30 daily captures.

## Hardware guides

- [NVIDIA server GPU comparison](https://ai.ipunk.cn/guides/nvidia-server-gpu-comparison/) compares architecture, memory, bandwidth and dated channel price samples, with separate PCIe, SXM and HGX cost scopes.

## Field notes and Mac setup

- [Mac mini M4 32GB running Qwen locally](https://ai.ipunk.cn/guides/mac-mini-m4-qwen-local-benchmark/) records one machine's model, speed and memory observations; it is not a general performance guarantee.
- [Set up headless Mac mini access](https://ipunk.cn/en/article/mac-mini-headless-remote-access/) covers Screen Sharing, SSH and restart checks before leaving a local model host unattended.
- [Set up an external SSD for Mac mini](https://ipunk.cn/en/article/mac-mini-external-ssd/) covers format choices, file moves and connection checks when model files outgrow internal storage.

## AI assistant comparisons

- [Gemini vs ChatGPT image generation](https://ai.ipunk.cn/en/guides/gemini-vs-chatgpt/) keeps four first-output captures and two exact briefs; no overall image-quality winner is inferred.

- [Perplexity vs ChatGPT for research](https://ai.ipunk.cn/en/guides/perplexity-vs-chatgpt/) retains actual source links and human claim checks, plus a local audit worksheet.

- [Claude vs ChatGPT](https://ai.ipunk.cn/en/guides/claude-vs-chatgpt/) includes an identical synthetic task, original outputs and a local response checker; no global model ranking is inferred.

## Local media tools

- [Video cropper](https://ai.ipunk.cn/en/guides/crop-video/) exports a repositioned square, portrait or landscape MP4 locally.

- [Video converter](https://ai.ipunk.cn/en/guides/video-converter/) writes MP4 or WebM and checks track preservation.

- [Video compressor](https://ai.ipunk.cn/en/guides/video-compressor/) re-encodes on the device and compares actual output size.
- [Audio extractor](https://ai.ipunk.cn/en/guides/extract-audio-from-video/) copies AAC to M4A or decodes WAV.
- [Video to GIF](https://ai.ipunk.cn/en/guides/video-to-gif/) samples a short segment with explicit size and frame-rate controls.

Original before/after fixtures and dated validation reports are retained in dist/evidence/ and data/reports/. These tools are not proof of search growth.

## Update project data

```bash
node scripts/update-projects.mjs
```

A delta is reported only when a prior capture exists. Editorial scores are updated manually when meaningful evidence changes. Set `GITHUB_TOKEN` to increase the GitHub API rate limit; the scheduled GitHub Action supplies its built-in token automatically.

To rebuild the public timeline from saved history without calling GitHub:

```bash
node scripts/update-projects.mjs --timeline-only
```

## Deploy

```bash
NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection" wrangler deploy --config wrangler.jsonc
```

The network options avoid OAuth refresh timeouts on dual-stack hosts. The Worker serves `dist/` as static assets and uses automatic trailing-slash HTML routing with `404.html` as the not-found page.

The scheduled snapshot workflow publishes changed public metrics to this existing Worker only when this repository already has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` Actions secrets. If either secret is absent, it keeps the validated Git commit and reports that manual deployment is still needed. It checks `/data/projects.json` on the custom domain after deployment. Captures with only a new timestamp are retained locally without a new commit or deployment.

## Usage analytics

The AI site shares PostHog project 739712 and isolates events with site=ai.ipunk.cn. See [analytics setup, exclusions and deployment](docs/PRODUCT-ANALYTICS.md).

## Codex counter reader

`dist/en/guides/codex-token-usage/` is a browser-local, counter-only JSONL reader source-checked against Codex CLI 0.167.0. It keeps response records and cumulative snapshots separate and does not estimate account limits or bills. Recreate the hand-authored public fixture with `node scripts/generate-codex-token-fixtures.mjs`; no private session files are read. Validation and effect-measurement limits are recorded in `data/reports/2026-11-27-codex-token-reader-review.md`.
