import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = resolve(root, "dist/data/projects.json");
const timelineOnly = process.argv.includes("--timeline-only");
const repositories = [
  ["rea", "morluto/rea"],
  ["openclaw", "openclaw/openclaw"],
  ["jev", "jevmodel/jev-ai"],
  ["gemini-cli", "google-gemini/gemini-cli"],
  ["browser-use", "browser-use/browser-use"],
  ["markitdown", "microsoft/markitdown"],
  ["claude-code", "anthropics/claude-code"],
  ["codex-cli", "openai/codex"],
  ["qwen-code", "QwenLM/qwen-code"],
  ["opencode", "anomalyco/opencode"],
  ["cline", "cline/cline"],
  ["deepseek-harness", "deepseek-ai/deepseek-harness"],
];
const existing = JSON.parse(await readFile(dataPath, "utf8"));
const prior = new Map(existing.projects.map((project) => [project.repo, project]));
const capturedAt = timelineOnly ? existing.captured_at : new Date().toISOString();
const date = capturedAt.slice(0, 10);

const projects = [];
if (!timelineOnly) {
  for (const [slug, repo] of repositories) {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ipunk-ai-radar",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`${repo}: GitHub API returned ${response.status}`);
    const item = await response.json();
    const previous = prior.get(repo);
    projects.push({
      slug, repo,
      stars: item.stargazers_count,
      forks: item.forks_count,
      open_issues: item.open_issues_count,
      language: item.language,
      license: item.license?.spdx_id ?? null,
      pushed_at: item.pushed_at,
      previous_capture_at: existing.captured_at,
      stars_since_previous_capture: previous ? item.stargazers_count - previous.stars : null,
      forks_since_previous_capture: previous ? item.forks_count - previous.forks : null,
    });
  }

  const snapshot = { captured_at: capturedAt, source: "GitHub REST API", baseline_only: false, projects };
  await mkdir(resolve(root, "dist/data/history"), { recursive: true });
  await writeFile(resolve(root, `dist/data/history/${date}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeFile(`${dataPath}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(`${dataPath}.tmp`, dataPath);
}
const historyDirectory = resolve(root, "dist/data/history");
const historyFiles = (await readdir(historyDirectory))
  .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
  .sort()
  .slice(-30);
const timelineSnapshots = await Promise.all(historyFiles.map(async (name) => {
  const item = JSON.parse(await readFile(resolve(historyDirectory, name), "utf8"));
  return {
    date: name.slice(0, 10),
    captured_at: item.captured_at,
    projects: item.projects.map(({ slug, stars, forks }) => ({ slug, stars, forks })),
  };
}));
const timeline = {
  generated_at: capturedAt,
  source: "Daily GitHub REST API snapshots",
  snapshots: timelineSnapshots,
};
const timelinePath = resolve(root, "dist/data/timeline.json");
await writeFile(`${timelinePath}.tmp`, `${JSON.stringify(timeline, null, 2)}\n`);
await rename(`${timelinePath}.tmp`, timelinePath);
console.log(timelineOnly ? `Rebuilt timeline from ${timelineSnapshots.length} snapshots` : `Updated ${projects.length} projects at ${capturedAt}`);
