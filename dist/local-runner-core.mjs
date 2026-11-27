export function localBase(value){
 if(typeof value!=='string')throw new Error('Enter a loopback API URL.');
 const match=value.trim().match(/^https?:\/\/(127\.0\.0\.1|\[::1\]):(\d{1,5})\/v1\/?$/);
 if(!match||Number(match[2])<1||Number(match[2])>65535)throw new Error('Use an explicit loopback URL such as http://127.0.0.1:1234/v1.');
 return value.trim().replace(/\/$/,'');
}
function modelName(value){if(typeof value!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_./:@+\-]{0,199}$/.test(value))throw new Error('Enter a model ID of 1–200 letters, digits or supported punctuation.');return value;}
export function quoteShell(value){return "'"+value.replaceAll("'","'\"'\"'")+"'";}
export function probeCommand(label,base,model){
 if(!['ollama','lmstudio'].includes(label))throw new Error('Choose a listed runtime.');
 return `python3 probe-local-api.py --base-url ${quoteShell(localBase(base))} --model ${quoteShell(modelName(model))} --label ${label} --output ${label}-report.json`;
}
const bounded=(value,max,name)=>{if(typeof value!=='string'||value.length>max)throw new Error(`Invalid ${name}.`);return value;};
export function readProbeReport(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1||!['ollama','lmstudio'].includes(input.runtime_label)||!['completed','incomplete','error'].includes(input.status))throw new Error('Expected a version 1 local-API probe report.');
 const out={version:1,runtime_label:input.runtime_label,status:input.status,qualification:'Imported client report; runtime identity, file hash and network restrictions require separate evidence.'};
 if(input.status==='error'){out.error_code=/^(HTTP_\d{3}|invalid_input_or_incomplete_api_response)$/.test(input.error_code??'')?input.error_code:'unclassified_error';return out;}
 out.base_url=localBase(input.base_url);out.model_requested=modelName(input.model_requested);
 out.checked_at=bounded(input.checked_at,80,'timestamp');
 if(!Array.isArray(input.listed_model_ids)||input.listed_model_ids.length>100)throw new Error('Invalid model list.');
 out.listed_model_ids=input.listed_model_ids.map(x=>bounded(x,200,'model ID'));
 for(const key of ['non_stream','stream']){
  const value=input[key];if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Missing response observations.');
  const content=bounded(value.content,10000,'response text');
  out[key]={content,finish_reason:value.finish_reason===null?null:bounded(value.finish_reason,80,'finish reason'),prompt_followed:content.trim()==='LOCAL_OK'};
  if(key==='stream'){out[key].done_marker=value.done_marker===true;out[key].protocol_completed=out[key].done_marker&&!!out[key].finish_reason;}
 }
 if(input.status==='completed'&&!out.stream.protocol_completed)throw new Error('A completed report needs a stream finish reason and DONE marker.');
 return out;
}
export function combineReports(inputs){
 if(!Array.isArray(inputs)||inputs.length<1||inputs.length>2)throw new Error('Choose one or two probe reports.');
 const reports=inputs.map(readProbeReport);
 if(new Set(reports.map(x=>x.runtime_label)).size!==reports.length)throw new Error('Choose at most one report per runtime.');
 return {version:1,reports,model_equivalence_verified:false,performance_winner:null,qualification:'API compatibility observations only; this worksheet does not verify equivalent model weights, privacy, offline execution, accuracy or speed.'};
}
export function contextCommands(base,model,tokens){
 let origin;
 try{if(typeof base!=='string')throw new Error();origin=localBase(base.replace(/\/$/,'')+'/v1').slice(0,-3);}
 catch{throw new Error('Use a loopback server URL such as http://127.0.0.1:11434, without /v1.');}
 const name=modelName(model);
 if(![2048,4096,8192].includes(Number(tokens)))throw new Error('Choose 2048, 4096 or 8192 tokens.');
 const body={model:name,messages:[{role:'user',content:'Reply with exactly LOCAL_OK and nothing else.'}],options:{num_ctx:Number(tokens),temperature:0,num_predict:16},stream:false,keep_alive:'60s'};
 return {request:`curl --noproxy '*' ${quoteShell(origin+'/api/chat')} -H 'Content-Type: application/json' --data-binary ${quoteShell(JSON.stringify(body))}`,inspect:`curl --noproxy '*' ${quoteShell(origin+'/api/ps')}`,requested_context:Number(tokens),model:name};
}
export function readRunningContext(raw){
 if(typeof raw!=='string'||raw.length>100000)throw new Error('Paste a running-model JSON snapshot of at most 100 kB.');
 const value=JSON.parse(raw);
 if(!value||!Array.isArray(value.models)||value.models.length>100)throw new Error('Expected a models array from /api/ps.');
 return value.models.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Invalid running model row.');
  return {name:bounded(row.name??row.model,200,'model name'),context_length:Number.isSafeInteger(row.context_length)&&row.context_length>0?row.context_length:null};
 });
}
