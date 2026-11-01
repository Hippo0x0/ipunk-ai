import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkIndexableHtml } from "../scripts/seo-guard.mjs";

const route = "/guides/mac-mini-m4-qwen-local-benchmark/";
const html = await readFile(new URL(`../dist${route}index.html`, import.meta.url), "utf8");
const data = JSON.parse(await readFile(new URL("../dist/evidence/mac-mini-m4-qwen-2026-11-01.json", import.meta.url), "utf8"));
const record = (name, sample = "medium") => data.measurements.find(x => x.source_file === name).samples.find(x => x.case === sample);

test("measured Qwen article is indexable, linked, and keeps evidence accessible without JavaScript", async () => {
  checkIndexableHtml(html, "https://ai.ipunk.cn" + route);
  assert.match(html, /<html lang="zh-CN"/);
  assert.match(html, /"@type":"Article"/);
  assert.doesNotMatch(html, /src="\/app.js"|class="(?:zh-only|en-only)"/);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`));
  for (const path of ["dist/index.html", "dist/projects/openclaw/index.html", "dist/sitemap.xml"]) {
    const text = await readFile(new URL("../" + path, import.meta.url), "utf8");
    assert.ok(text.includes(route), `${path} discovers the article`);
  }
  assert.ok(html.includes('/evidence/mac-mini-m4-qwen-2026-11-01.json'));
});

test("article tables round the measured samples rather than inventing averages", () => {
  for (const name of ["benchmark-mlx-mtp-warm.json", "benchmark-qwen35-9b-q8.json", "benchmark-qwen35-9b-q4.json", "benchmark-qwen36-35b-current.json",
    "benchmark-omlx-offload-100-repeat.json", "benchmark-omlx-offload-75-repeat.json", "benchmark-omlx-offload-50-repeat.json"]) {
    const row = record(name);
    assert.ok(html.includes(row.decode_tokens_per_second.toFixed(2) + " token/s"));
    assert.ok(html.includes(row.ttft_seconds.toFixed(2) + " 秒"));
  }
  for (const row of data.omlx_offload) {
    assert.ok(Math.abs(row.loaded_allocation_gib - row.loaded_allocation_bytes / 2 ** 30) < 1e-12);
    assert.ok(html.includes(row.loaded_allocation_gib.toFixed(2) + " GiB"));
  }
});

test("public measurements retain cold and cache-hit slow observations and metric boundaries", () => {
  assert.equal(data.measurements.length, 13);
  assert.ok(record("benchmark-qwen36-35b-current.json", "short").ttft_seconds > 59);
  assert.ok(record("benchmark-omlx-prefix-repeat.json", "short").ttft_seconds > 8);
  assert.match(html, /59\.93 秒/);
  assert.match(html, /8\.944 秒/);
  assert.match(html, /不是.*平均改善/);
  assert.match(html, /GB.*GiB/);
  assert.match(html, /没有测 90%/);
  for (const group of data.measurements) {
    assert.match(group.source_sha256, /^[a-f0-9]{64}$/);
    for (const row of group.samples) {
      if (row.decode_tokens_per_second === null) continue;
      assert.ok(Math.abs(row.decode_tokens_per_second - (row.completion_tokens - 1) / (row.total_seconds - row.ttft_seconds)) < 1e-8);
    }
  }
  assert.doesNotMatch(JSON.stringify(data), /\/Users\/|\/Volumes\/|@gmail\.com|"(?:api_key|secret_key|text|headers)"/);
});

test("reproduction script uses loopback and an environment secret, never real service configuration", async () => {
  const script = await readFile(new URL("../dist/evidence/benchmark-qwen-stream.py", import.meta.url), "utf8");
  assert.match(script, /parsed\.hostname not in/);
  assert.match(script, /os\.environ\['LOCAL_LLM_API_KEY'\]/);
  assert.doesNotMatch(script, /openclaw\.json|launchctl|subprocess|local-only|\/Users\/|\/Volumes\//);
});
