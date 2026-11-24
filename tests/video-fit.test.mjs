import assert from 'node:assert/strict';
import test from 'node:test';
import {frameFit} from '../dist/video-fit-math.mjs';
test('landscape to portrait shows the portion retained, not a resize claim',()=>{
 const r=frameFit(1920,1080,9,16);
 assert.equal(r.cropWidth,607.5);
 assert.equal(r.cropHeight,1080);
 assert.equal(r.cropLeft,656.25);
 assert.equal(r.retainedPercent,31.640625);
});
test('same shape and reverse crop have consistent geometry',()=>{
 assert.equal(frameFit(1080,1920,9,16).retainedPercent,100);
 assert.equal(frameFit(1080,1920,9,16).sameRatio,true);
 assert.equal(frameFit(1080,1920,16,9).cropHeight,607.5);
});
test('zero and invalid dimensions cannot produce a misleading frame',()=>{
 for(const x of [0,-1,NaN,Infinity])assert.throws(()=>frameFit(x,1080,9,16));
});
