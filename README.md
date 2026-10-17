# iPunk AI Radar

Static project radar for `ai.ipunk.cn`. It separates observed GitHub metrics from editorial scores, keeps dated snapshots, and offers client-side search, category filters, and evidence-based sorting.

## Update project data

```bash
node scripts/update-projects.mjs
```

The first snapshot is a baseline. A delta is reported only when a prior capture exists, and the UI shows the exact interval between captures. Editorial scores are updated manually when meaningful evidence changes.

## Verify

```bash
node --check dist/app.js
node scripts/check-site.mjs
```
