import assert from 'node:assert/strict';
import test from 'node:test';
import {AudioSample} from '../dist/vendor/mediabunny/mediabunny-1.66.4.min.mjs';
import {measureSamples} from '../dist/video-audio-signal.mjs';

function audio(left, right) {
  return new AudioSample({
    data: Float32Array.from([...left, ...right]),
    format: 'f32-planar',
    numberOfChannels: 2,
    sampleRate: 4,
    timestamp: 0,
  });
}

test('the analysis excludes loud samples outside the requested time window', async () => {
  const sample = audio([1, 0, 0, 0], [0, 0, 0, -1]);
  const result = await measureSamples([sample], 0.25, 0.75);
  assert.deepEqual(result, {peak: 0, count: 4});
});

test('a signal in just one channel is counted and inter-channel cancellation is avoided', async () => {
  const sample = audio([0, 0.5, 0, 0], [0, -0.5, -0.75, 0]);
  const result = await measureSamples([sample], 0.25, 0.75);
  assert.deepEqual(result, {peak: 0.75, count: 4});
});

test('a time range without samples stays distinguishable from decoded silence', async () => {
  const result = await measureSamples([audio([0, 0], [0, 0])], 1, 2);
  assert.deepEqual(result, {peak: 0, count: 0});
});
