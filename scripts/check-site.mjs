import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve("dist");
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) await walk(path); else files.push(path);
  }
}
await walk(root);
const htmlFiles = files.filter((path) => path.endsWith(".html"));
if (htmlFiles.length < 6) throw new Error(`Expected at least 6 HTML pages, found ${htmlFiles.length}`);
for (const path of htmlFiles) {
  const html = await readFile(path, "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) throw new Error(`${path}: missing title`);
  if (!path.endsWith("404.html") && !/rel="canonical"/.test(html)) throw new Error(`${path}: missing canonical`);
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const target = href.endsWith("/") ? join(root, href, "index.html") : join(root, href);
    try { await stat(target); } catch { throw new Error(`${path}: broken internal link ${href}`); }
  }
}
const data = JSON.parse(await readFile(join(root, "data/projects.json"), "utf8"));
if (data.projects.length < 3) throw new Error("Expected at least three watchlist projects");
if (!data.captured_at || Number.isNaN(Date.parse(data.captured_at))) throw new Error("Project data needs a valid captured_at timestamp");
for (const project of data.projects) {
  if (!project.slug || !project.repo) throw new Error("Each project needs a slug and repository");
  if (!Number.isFinite(project.stars) || !Number.isFinite(project.forks)) throw new Error(`${project.repo}: invalid metrics`);
}
const index = await readFile(join(root, "index.html"), "utf8");
const app = await readFile(join(root, "app.js"), "utf8");
for (const hook of ["data-search", "data-filter", "data-sort", "data-project"]) {
  if (!app.includes(hook) && !index.includes(hook)) throw new Error(`Missing radar hook: ${hook}`);
}
console.log(`Site check passed: ${htmlFiles.length} HTML pages, ${data.projects.length} project snapshots`);
