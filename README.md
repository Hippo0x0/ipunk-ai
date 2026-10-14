# iPunk AI Radar

Static MVP for `ai.ipunk.cn`. It separates observed GitHub metrics from editorial scores and keeps dated snapshots for later 1-day, 7-day, and 30-day comparisons.

## Update project data

```bash
node scripts/update-projects.mjs
```

The first snapshot is a baseline. A delta is reported only when a prior capture exists. Editorial scores are updated manually when meaningful evidence changes.
