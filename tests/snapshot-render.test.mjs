import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { renderHomeSnapshot, renderProjectSnapshot, snapshotFields } from "../scripts/render-snapshot.mjs";

const snapshot = JSON.parse(await readFile(new URL("../dist/data/projects.json", import.meta.url), "utf8"));
for (const project of snapshot.projects) {
  test(`${project.slug}: published HTML matches data and repeated rendering is stable`, async () => {
    const html = await readFile(new URL(`../dist/projects/${project.slug}/index.html`, import.meta.url), "utf8");
    const rendered = renderProjectSnapshot(html, project, snapshot.captured_at);
    assert.equal(html, rendered, "Run node scripts/render-snapshot.mjs before publishing");
    assert.equal(renderProjectSnapshot(rendered, project, snapshot.captured_at), rendered);
    assert.match(rendered, /<time data-captured datetime=/);
    assert.equal((rendered.match(/data-snapshot-label/g) || []).length, 1);
    const withoutSnapshot = (value) => value.replace(/<div class="snapshot"><div class="eyebrow">(?:GITHUB SNAPSHOT|PUBLIC REPO)<\/div>[\s\S]*?<\/dl>/g, "SNAPSHOT");
    assert.equal(withoutSnapshot(rendered), withoutSnapshot(html), "Editorial content must be untouched");
  });
}
test("home HTML metrics match the current snapshot without touching scores", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.equal(renderHomeSnapshot(html, snapshot), html);
  const modified = structuredClone(snapshot);
  modified.projects[0].stars += 123;
  const rendered = renderHomeSnapshot(html, modified);
  assert.notEqual(rendered, html);
  assert.deepEqual([...rendered.matchAll(/class="score">([^<]+)/g)].map(m=>m[1]), [...html.matchAll(/class="score">([^<]+)/g)].map(m=>m[1]), "Scores unchanged");
});
test("unknown fields are explicit and unsafe values are escaped", async () => {
  const original = snapshot.projects[0];
  const html = await readFile(new URL(`../dist/projects/${original.slug}/index.html`, import.meta.url), "utf8");
  assert.equal(snapshotFields({...original, license:"NOASSERTION", language:null}).License, "Not declared");
  assert.equal(snapshotFields({...original, language:null}).Language, "Not specified");
  const rendered = renderProjectSnapshot(html, {...original, license:'<script>alert("x")</script>'}, snapshot.captured_at);
  assert.ok(rendered.includes("&lt;script&gt;"));
  assert.ok(!rendered.includes('<script>alert("x")'));
});
test("malformed data or missing markup fails instead of retaining stale values", () => {
  assert.throws(()=>snapshotFields({...snapshot.projects[0], stars:-1}), /Invalid stars/);
  assert.throws(()=>snapshotFields({...snapshot.projects[0], pushed_at:null}), /Invalid push date/);
  assert.throws(()=>renderProjectSnapshot("<html></html>",snapshot.projects[0],snapshot.captured_at), /Expected one GitHub snapshot/);
  assert.throws(()=>renderHomeSnapshot("<html></html>",snapshot), /Missing or duplicate card/);
});
