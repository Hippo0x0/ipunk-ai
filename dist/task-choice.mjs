import {chooseAlternative,buildImageBrief} from './task-choice-core.mjs';
import {beginRun} from './analytics-events.mjs';
const chooser=document.querySelector('[data-alternative-form]');
if(chooser){
  chooser.hidden=false;
  const name=document.querySelector('[data-choice-name]'),reason=document.querySelector('[data-choice-reason]'),link=document.querySelector('[data-choice-link]'),prompt=document.querySelector('[data-choice-prompt]');
  function update(){const item=chooseAlternative(chooser.elements.task.value);name.textContent=item.name;reason.textContent=item.reason;link.href=item.path;link.textContent=item.evidence;prompt.hidden=!item.prompt;if(item.prompt)prompt.href=item.prompt;}
  chooser.addEventListener('change',()=>{const run=beginRun('assistant-task-selector');try{update();run.success();}catch(error){run.error();throw error;}});update();
}
const form=document.querySelector('[data-image-brief]');
if(form){
  document.querySelector('[data-brief-app]').hidden=false;
  const output=document.querySelector('[data-brief-output]'),list=document.querySelector('[data-brief-checks]'),status=document.querySelector('[data-brief-status]'),download=document.querySelector('[data-brief-download]');
  let current=null;
  function generate(track=false){
    const run=track?beginRun('image-brief-builder'):null;
    try{current=buildImageBrief({kind:form.elements.kind.value,subject:form.elements.subject.value,words:form.elements.words.value});output.value=current.prompt;list.replaceChildren(...current.checks.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));download.disabled=false;status.textContent='Brief ready.';run?.success();}
    catch(error){current=null;output.value='';list.replaceChildren();download.disabled=true;status.textContent=error.message;run?.error();}
  }
  form.addEventListener('submit',event=>{event.preventDefault();generate(true);});
  form.addEventListener('input',()=>{current=null;download.disabled=true;status.textContent='Generate the brief to include your changes.';});
  download.addEventListener('click',()=>{if(!current)return;const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='image-trial-brief.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Download requested.';});
  document.querySelectorAll('[data-brief-preset]').forEach(button=>button.addEventListener('click',()=>{const poster=button.dataset.briefPreset==='poster';form.elements.kind.value=poster?'poster':'objects';form.elements.subject.value=poster?'A cream poster with a simple teal border and dark teal centered lettering.':'Exactly three identical teal ceramic mugs in one left-to-right row on a white background. Every handle points right. Clean flat illustration.';form.elements.words.value=poster?'NIGHT SKY CLUB\nFRIDAY 18 DECEMBER 2026\nDOORS 19:30 UTC\nBRING A NOTEBOOK':'MUG TEST 2048';generate(true);}));
  generate();
}
