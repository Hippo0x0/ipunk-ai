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
if (htmlFiles.length < 20) throw new Error(`Expected at least 20 HTML pages, found ${htmlFiles.length}`);
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
if (data.projects.length !== 12) throw new Error("Expected exactly twelve tracked projects");
for (const project of data.projects) {
  const page = join(root, "projects", project.slug, "index.html");
  try { await stat(page); } catch { throw new Error(`Missing project page for ${project.slug}`); }
}
const timeline = JSON.parse(await readFile(join(root, "data/timeline.json"), "utf8"));
if (!Array.isArray(timeline.snapshots) || timeline.snapshots.length < 2) throw new Error("Expected at least two timeline snapshots");
const timelineDates = timeline.snapshots.map((snapshot) => snapshot.date);
if (timelineDates.some((date, index) => index > 0 && date <= timelineDates[index - 1])) throw new Error("Timeline snapshots must be in ascending date order");
for (const snapshot of timeline.snapshots) {
  if (!snapshot.projects.length) throw new Error(`${snapshot.date}: empty timeline snapshot`);
  const slugs = snapshot.projects.map((project) => project.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error(`${snapshot.date}: duplicate timeline project`);
  if (slugs.some((slug) => !data.projects.some((project) => project.slug === slug))) throw new Error(`${snapshot.date}: unknown timeline project`);
}
const app = await readFile(join(root, "app.js"), "utf8");
for (const hook of ["data-search", "data-filter", "data-sort", "dataset.project"]) {
  if (!app.includes(hook)) throw new Error(`Missing interactive radar hook: ${hook}`);
}
await stat(join(root, "radar.css"));
for (const file of ["compare/index.html", "compare.js", "compare.css", "choose/index.html", "choose.js", "choose.css", "data/timeline.json"]) await stat(join(root, file));
const chooser = await readFile(join(root, "choose.js"), "utf8");
for (const hook of ["workflow", "license", "priority", "data-compare-choice"]) {
  if (!chooser.includes(hook)) throw new Error(`Missing chooser hook: ${hook}`);
}
console.log(`Site check passed: ${htmlFiles.length} HTML pages, ${data.projects.length} project snapshots`);
