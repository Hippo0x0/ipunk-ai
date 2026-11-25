import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inspectResponse} from '../dist/assistant-task-check.mjs';
const original=await readFile(new URL('../data/reports/claude-chatgpt-2026-11-25/chatgpt-output.txt',import.meta.url),'utf8');
test('actual captured response passes numeric/quotation checks while flagging calendar review',()=>{
 const r=inspectResponse(original);assert(r.checks.every(x=>x.passed));assert.equal(r.notice_word_count,40);assert.deepEqual(r.named_calendar_days,['Wednesday','Monday']);assert(!('overall_score' in r));
});
test('a correct quotation cannot validate a changed numeric result',()=>{
 const value=JSON.parse(original);value.table.net_revenue_usd=170;
 const r=inspectResponse(JSON.stringify(value));assert.equal(r.checks.find(x=>x.name==='Net revenue is 138 USD').passed,false);
 assert(r.checks.find(x=>x.name==='Cutoff evidence matches the source').passed);
});
test('empty, wrapped and non-object responses cannot be silently repaired',()=>{
 for(const s of ['', 'null','[]','"hello"','```json\n'+original+'\n```'])assert(inspectResponse(s).formatError);
});
test('a named delivery promise fails the missing-information check',()=>{
 const value=JSON.parse(original);value.document.delivery={answer:'two days',evidence:null};
 const r=inspectResponse(JSON.stringify(value));assert.equal(r.checks.find(x=>x.name==='Delivery is not stated, with null evidence').passed,false);
});
test('actual Claude correction is distinct from the first reply and preserves source labels',async()=>{
 const first=await readFile(new URL('../data/reports/claude-chatgpt-2026-11-25/claude-output.txt',import.meta.url),'utf8');
 assert(inspectResponse(first).formatError);
 const correction=await readFile(new URL('../data/reports/claude-chatgpt-2026-11-25/claude-corrected-output.json',import.meta.url),'utf8');
 const checked=inspectResponse(correction);assert(checked.checks.every(x=>x.passed));assert.equal(checked.notice_word_count,42);assert.deepEqual(checked.named_calendar_days,[]);
 const changed=JSON.parse(correction);changed.document.cutoff.evidence=changed.document.cutoff.evidence.replace('at or after','before');
 assert.equal(inspectResponse(JSON.stringify(changed)).checks.find(x=>x.name==='Cutoff evidence matches the source').passed,false);
});
