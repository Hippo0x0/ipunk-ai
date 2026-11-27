import {readTokenLog,decodeCounterFile} from './codex-token-core.mjs';
import {beginRun} from './analytics-events.mjs';
const app=document.querySelector('[data-token-reader]');
const messages={
 cached_exceeds_input:'Cached input exceeds input. Treat the counters as inconsistent.',
 reasoning_exceeds_output:'Reasoning exceeds output. Treat the counters as inconsistent.',
 non_additive_counters:'Reported total differs from input + output. An estimate, context-fill record or another producer behavior may explain this; inspect the source locally.',
 aggregate_overflow:'The response sum exceeds safe integer precision. Its total is unknown.',
 fork_metadata_present:'Fork metadata is present. Snapshots may include inherited context; they are not a verified child-only total.',
 multiple_headers_possible_inherited_history:'Multiple headers may come from copied fork history. The first header sets response-record scope.',
 different_cli_version:'The file reports another CLI version. This reader was source-checked against 0.167.0 only.',
 snapshot_counter_decrease:'A snapshot counter decreased in file order. Do not interpret the latest snapshot as lifetime usage.',
 malformed_or_truncated_lines:'Malformed or truncated lines were skipped. Results cover readable records only.',
 invalid_or_unsupported_counters:'Some records had missing, negative, fractional or unsupported counters and were skipped. Totals may be partial.',
 no_canonical_header:'No usable first session header was found. A single observed thread can be summed, but its scope is unverified.',
 multiple_unscoped_threads:'More than one thread appears without a canonical header. The response sum is withheld.',
 conflicting_response_usage:'A response ID has conflicting counters. The response sum is withheld.',
 inherited_or_other_thread_records_excluded:'Response records outside the first header’s thread were excluded.',
 no_supported_usage_total:'No supported usage total was found. Unknown does not mean zero.'
};
const metrics=[['input_tokens','Input (includes cached)'],['cached_input_tokens','Cached input (detail)'],['cache_write_input_tokens','Cache writes (detail, when present)'],['uncached_input_tokens','Derived uncached input'],['output_tokens','Output'],['reasoning_output_tokens','Reasoning output (detail)'],['total_tokens','Reported total'],['cli_style_blended_total','CLI-style total (uncached input + output)']];
if(app){
 app.hidden=false;const input=app.querySelector('input'),demo=app.querySelector('[data-token-demo]'),reset=app.querySelector('[data-token-reset]'),download=app.querySelector('[data-token-download]'),status=app.querySelector('[data-token-status]'),result=app.querySelector('[data-token-result]');let current=null,generation=0;
 const clear=()=>{current=null;download.disabled=true;result.replaceChildren();};
 const p=(parent,text)=>{const node=document.createElement('p');node.textContent=text;parent.append(node);};
 function render(report,isDemo){
  p(result,isDemo?'Synthetic example · hand-authored counters, not a real conversation.':'Selected file · readable counters only, not complete account usage.');
  const c=report.counts;p(result,`${report.responses.unique_records} unique response records; ${c.duplicate_responses} duplicate response records; ${c.snapshot_updates} distinct snapshots; ${c.duplicate_snapshots} repeated snapshots.`);
  const wrap=document.createElement('div');wrap.className='video-table';const table=document.createElement('table');wrap.append(table);result.append(wrap);
  const caption=document.createElement('caption');caption.textContent='Two separate views — never add these columns';table.append(caption);
  const head=document.createElement('thead'),hr=document.createElement('tr');for(const label of ['Counter','Observed response sum','Latest snapshot']){const th=document.createElement('th');th.scope='col';th.textContent=label;hr.append(th);}head.append(hr);table.append(head);
  const body=document.createElement('tbody');for(const [key,label]of metrics){const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=label;tr.append(th);for(const u of [report.responses.total,report.latest_snapshot]){const td=document.createElement('td');td.textContent=u?.[key]==null?'Unknown':u[key].toLocaleString('en-US');tr.append(td);}body.append(tr);}table.append(body);
  p(result,report.comparison==='same_observed_counters'?'The two views match here. Matching counters do not prove a complete history.':report.comparison==='different_observed_counters'?'The two views differ. File scope, inherited history or counter behavior may differ; this reader does not choose a billing total.':'A comparison is unavailable.');
  if(report.warnings.length){const ul=document.createElement('ul');for(const code of report.warnings){const li=document.createElement('li');li.textContent=messages[code];ul.append(li);}result.append(ul);}
  p(result,`${c.malformed_lines} malformed lines; ${c.invalid_counters} invalid counter records; ${c.rate_only_updates} updates without usage; ${c.excluded_other_thread_records} other-thread records excluded.`);
 }
 async function process(isDemo){
  const ticket=++generation,run=beginRun('codex-token-reader',isDemo?'process':'import');clear();status.textContent='Reading locally…';
  try{
   let text;if(isDemo){input.value='';const response=await fetch('/evidence/codex-token/synthetic-usage.jsonl');if(!response.ok)throw new Error('The example could not be loaded.');text=await response.text();}
   else {const file=input.files?.[0];if(!file){status.textContent='Choose a JSONL file or try the synthetic example.';run.cancel();return;}text=await decodeCounterFile(file);}
   if(ticket!==generation){run.cancel();return;}current=readTokenLog(text);render(current,isDemo);download.disabled=false;status.textContent='Summary ready. Only counters, counts and warning codes enter the download.';run.success();
  }catch(error){if(ticket!==generation){run.cancel();return;}clear();status.textContent=error.message;run.error();}
 }
 input.addEventListener('change',()=>process(false));demo.addEventListener('click',()=>process(true));
 reset.addEventListener('click',()=>{generation++;clear();input.value='';status.textContent='Cleared from this tool. Choose a file or try the example.';});
 download.addEventListener('click',()=>{if(!current)return;const run=beginRun('codex-token-reader','export');try{const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='codex-counter-summary.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Summary download requested.';run.success();}catch{status.textContent='The download could not be started.';run.error();}});
}
