// Hand-authored, counter-shaped examples. Never reads a user's Codex files.
import {mkdir,writeFile} from 'node:fs/promises';
import {readTokenLog} from '../dist/codex-token-core.mjs';
const root=new URL('../dist/evidence/codex-token/',import.meta.url);await mkdir(root,{recursive:true});
const thread='11111111-1111-4111-8111-111111111111';
const usage=(i,c,o,r)=>({input_tokens:i,cached_input_tokens:c,cache_write_input_tokens:0,output_tokens:o,reasoning_output_tokens:r,total_tokens:i+o});
const first=usage(1000,200,100,40),second=usage(3000,2800,200,60),total=usage(4000,3000,300,100);
const snapshot=(u,last)=>({type:'event_msg',payload:{type:'token_count',info:{total_token_usage:u,last_token_usage:last,model_context_window:128000},rate_limits:null}});
const response=(n,u,threadTotal)=>({type:'token_usage_record',payload:{thread_id:thread,session_id:thread,turn_id:`synthetic-turn-${n}`,root_turn_id:`synthetic-turn-${n}`,response_id:`synthetic-response-${n}`,usage:u,turn_token_usage:u,thread_token_usage:threadTotal}});
const rows=[{type:'session_meta',payload:{id:thread,session_id:thread,cli_version:'0.167.0',originator:'ipunk-synthetic-fixture'}},
 {type:'response_item',payload:{type:'message',content:[{type:'input_text',text:'SYNTHETIC_PRIVATE_PROMPT_DO_NOT_EXPORT'}]}},
 snapshot(first,first),response(1,first,first),snapshot(first,first),response(1,first,first),snapshot(total,second),response(2,second,total),
 {type:'event_msg',payload:{type:'token_count',info:null,rate_limits:{plan_type:'SYNTHETIC_PRIVATE_PLAN_DO_NOT_EXPORT'}}}];
const text=rows.map((row,i)=>JSON.stringify({timestamp:`2026-11-27T00:00:0${i}Z`,...row})).join('\n')+'\n';
await writeFile(new URL('synthetic-usage.jsonl',root),text);
await writeFile(new URL('synthetic-summary.json',root),JSON.stringify(readTokenLog(text),null,2)+'\n');
await writeFile(new URL('method.json',root),JSON.stringify({checked_at:'2026-11-27',fixture_kind:'hand_authored_counter_shapes_not_a_replayable_Codex_session',private_session_files_read:false,cli_version_checked:'0.167.0',source_commit:'086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a',source_paths:['codex-rs/protocol/src/protocol.rs','codex-rs/history/src/rollout_payload.rs','codex-rs/rollout/src/policy.rs'],source_base:'https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/',expected:{unique_responses:2,duplicate_responses:1,distinct_snapshots:2,duplicate_snapshots:1,reported_total:4300,uncached_input:1000,cli_style_blended_total:1300},limits:['Not a billing, credit, quota, context-remaining or account-wide usage estimate.','Counter-only fields are inspected; input prompts, IDs, paths, model labels, rate-limit metadata and timestamps never enter the summary.','Synthetic fixtures validate reader arithmetic and failure handling, not provider accounting or exhaustive version compatibility.']},null,2)+'\n');
