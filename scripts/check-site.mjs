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
if (data.projects.length !== 3) throw new Error("Expected exactly three launch projects");
if (!data.baseline_only) throw new Error("Launch data must remain labeled as baseline");
console.log(`Site check passed: ${htmlFiles.length} HTML pages, ${data.projects.length} project snapshots`);
