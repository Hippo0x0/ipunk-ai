import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateMemory, GiB, modelPresets } from '../dist/ollama-memory-core.mjs';

const defaults = { model: modelPresets['qwen-7b'], context: 8192, installed: 16, systemReserve: 4, runtimeReserve: 1 };

test('estimates file bytes and one FP16 KV cache before comparing with the budget', () => {
  const actual = estimateMemory(defaults);
  assert.equal(actual.weights, 4683073632 / GiB);
  assert.equal(actual.cache, 0.4375);
  assert.equal(actual.available, 12);
  assert.equal(actual.remaining, 12 - (4683073632 / GiB + 0.4375 + 1));
});

test('raw cache grows by 72 MiB across the two measured Qwen 0.5B contexts', () => {
  const model = modelPresets['qwen-05b'];
  const a = estimateMemory({ ...defaults, model, context: 2048 });
  const b = estimateMemory({ ...defaults, model, context: 8192 });
  assert.equal(a.kvBytes / 2 ** 20, 24);
  assert.equal(b.kvBytes / 2 ** 20, 96);
});

test('reports a shortfall and validates context and available memory', () => {
  assert.ok(estimateMemory({ ...defaults, installed: 8, model: modelPresets['qwen-14b'] }).remaining < 0);
  for (const change of [{ context: 32769 }, { context: 2.5 }, { installed: 4 }, { systemReserve: -1 }]) {
    assert.throws(() => estimateMemory({ ...defaults, ...change }), RangeError);
  }
});
