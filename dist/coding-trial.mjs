import {exportTrial} from './coding-trial-core.mjs';
import {beginRun} from './analytics-events.mjs';
const form=document.querySelector('[data-coding-log]'),status=document.querySelector('[data-trial-status]'),output=document.querySelector('[data-trial-summary]'),download=document.querySelector('[data-trial-download]');
let current=null;
if(form){
  document.querySelector('[data-coding-app]').hidden=false;
  form.addEventListener('input',()=>{current=null;download.disabled=true;status.textContent='Check the records to include your changes.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();const run=beginRun('coding-trial-log','import');
    try{
      const records=[...form.querySelectorAll('[data-product]')].map(set=>{const get=n=>set.querySelector(`[name="${n}"]`);return {product:set.dataset.product,state:get('state').value,version:get('version').value,model:get('model').value,plan:get('plan').value,corrections:get('corrections').value,notes:get('notes').value,tap_text:get('tap').value,test_files_unchanged:get('unchanged').checked,diff_reviewed:get('reviewed').checked};});
      current=exportTrial(records);output.replaceChildren(...current.records.map(r=>{const p=document.createElement('p');p.textContent=`${r.product}: ${r.state}${r.tap?`, ${r.tap.passed}/12 checks reported passed`:''}; ${r.corrections} correction(s). Test files marked unchanged: ${r.manual_review.test_files_unchanged?'yes':'no'}. Diff marked reviewed: ${r.manual_review.diff_reviewed?'yes':'no'}.`;return p;}));download.disabled=false;status.textContent='Records checked. Pasted test summaries and manual marks do not establish a winner.';run.success();
    }catch(error){current=null;download.disabled=true;output.replaceChildren();status.textContent=error.message;run.error();}
  });
  download.addEventListener('click',()=>{if(!current)return;const run=beginRun('coding-trial-log','export');try{const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='coding-trial-record.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Download requested.';run.success();}catch{status.textContent='Download could not be started.';run.error();}});
}
