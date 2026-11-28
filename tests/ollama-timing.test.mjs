import assert from 'node:assert/strict';
import test from 'node:test';
import {readOllamaTiming} from '../dist/ollama-timing.mjs';

const record = {
  done: true, eval_count: 64, eval_duration: 1_600_000_000,
  prompt_eval_count: 200, prompt_eval_duration: 250_000_000,
  load_duration: 900_000_000, total_duration: 2_800_000_000,
};

test('native nanosecond metrics give separate prompt and generation rates', () => {
  const result = readOllamaTiming(JSON.stringify(record));
  assert.deepEqual(result, {
    prompt: {count: 200, seconds: 0.25, tokensPerSecond: 800, cachedCount: null},
    generation: {count: 64, seconds: 1.6, tokensPerSecond: 40},
    loadSeconds: 0.9,
    totalSeconds: 2.8,
  });
});

test('uses only the final NDJSON record and rejects mixed and cut-off streams', () => {
  const first = '{"done":false,"response":"Hi","eval_count":999}';
  const final = JSON.stringify(record);
  assert.equal(readOllamaTiming(`${first}\r\n\r\n${final}\n`).generation.count, 64);
  assert.throws(() => readOllamaTiming(first), /ending in a record/);
  assert.throws(() => readOllamaTiming(`${final}\n${final}`), /ending in a record/);
});

test('missing and zero measurements stay distinguishable', () => {
  const result = readOllamaTiming('{"done":true,"eval_count":0,"eval_duration":0,"load_duration":0}');
  assert.deepEqual(result.generation, {count: 0, seconds: 0, tokensPerSecond: null});
  assert.equal(result.prompt.count, null);
  assert.equal(result.loadSeconds, 0);
  assert.equal(result.totalSeconds, null);
});

test('rejects compatible SSE, non-native usage, input errors and unsafe counters', () => {
  assert.throws(() => readOllamaTiming('data: {"choices":[]}\n\ndata: [DONE]'), /native Ollama JSON/);
  assert.throws(() => readOllamaTiming('{"done":true,"usage":{"completion_tokens":12}}'), /no native timing counters/);
  assert.throws(() => readOllamaTiming('{"error":"model not found"}'), /returned an Ollama error/);
  assert.throws(() => readOllamaTiming(JSON.stringify({...record,eval_count:'64'})), /non-negative integers/);
  assert.throws(() => readOllamaTiming(JSON.stringify({...record,eval_duration:-1})), /non-negative integers/);
  assert.throws(() => readOllamaTiming(JSON.stringify({...record,eval_count:9e16})), /non-negative integers/);
  assert.throws(() => readOllamaTiming(' '.repeat(1_000_001)), /one million characters/);
});

test('deducts known cached tokens using the native CLI calculation', () => {
  const {prompt} = readOllamaTiming(JSON.stringify({...record, prompt_eval_cached_count: 199}));
  assert.deepEqual(prompt, {count: 200, cachedCount: 199, seconds: 0.25, tokensPerSecond: 4});
  assert.equal(readOllamaTiming(JSON.stringify({...record, prompt_eval_cached_count: 201})).prompt.tokensPerSecond, 0);
});
