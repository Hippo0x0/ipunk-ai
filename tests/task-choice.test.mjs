import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseAlternative,buildImageBrief} from '../dist/task-choice-core.mjs';
test('task selection routes to the appropriate retained evidence without a quality score',()=>{
 assert.equal(chooseAlternative('research').path,'/en/guides/perplexity-vs-chatgpt/');
 assert.equal(chooseAlternative('images').prompt,'/evidence/gemini-chatgpt-images/mugs-prompt.txt');
 assert.equal(chooseAlternative('local').prompt,null);
 assert.throws(()=>chooseAlternative('__proto__'));
 assert.throws(()=>chooseAlternative('constructor'));
 const result=chooseAlternative('writing');result.name='changed';assert.equal(chooseAlternative('writing').name,'Claude');
});
test('brief preserves multiline literal lettering and independent checks',()=>{
 const r=buildImageBrief({kind:'poster',subject:'A teal border',words:'HELLO "WORLD"\n19:30 UTC'});
 assert.ok(r.prompt.includes('"HELLO \\"WORLD\\""'));
 assert.equal(r.checks.filter(v=>v.startsWith('Read the exact line:')).length,2);
 assert.equal(JSON.parse(JSON.stringify(r)).prompt,r.prompt);
 assert.match(r.scope,/no image is generated/);
});
test('editing preserves reference requirement and rejects invalid or oversized fields',()=>{
 assert.match(buildImageBrief({kind:'edit',subject:'Make the border blue',words:''}).prompt,/attached image/);
 for(const data of [{kind:'unknown',subject:'x'},{kind:'objects',subject:' '},{kind:'poster',subject:'x'.repeat(501)},{kind:'poster',subject:'x',words:'y'.repeat(301)}])assert.throws(()=>buildImageBrief(data));
});
