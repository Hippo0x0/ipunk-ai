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
test("published OpenCode editorial dates agree with their sitemap entries", async () => {
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  for (const path of ["/projects/opencode/", "/en/projects/opencode/"]) {
    const pageUrl = new URL(path, url).href;
    const html = await readFile(new URL(`../dist${path}index.html`, import.meta.url), "utf8");
    const publishedDate = sitemap.split(`<loc>${pageUrl}</loc>`)[1]?.match(/^\s*<lastmod>([^<]+)<\/lastmod>/)?.[1];
    assert.ok(publishedDate, `Missing sitemap date for ${pageUrl}`);
    assert.match(html, /"dateModified"\s*:\s*"\d{4}-\d{2}-\d{2}"/);
    assert.doesNotThrow(() => checkModifiedDate(html, pageUrl, publishedDate));
    assert.throws(() => checkModifiedDate(html, pageUrl, "2026-10-22"), /lastmod differs/);
  }
});
