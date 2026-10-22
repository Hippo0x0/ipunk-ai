import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const number = new Intl.NumberFormat("en-US");

export function snapshotFields(project) {
  for (const field of ["stars", "forks", "open_issues"]) {
    if (!Number.isSafeInteger(project[field]) || project[field] < 0) throw new Error(`Invalid ${field}: ${project.slug}`);
  }
  if (!project.pushed_at || !Number.isFinite(Date.parse(project.pushed_at))) throw new Error(`Invalid push date: ${project.slug}`);
  return {
    Stars: number.format(project.stars),
    Forks: number.format(project.forks),
    "Open issues": number.format(project.open_issues),
    License: project.license && project.license !== "NOASSERTION" ? project.license : "Not declared",
    Language: project.language || "Not specified",
    "Last push": new Date(project.pushed_at).toISOString().slice(0, 10),
  };
}

export function renderProjectSnapshot(html, project, capturedAt) {
  if (!Number.isFinite(Date.parse(capturedAt))) throw new Error("Invalid capture date");
  let blocks = 0;
  const output = html.replace(/(<div class="snapshot"><div class="eyebrow">(?:GITHUB SNAPSHOT|PUBLIC REPO)<\/div>)([\s\S]*?)(<\/dl>)/g, (_, start, content, end) => {
    blocks++;
    for (const [label, value] of Object.entries(snapshotFields(project))) {
      const pattern = new RegExp(`(<dt>${label}</dt>\\s*<dd>)[\\s\\S]*?(</dd>)`, "g");
      if ([...content.matchAll(pattern)].length !== 1) throw new Error(`Expected one ${label}: ${project.slug}`);
      content = content.replace(pattern, (_, open, close) => `${open}${escape(value)}${close}`);
    }
    content = content.replace(/<p data-snapshot-label>[\s\S]*?<\/p>/g, "");
    const capture = new Date(capturedAt).toISOString();
    return `${start}<p data-snapshot-label><span class="zh-only">快照采集：</span><span class="en-only">Captured: </span><time data-captured datetime="${capture}">${capture}</time></p>${content}${end}`;
  });
  if (blocks !== 1) throw new Error(`Expected one GitHub snapshot: ${project.slug}`);
  return output;
}

export function renderHomeSnapshot(html, snapshot) {
  for (const project of snapshot.projects) {
    snapshotFields(project);
    if (!/^[a-z0-9-]+$/.test(project.slug)) throw new Error("Invalid project slug");
    const pattern = new RegExp(`(<a class="card" href="/projects/${project.slug}/">)([\\s\\S]*?)(</a>)`, "g");
    if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Missing or duplicate card: ${project.slug}`);
    html = html.replace(pattern, (_, open, body, close) => {
      let index = 0;
      const values = [project.stars, project.forks];
      body = body.replace(/(<div class="metric"><strong>)[\s\S]*?(<\/strong>)/g, (_, start, end) => `${start}${number.format(values[index++])}${end}`);
      if (index !== 2) throw new Error(`Expected two card metrics: ${project.slug}`);
      return open + body + close;
    });
  }
  if (!Number.isFinite(Date.parse(snapshot.captured_at))) throw new Error("Invalid capture date");
  return html.replace(/(<span data-captured>)[^<]*(<\/span>)/g, (_, start, end) => `${start}${new Date(snapshot.captured_at).toISOString()}${end}`);
}

export async function renderSnapshotFiles(root) {
  const snapshot = JSON.parse(await readFile(resolve(root, "dist/data/projects.json"), "utf8"));
  const updates = [];
  const home = resolve(root, "dist/index.html");
  updates.push([home, renderHomeSnapshot(await readFile(home, "utf8"), snapshot)]);
  for (const project of snapshot.projects) {
    const path = resolve(root, "dist/projects", project.slug, "index.html");
    updates.push([path, renderProjectSnapshot(await readFile(path, "utf8"), project, snapshot.captured_at)]);
  }
  // Validate every page before writing any generated HTML.
  for (const [path, html] of updates) await writeFile(path, html);
  return updates.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Rendered snapshot into ${await renderSnapshotFiles(resolve(dirname(fileURLToPath(import.meta.url)), ".."))} HTML pages`);
}
