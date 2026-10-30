import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkIndexableHtml } from "../scripts/seo-guard.mjs";

const base = "https://ai.ipunk.cn";
const zh = "/projects/rea/";
const en = "/en/projects/rea/";
const read = (route) => readFile(new URL(`../dist${route}index.html`, import.meta.url), "utf8");

test("REA editions have reciprocal HTML links, canonical URLs, and matching sitemap dates", async () => {
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  for (const route of [zh, en]) {
    const html = await read(route);
    checkIndexableHtml(html, base + route);
    for (const [language, target] of [["zh-CN", zh], ["en", en], ["x-default", zh]]) {
      assert.ok(html.includes(`<link rel="alternate" hreflang="${language}" href="${base}${target}">`));
    }
    assert.ok(html.includes(`href="${route === zh ? en : zh}"`));
    assert.ok(sitemap.includes(`<loc>${base}${route}</loc><lastmod>2026-10-30</lastmod>`));
  }
});

test("English REA edition is complete static English and Chinese URL resists saved preference", async () => {
  const english = await read(en);
  const chinese = await read(zh);
  assert.match(english, /<html lang="en">/);
  assert.match(english, /documentation-based guide/);
  assert.match(english, /analyze-javascript-application/);
  assert.doesNotMatch(english, /class="(?:zh-only|en-only)"|src="\/app.js"/);
  for (const [, id] of english.matchAll(/href="#([^"]+)"/g)) assert.ok(english.includes(`id="${id}"`));
  assert.match(chinese, /data-page-language="zh"/);
  assert.doesNotMatch(chinese, /data-language type="button"/);
});

test("the homepage has an ordinary HTML path to the English REA guide", async () => {
  const home = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(home, /<a href="\/en\/projects\/rea\/">REA<\/a>/);
});
