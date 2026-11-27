import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
test('local API probe validates actual loopback HTTP, streaming, truncation and redirect boundaries',()=>{
 const result=spawnSync('python3',['tests/local-api-probe-test.py'],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:15000});
 assert.equal(result.status,0,result.stdout+result.stderr);
});
