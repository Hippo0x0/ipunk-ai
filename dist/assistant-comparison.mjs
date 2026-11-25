import {inspectResponse} from './assistant-task-check.mjs';
const form=document.querySelector('#comparison-check');
form.addEventListener('submit',event=>{event.preventDefault();
 for(const panel of form.querySelectorAll('[data-response]')){
  const out=panel.querySelector('output'),raw=panel.querySelector('textarea').value;
  out.replaceChildren();
  function line(text){const p=document.createElement('p');p.textContent=text;out.append(p);}
  if(!raw.trim()){line('Paste the original response to check it.');continue;}
  const r=inspectResponse(raw);if(r.formatError){line(r.formatError);continue;}
  const ul=document.createElement('ul');for(const c of r.checks){const li=document.createElement('li');li.textContent=(c.passed?'Pass: ':'Check: ')+c.name;ul.append(li);}out.append(ul);
  line('Notice: '+r.notice_word_count+' words.');
  if(r.named_calendar_days.length)line('Review named weekdays: '+r.named_calendar_days.join(', ')+'. The policy does not supply a holiday calendar.');
  line('Still review the answer meanings, exactly two sentences and all six notice facts. A matching quotation does not prove the answer follows it.');
 }
});form.hidden=false;
