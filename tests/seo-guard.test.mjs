import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { checkIndexableHtml, checkModifiedDate } from "../scripts/seo-guard.mjs";
const url = "https://ai.ipunk.cn/projects/opencode/";
const canonical = `<link href='${url}' rel='canonical'>`;
const make = (links = canonical, robots = "") => `<html><head><title>Project</title><meta content='Useful guide' name='description'>${links}${robots}</head><body>Guide</body></html>`;
test("accepts a server-rendered self canonical with reordered attributes", () => assert.doesNotThrow(() => checkIndexableHtml(make(), url)));
test("rejects wrong, duplicate and body-only canonicals", () => {
  for (const html of [make(canonical.replace("ai.ipunk.cn", "example.com")), make(canonical + canonical), make("").replace("Guide</body>", `${canonical}</body>`)]) assert.throws(() => checkIndexableHtml(html, url), /canonical/);
});
test("rejects indexing blocks and missing search descriptions", () => {
  for (const name of ["robots", "Googlebot", "bingbot"]) for (const content of ["noindex,follow", "none"]) assert.throws(() => checkIndexableHtml(make(canonical, `<meta name="${name}" content="${content}">`), url), /blocked/);
  assert.throws(() => checkIndexableHtml(make().replace("name='description'", "name='other'"), url), /description/);
});
test("published OpenCode editorial date agrees with its sitemap entry", async () => {
  const html = await readFile(new URL("../dist/projects/opencode/index.html", import.meta.url), "utf8");
  assert.doesNotThrow(() => checkModifiedDate(html, url, "2026-10-29"));
  assert.throws(() => checkModifiedDate(html, url, "2026-10-22"), /lastmod differs/);
});
