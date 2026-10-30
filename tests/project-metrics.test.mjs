import assert from "node:assert/strict";
import test from "node:test";
import { hasPublicMetricChange } from "../scripts/project-metrics.mjs";

const old = [{ slug: "rea", repo: "morluto/rea", stars: 5, forks: 2, open_issues: 1, language: "TypeScript", license: "MIT", pushed_at: "2026-10-29T00:00:00Z" }];

test("capture timestamps and derived deltas alone do not create a new snapshot", () => {
  assert.equal(hasPublicMetricChange(old, [{ ...old[0], previous_capture_at: "later", stars_since_previous_capture: 0 }]), false);
});

test("a changed public metric or watchlist membership creates a snapshot", () => {
  assert.equal(hasPublicMetricChange(old, [{ ...old[0], stars: 6 }]), true);
  assert.equal(hasPublicMetricChange(old, [{ ...old[0], license: null }]), true);
  assert.equal(hasPublicMetricChange(old, []), true);
});
