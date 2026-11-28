import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSoraMigrationBrief } from '../dist/sora-brief-core.mjs';

const input = { mode: 'image', ratio: '9:16', seconds: 5, scene: ' Blue mug ', motion: 'Slow camera push' };

test('replacement brief carries the same input, target and output checks across tools', () => {
  const brief = buildSoraMigrationBrief(input);
  assert.match(brief, /same starting image and crop/);
  assert.match(brief, /9:16, 5 seconds/);
  assert.match(brief, /Blue mug\n\nMotion to test:\nSlow camera push/);
  assert.match(brief, /actual duration, watermark and audio/);
  assert.match(buildSoraMigrationBrief({ ...input, mode: 'text' }), /same scene and motion brief/);
});

test('unknown input choices, blanks and invalid durations are rejected', () => {
  for (const edits of [{ mode: 'video' }, { ratio: '0:0' }, { seconds: 0 }, { seconds: 3.5 }, { scene: '   ' }, { motion: 'x'.repeat(401) }]) {
    assert.throws(() => buildSoraMigrationBrief({ ...input, ...edits }), RangeError);
  }
});
