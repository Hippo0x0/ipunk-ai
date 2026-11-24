import test from 'node:test';
import assert from 'node:assert/strict';
import {videoBudget} from '../dist/video-budget-math.mjs';
test('retries are total attempts and capacity is whole completed clips',()=>{
 assert.deepEqual(videoBudget({credits:625,cost:60,clips:5,attempts:3}),{required:900,shortfall:275,capacity:3,fits:false});
});
test('exact and decimal allowances fit and zero credit permits no clips',()=>{
 assert.equal(videoBudget({credits:900,cost:60,clips:5,attempts:3}).fits,true);
 assert.equal(videoBudget({credits:.3,cost:.1,clips:3,attempts:1}).fits,true);
 assert.equal(videoBudget({credits:0,cost:60,clips:1,attempts:1}).capacity,0);
});
test('invalid and missing inputs cannot produce misleading capacity',()=>{
 for(const values of [{cost:0},{credits:-1},{clips:1.5},{attempts:0},{cost:NaN},{credits:Infinity}])assert.throws(()=>videoBudget({credits:625,cost:60,clips:5,attempts:3,...values}));
});
