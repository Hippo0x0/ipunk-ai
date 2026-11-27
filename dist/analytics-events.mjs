const TOOLS=new Set(['video-compressor','audio-extractor','video-converter','video-gif','video-crop','assistant-comparison','source-audit','image-brief-builder','assistant-task-selector','coding-trial-log','local-api-check','ollama-context-check']);
export function record(event,detail={}) { try { window.dispatchEvent(new CustomEvent('ai:analytics',{detail:{event,...detail}})); } catch {} }
export function beginRun(tool_id,stage='process') {
 const run_id=globalThis.crypto?.randomUUID?.(),start=performance.now();let ended=false;
 if(!TOOLS.has(tool_id)||!run_id)return {success(){},error(){},cancel(){}};
 record('tool_run_start',{tool_id,stage,run_id});
 const end=(event,extra={})=>{if(ended)return;ended=true;record(event,{tool_id,stage,run_id,duration_ms:Math.round(performance.now()-start),...extra});};
 return {success(){end('tool_run_success');},error(){end('tool_run_error',{error_code:'processing_failed'});},cancel(){end('tool_run_cancel');}};
}
