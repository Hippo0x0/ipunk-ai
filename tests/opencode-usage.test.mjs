import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {summarizeOpenCodeUsage} from '../dist/opencode-usage-core.mjs';

const sample = readFileSync(new URL('../dist/evidence/opencode-usage/sample.ndjson', import.meta.url), 'utf8');

test('OpenCode step totals match the recorded project report', () => {
  const report = JSON.parse(readFileSync(new URL('../dist/evidence/opencode-usage/observations.json', import.meta.url)));
  const s = summarizeOpenCodeUsage(sample);
  const {tokens, steps, sessions} = report.projectStats;
  assert.equal(s.steps, steps);
  assert.equal(s.sessions, sessions);
  assert.deepEqual(s.totals, {
    input: tokens.input, output: tokens.output, reasoning: tokens.reasoning,
    cacheRead: tokens.cache.read, cacheWrite: tokens.cache.write,
  });
});

test('partial and duplicate steps do not inflate reported token totals', () => {
  const [first] = sample.trim().split('\n');
  const partial = JSON.parse(first);
  delete partial.part.tokens.cache;
  const s = summarizeOpenCodeUsage([first, '{', first, JSON.stringify(partial)].join('\n'));
  assert.equal(s.steps, 1);
  assert.equal(s.sessions, 1);
  assert.equal(s.unrecognized, 1);
  assert.equal(s.incomplete, 1);
  assert.equal(s.duplicates, 1);
  assert.equal(s.totals.input, 724);
});
