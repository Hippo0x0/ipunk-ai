# iPunk AI Radar

Static AI project radar for `ai.ipunk.cn`. It separates observed GitHub metrics from editorial scores and keeps dated snapshots for 1-day, 7-day, and 30-day comparisons. The current watchlist contains twelve projects across agent tooling, personal assistants, decision models, coding agents, browser agents, and document processing.

The home page supports search, category filtering and evidence-aware sorting. `/compare/` lets readers compare two or three projects side by side and creates a shareable query-string selection; `/choose/` builds an explainable shortlist from workflow, license and evidence preferences; `/trends/` separates the latest snapshot delta from an available-history timeline generated from up to 30 daily captures.

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
