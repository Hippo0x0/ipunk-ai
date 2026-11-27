export function parseTapSummary(raw){
  if(typeof raw!=='string'||raw.length>100000)throw new Error('Paste a TAP report of at most 100 kB.');
  const read=key=>{const rows=[...raw.matchAll(new RegExp('^# '+key+' (\\d+)\\s*$','gm'))];if(rows.length!==1)throw new Error(`Expected one TAP ${key} summary.`);return Number(rows[0][1]);};
  const tests=read('tests'),passed=read('pass'),failed=read('fail'),skipped=read('skipped'),cancelled=read('cancelled'),todo=read('todo');
  if(tests!==12||[passed,failed,skipped,cancelled,todo].some(x=>!Number.isSafeInteger(x)||x<0||x>12)||passed+failed+skipped+cancelled+todo!==tests)throw new Error('The report must account for exactly 12 fixture checks.');
  return {tests,passed,failed,skipped,cancelled,todo,all_checks_reported_passed:passed===12,verification:'Parsed pasted summary only; implementation, test hashes and authenticity were not checked.'};
}
function text(value,max,name){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`Enter ${name} (1–${max} characters).`);return value.trim();}
function count(value,name){const x=typeof value==='number'?value:Number(value);if(value===''||!Number.isSafeInteger(x)||x<0||x>1000)throw new Error(`${name} must be an integer from 0 to 1000.`);return x;}
export function makeTrialRecord(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a trial record.');
  if(!['Claude Code','Cursor'].includes(input.product))throw new Error('Choose Claude Code or Cursor.');
  if(!['not_run','incomplete','completed'].includes(input.state))throw new Error('Choose a listed run state.');
  const record={product:input.product,state:input.state,version:text(input.version,100,'app version'),model:text(input.model,100,'model or unknown'),plan:text(input.plan,100,'plan or unknown'),corrections:count(input.corrections,'Corrections'),notes:typeof input.notes==='string'?input.notes.trim():'',manual_review:{test_files_unchanged:input.test_files_unchanged===true,diff_reviewed:input.diff_reviewed===true},tap:null};
  if(record.notes.length>2000)throw new Error('Notes must be at most 2000 characters.');
  if(input.state==='completed')record.tap=parseTapSummary(input.tap_text);
  return record;
}
export function exportTrial(records){
  if(!Array.isArray(records)||records.length!==2)throw new Error('Record both product slots.');
  const clean=records.map(makeTrialRecord);
  if(new Set(clean.map(x=>x.product)).size!==2)throw new Error('Use one slot per product.');
  return {version:1,fixture:'orders-v1-12-checks',records:clean,mode:'manual_record',automated_product_ranking:false,qualification:'Self-recorded trial, not an independent verification, general product score or latency benchmark.'};
}
