import {probeCommand,combineReports,contextCommands,readRunningContext} from './local-runner-core.mjs';
import {beginRun} from './analytics-events.mjs';
const form=document.querySelector('[data-probe-command]');
if(form){
 document.querySelector('[data-local-runner-app]').hidden=false;
 const output=document.querySelector('[data-probe-command-output]'),status=document.querySelector('[data-probe-command-status]');
 form.addEventListener('submit',event=>{event.preventDefault();const run=beginRun('local-api-check','process');try{output.value=probeCommand(form.elements.runtime.value,form.elements.base.value,form.elements.model.value);status.textContent='Command ready. Run it on your own computer.';run.success();}catch(error){output.value='';status.textContent=error.message;run.error();}});
 form.elements.runtime.addEventListener('change',()=>{const ollama=form.elements.runtime.value==='ollama';form.elements.base.value=ollama?'http://127.0.0.1:11434/v1':'http://127.0.0.1:1234/v1';output.value='';status.textContent='Confirm the port and model ID, then build the command.';});
 form.addEventListener('input',()=>{output.value='';});
}
const contextForm=document.querySelector('[data-context-command]');
if(contextForm){
 document.querySelector('[data-context-app]').hidden=false;
 const commands=document.querySelector('[data-context-output]'),rows=document.querySelector('[data-context-rows]'),status=document.querySelector('[data-context-status]');
 contextForm.addEventListener('input',()=>{commands.value='';rows.replaceChildren();status.textContent='Build the commands to include your changes.';});
 contextForm.addEventListener('submit',event=>{event.preventDefault();const run=beginRun('ollama-context-check','process');try{
  const result=contextCommands(contextForm.elements.base.value,contextForm.elements.model.value,contextForm.elements.tokens.value);
  const snapshot=contextForm.elements.snapshot.value.trim(),observations=snapshot?readRunningContext(snapshot):[];
  commands.value=result.request+'\n\n'+result.inspect;
  rows.replaceChildren(...observations.map(row=>{const p=document.createElement('p');p.textContent=`${row.name}: ${row.context_length===null?'context length not reported':row.context_length+' tokens reported'}.`;return p;}));
  status.textContent=snapshot?'Snapshot parsed locally. Match the exact model name; the snapshot is not a quality or memory benchmark.':'Commands ready. Run them locally, then inspect the running-model response.';run.success();
 }catch(error){commands.value='';rows.replaceChildren();status.textContent=error instanceof SyntaxError?'The snapshot is not valid JSON.':error.message;run.error();}});
}
const importer=document.querySelector('[data-probe-reports]');
if(importer){
 const status=document.querySelector('[data-probe-import-status]'),summary=document.querySelector('[data-probe-summary]'),download=document.querySelector('[data-probe-download]');let current=null,generation=0;
 importer.addEventListener('change',async()=>{const ticket=++generation,run=beginRun('local-api-check','import');current=null;download.disabled=true;summary.replaceChildren();try{
  const files=[...importer.files];if(files.length<1||files.length>2||files.some(f=>f.size>100000))throw new Error('Choose one or two JSON reports, each no larger than 100 kB.');
  const values=await Promise.all(files.map(async file=>JSON.parse(await file.text())));if(ticket!==generation){run.cancel();return;}current=combineReports(values);
  for(const r of current.reports){const p=document.createElement('p');p.textContent=r.status==='error'?`${r.runtime_label}: ${r.error_code}.`:`${r.runtime_label}: ${r.status}; ${r.model_requested}; non-stream text ${r.non_stream.prompt_followed?'matched':'did not match'} LOCAL_OK; stream completion ${r.stream.protocol_completed?'reported':'not established'}.`;summary.append(p);}
  status.textContent='Reports read locally. Equivalent models and offline operation are not verified by these files.';download.disabled=false;run.success();
 }catch(error){if(ticket!==generation){run.cancel();return;}current=null;status.textContent=error instanceof SyntaxError?'The file is not valid JSON.':error.message;run.error();}});
 download.addEventListener('click',()=>{if(!current)return;const run=beginRun('local-api-check','export');try{const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='local-api-comparison.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Download requested.';run.success();}catch{status.textContent='Download could not be started.';run.error();}});
}
