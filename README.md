# iPunk AI Radar

Static AI project radar for `ai.ipunk.cn`. It separates observed GitHub metrics from editorial scores and keeps dated snapshots for 1-day, 7-day, and 30-day comparisons. The current watchlist contains eight projects across agent tooling, personal assistants, decision models, terminal agents, browser agents, and document processing.

## Update project data

```bash
node scripts/update-projects.mjs
```

A delta is reported only when a prior capture exists. Editorial scores are updated manually when meaningful evidence changes. Set `GITHUB_TOKEN` to increase the GitHub API rate limit; the scheduled GitHub Action supplies its built-in token automatically.

## Deploy

```bash
wrangler deploy --config wrangler.jsonc
```

The Worker serves `dist/` as static assets and uses automatic trailing-slash HTML routing with `404.html` as the not-found page.
