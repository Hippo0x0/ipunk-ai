import test from "node:test";
import assert from "node:assert/strict";
import { checkIndexableHtml } from "../scripts/seo-guard.mjs";
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
