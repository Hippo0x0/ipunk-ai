// Counter-only reader for the public Codex rust-v0.167.0 rollout schema.
// The returned object is an allowlist: no source strings, identities or timestamps.
export const MAX_BYTES=5*1024*1024;
const FIELDS=['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];
const REQUIRED=FIELDS.filter(k=>k!=='cache_write_input_tokens');
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const id=x=>typeof x==='string'&&x.length>0&&x.length<=256;
function counters(x){
 if(!object(x)||REQUIRED.some(k=>!Number.isSafeInteger(x[k])||x[k]<0))return null;
 if(x.cache_write_input_tokens!==undefined&&(!Number.isSafeInteger(x.cache_write_input_tokens)||x.cache_write_input_tokens<0))return null;
 return Object.fromEntries(FIELDS.map(k=>[k,x[k]??null]));
}
function issues(u,warnings){
 if(u.cached_input_tokens>u.input_tokens)warnings.add('cached_exceeds_input');
 if(u.reasoning_output_tokens>u.output_tokens)warnings.add('reasoning_exceeds_output');
 if(u.total_tokens-u.output_tokens!==u.input_tokens)warnings.add('non_additive_counters');
}
function view(u,warnings){
 if(!u)return null;issues(u,warnings);
 const uncached=Math.max(0,u.input_tokens-u.cached_input_tokens);
 const blended=uncached+u.output_tokens;
 return {...u,uncached_input_tokens:uncached,cli_style_blended_total:Number.isSafeInteger(blended)?blended:null};
}
function sum(rows,warnings){
 const total=Object.fromEntries(FIELDS.map(k=>[k,0]));
 for(const u of rows)for(const k of FIELDS){
  if(u[k]===null||total[k]===null){total[k]=null;continue;}
  total[k]+=u[k];if(!Number.isSafeInteger(total[k])){warnings.add('aggregate_overflow');return null;}
 }
 return total;
}
export async function decodeCounterFile(file){
 if(file.size>MAX_BYTES)throw new Error('Choose one uncompressed UTF-8 JSONL file no larger than 5 MiB.');
 if(/\.(gz|zst|zip|bz2|xz)$/i.test(file.name))throw new Error('Decompress the log locally, then choose its UTF-8 JSONL file.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes.length>MAX_BYTES)throw new Error('The file exceeds 5 MiB.');
 if((bytes[0]===0x1f&&bytes[1]===0x8b)||(bytes[0]===0x28&&bytes[1]===0xb5&&bytes[2]===0x2f&&bytes[3]===0xfd)||(bytes[0]===0x50&&bytes[1]===0x4b))throw new Error('Decompress the log locally, then choose its UTF-8 JSONL file.');
 try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new Error('This reader needs uncompressed UTF-8 JSONL.');}
}
export function readTokenLog(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)throw new Error('The text exceeds the 5 MiB reader limit.');
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);
 if(lines.length>20000+(lines.at(-1)===''?1:0))throw new Error('Choose a smaller excerpt: this reader accepts at most 20,000 non-final lines.');
 if(lines.some(line=>line.length>262144))throw new Error('A line exceeds the 256 KiB character limit. Choose a smaller counter-only excerpt.');
 if(text.includes('\u0000'))throw new Error('This reader needs uncompressed UTF-8 JSONL.');
 const warnings=new Set(),snapshots=new Set(),records=new Map();let canonical=null,headers=0,versions=new Set(),latest=null,previous=null,conflicts=false;
 const counts={nonempty_lines:0,malformed_lines:0,ignored_lines:0,invalid_counters:0,rate_only_updates:0,snapshot_updates:0,duplicate_snapshots:0,response_records:0,duplicate_responses:0,conflicting_responses:0,excluded_other_thread_records:0};
 // First pass finds the canonical first header, even in a pasted/reordered excerpt.
 const parsed=[];
 for(const line of lines){
  if(!line.trim())continue;counts.nonempty_lines++;let row;
  try{row=JSON.parse(line);}catch{counts.malformed_lines++;continue;}
  if(!object(row)){counts.ignored_lines++;continue;}
  parsed.push(row);
  if(row.type==='session_meta'&&object(row.payload)){
   headers++;if(headers===1&&id(row.payload.id))canonical=row.payload.id;
   if(id(row.payload.cli_version))versions.add(row.payload.cli_version);
   if(row.payload.forked_from_id)warnings.add('fork_metadata_present');
  }
 }
 if(headers>1)warnings.add('multiple_headers_possible_inherited_history');
 if([...versions].some(v=>v!=='0.167.0'))warnings.add('different_cli_version');
 const threads=new Set();
 for(const row of parsed){
  const p=row.payload;
  if(row.type==='event_msg'&&object(p)&&p.type==='token_count'){
   if(p.info==null){counts.rate_only_updates++;continue;}
   const u=counters(p.info?.total_token_usage);
   if(!u){counts.invalid_counters++;continue;}
   const last=p.info.last_token_usage===undefined?null:counters(p.info.last_token_usage);
   if(p.info.last_token_usage!==undefined&&!last)counts.invalid_counters++;
   const fingerprint=JSON.stringify([u,last]);
   if(snapshots.has(fingerprint))counts.duplicate_snapshots++;else {snapshots.add(fingerprint);counts.snapshot_updates++;}
   // Preserve file order, including a repeated older snapshot at the end.
   if(previous&&FIELDS.some(k=>u[k]!==null&&previous[k]!==null&&u[k]<previous[k]))warnings.add('snapshot_counter_decrease');
   previous=u;latest=u;issues(u,warnings);
  }else if(row.type==='token_usage_record'){
   counts.response_records++;
   if(!object(p)||!id(p.thread_id)||!id(p.response_id)){counts.invalid_counters++;continue;}
   if(canonical&&p.thread_id!==canonical){counts.excluded_other_thread_records++;continue;}
   threads.add(p.thread_id);const u=counters(p.usage);
   if(!u){counts.invalid_counters++;continue;}
   issues(u,warnings);const key=JSON.stringify([p.thread_id,p.response_id]),prior=records.get(key);
   if(prior){if(JSON.stringify(prior)===JSON.stringify(u))counts.duplicate_responses++;else {counts.conflicting_responses++;conflicts=true;}}
   else records.set(key,u);
  }else if(row.type!=='session_meta')counts.ignored_lines++;
 }
 if(counts.malformed_lines)warnings.add('malformed_or_truncated_lines');
 if(counts.invalid_counters)warnings.add('invalid_or_unsupported_counters');
 if(!canonical)warnings.add('no_canonical_header');
 if(threads.size>1)warnings.add('multiple_unscoped_threads');
 if(conflicts)warnings.add('conflicting_response_usage');
 if(counts.excluded_other_thread_records)warnings.add('inherited_or_other_thread_records_excluded');
 const aggregate=!conflicts&&threads.size<=1&&records.size?sum(records.values(),warnings):null;
 const responseView=view(aggregate,warnings),snapshotView=view(latest,warnings);
 if(!responseView&&!snapshotView)warnings.add('no_supported_usage_total');
 return {reader_version:1,schema_checked:'Codex CLI 0.167.0',scope:'one_selected_file_not_account_usage',counts,
  responses:{scope:canonical?'canonical_header_thread':'observed_thread_without_header',unique_records:records.size,total:responseView},
  latest_snapshot:snapshotView,comparison:responseView&&snapshotView?(FIELDS.every(k=>responseView[k]===snapshotView[k])?'same_observed_counters':'different_observed_counters'):'unavailable',
  warnings:[...warnings].sort()};
}
