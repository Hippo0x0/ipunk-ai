import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkStaticResources } from "../scripts/static-resources.mjs";

test("resolves resource paths like a page URL and ignores external previews and comments", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "ipunk-resources-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "guides"));
  await writeFile(join(root, "tool.mjs"), "");
  await writeFile(join(root, "guides", "sample.png"), "fixture");
  await writeFile(join(root, "style.css"), "");
  const html = `<script src='../../tool.mjs?v=2#run'></script>
    <img src='../sample.png'><link href="https://ai.ipunk.cn/style.css?v=1&amp;x=2" rel="stylesheet">
    <script src="https://cdn.example/missing.js"></script><img src="data:image/png;base64,AA==">
    <video src="blob:https://ai.ipunk.cn/local-preview"></video>
    <!-- <script src="/deleted-draft.mjs"></script> -->`;
  assert.equal(await checkStaticResources(html, "https://ai.ipunk.cn/guides/task/", root), 3);
  await rm(join(root, "tool.mjs"));
  await assert.rejects(checkStaticResources(html, "https://ai.ipunk.cn/guides/task/", root), /missing static resource.*tool\.mjs/);
});

test("rejects missing image, poster and script resources even when href links are valid", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "ipunk-resources-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const html of ['<img src="/missing.png">', '<video poster="/missing.webp"></video>', '<script src="/missing.js"></script>']) {
    await assert.rejects(checkStaticResources(html, "https://ai.ipunk.cn/", root), /missing static resource/);
  }
});
