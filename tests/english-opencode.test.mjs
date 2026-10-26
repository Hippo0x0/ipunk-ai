import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkIndexableHtml } from "../scripts/seo-guard.mjs";

const base = "https://ai.ipunk.cn";
const zhPath = "/projects/opencode/";
const enPath = "/en/projects/opencode/";
const read = (path) => readFile(new URL(`../dist${path}index.html`, import.meta.url), "utf8");

test("OpenCode language editions have reciprocal alternates and self canonicals", async () => {
  for (const path of [zhPath, enPath]) {
    const html = await read(path);
    checkIndexableHtml(html, base + path);
    for (const [language, target] of [["zh-CN", zhPath], ["en", enPath], ["x-default", zhPath]]) {
      assert.ok(html.includes(`<link rel="alternate" hreflang="${language}" href="${base}${target}">`));
    }
    const other = path === zhPath ? enPath : zhPath;
    assert.ok(html.includes(`href="${other}"`), "Language switching must be an HTML link");
  }
});

test("English edition contains readable static English and indexed navigation", async () => {
  const html = await read(enPath);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /not a hands-on test/);
  assert.doesNotMatch(html, /class="(?:en-only|zh-only)"|src="\/app.js"/);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`));
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  assert.ok(sitemap.includes(`<loc>${base}${enPath}</loc>`));
});

test("Chinese URL ignores a remembered English preference without changing other pages", async () => {
  const html = await read(zhPath);
  assert.match(html, /data-page-language="zh"/);
  assert.doesNotMatch(html, /data-language type="button"/);
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
  const { runInNewContext } = await import("node:vm");
  const initialLanguage = script.slice(0, script.indexOf("let projectData"));
  for (const fixed of [true, false]) {
    const classes = [];
    runInNewContext(initialLanguage, {
      localStorage: { getItem: () => "en" },
      document: { createElement: () => ({}), head: { append() {} }, querySelector: () => null,
        documentElement: { dataset: fixed ? { pageLanguage: "zh" } : {} }, body: { classList: { add: (value) => classes.push(value) } } },
    });
    assert.deepEqual(classes, fixed ? [] : ["en"]);
  }
});
