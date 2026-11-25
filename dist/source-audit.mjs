import {sourceLink,readAudit,writeAudit,REVIEW_STATES} from './source-audit-core.mjs';
const form=document.querySelector('#source-audit'),rows=form.querySelector('[data-rows]'),summary=form.querySelector('output'),add=form.querySelector('[data-add]'),save=form.querySelector('[data-save]'),file=form.querySelector('[type=file]');
const labels={'unreviewed':'Not reviewed','supported':'Source supports this claim','not-supported':'Source does not support it','unavailable':'Source unavailable'};
let downloadURL;
function fields(){return [...rows.children].map(row=>({text:row.querySelector('textarea').value,source_url:row.querySelector('[type=url]').value.trim(),status:row.querySelector('select').value,notes:row.querySelector('[data-notes]').value}));}
function update(){const all=fields(),marked=all.filter(x=>x.status!=='unreviewed').length,complete=all.filter(x=>x.status!=='unreviewed'&&x.text.trim()&&sourceLink(x.source_url)&&x.notes.trim()).length;summary.textContent=complete+' of '+all.length+' review entries complete.'+(marked>complete?' Add missing claim, source or notes before downloading.':' These are your manual review entries.');add.disabled=all.length>=20;
 for(const [i,row] of [...rows.children].entries()){row.querySelector('legend').textContent='Claim '+(i+1);const remove=row.querySelector('[data-remove]');remove.disabled=rows.children.length===1;remove.setAttribute('aria-label','Remove claim '+(i+1));const link=sourceLink(row.querySelector('[type=url]').value.trim()),a=row.querySelector('a');a.hidden=!link;if(link){a.href=link.url;a.textContent='Open '+link.host;}else a.removeAttribute('href');}
}
function make(c={text:'',source_url:'',status:'unreviewed',notes:''}){
 const row=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent='Claim '+(rows.children.length+1);row.append(legend);
 function label(name,el){const l=document.createElement('label');l.append(document.createTextNode(name),el);row.append(l);return el;}
 const claim=label('Claim',document.createElement('textarea'));claim.rows=3;claim.maxLength=4000;claim.value=c.text;
 const url=label('Source URL',document.createElement('input'));url.type='url';url.maxLength=2000;url.placeholder='https://';url.value=c.source_url;
 const a=document.createElement('a');a.target='_blank';a.rel='noopener noreferrer';a.hidden=true;row.append(a);
 const select=label('Review result',document.createElement('select'));for(const status of REVIEW_STATES){const option=document.createElement('option');option.value=status;option.textContent=labels[status];select.append(option);}select.value=c.status;
 const notes=label('Source passage or reason',document.createElement('textarea'));notes.rows=2;notes.maxLength=4000;notes.dataset.notes='';notes.value=c.notes;
 const remove=document.createElement('button');remove.type='button';remove.dataset.remove='';remove.textContent='Remove claim';remove.addEventListener('click',()=>{if(rows.children.length>1){row.remove();update();}});row.append(remove);
 rows.append(row);row.addEventListener('input',update);row.addEventListener('change',update);
}
add.addEventListener('click',()=>{if(rows.children.length>=20)return;make();update();rows.lastElementChild.querySelector('textarea').focus();});
save.addEventListener('click',()=>{
 try{const text=writeAudit(fields());if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=downloadURL;a.download='ai-source-audit.json';a.click();summary.textContent='Audit download requested. Open the saved JSON to confirm your entries.';}catch(e){summary.textContent=e.message;}
});
file.addEventListener('change',async()=>{const f=file.files[0];if(!f)return;
 try{if(f.size>100000)throw new Error('Use an audit JSON file up to 100 kB.');const data=readAudit(await f.text());rows.replaceChildren();for(const c of data)make(c);update();summary.textContent='Loaded '+data.length+' manual review entries. Check them against the sources.';}catch(e){summary.textContent=e.message+' Current entries were kept.';}finally{file.value='';}
});
form.addEventListener('submit',e=>e.preventDefault());window.addEventListener('pagehide',()=>{if(downloadURL)URL.revokeObjectURL(downloadURL);});make();update();form.hidden=false;
