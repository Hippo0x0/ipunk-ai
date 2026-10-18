const comparisonEditorial={
  rea:{name:'REA',score:78,confidence:61},openclaw:{name:'OpenClaw',score:82,confidence:68},jev:{name:'Jev',score:57,confidence:42},
  'gemini-cli':{name:'Gemini CLI',score:84,confidence:72},'browser-use':{name:'Browser Use',score:79,confidence:65},markitdown:{name:'MarkItDown',score:76,confidence:70},
  'claude-code':{name:'Claude Code',score:85,confidence:72},'codex-cli':{name:'Codex CLI',score:86,confidence:75},'qwen-code':{name:'Qwen Code',score:82,confidence:66},
  opencode:{name:'OpenCode',score:85,confidence:76},cline:{name:'Cline',score:84,confidence:78},'deepseek-harness':{name:'DeepSeek Harness',score:80,confidence:60}
};
const defaultSelection=['codex-cli','claude-code','gemini-cli'];
const selected=new Set();
let compareData=null;
const number=new Intl.NumberFormat('en-US');
const picker=document.querySelector('[data-project-picker]');

function readSelection(){
  const requested=new URLSearchParams(location.search).get('projects')?.split(',').filter(slug=>comparisonEditorial[slug]).slice(0,3)||[];
  return requested.length>=2?requested:defaultSelection;
}
function syncUrl(){
  const params=new URLSearchParams();if(selected.size)params.set('projects',[...selected].join(','));history.replaceState(null,'',`${location.pathname}?${params}`);
}
function setSelection(slugs){selected.clear();slugs.slice(0,3).forEach(slug=>selected.add(slug));renderPickerState();renderComparison();syncUrl()}
function renderPickerState(){
  picker?.querySelectorAll('input').forEach(input=>{input.checked=selected.has(input.value);input.disabled=!input.checked&&selected.size>=3});
  const count=document.querySelector('[data-selection-count]');if(count)count.textContent=`${selected.size} / 3`;
  const message=document.querySelector('[data-selection-message]');if(message){const remaining=Math.max(0,2-selected.size);message.innerHTML=remaining?`<span class="zh-only">请再选择 ${remaining} 个项目</span><span class="en-only">Choose ${remaining} more project${remaining===1?'':'s'}</span>`:selected.size===3?'<span class="zh-only">已选择上限；取消一个即可替换</span><span class="en-only">Selection full; uncheck one to replace it</span>':'<span class="zh-only">可以比较；再选 1 个也可以</span><span class="en-only">Ready to compare; one more is optional</span>'}
}
function metric(labelZh,labelEn,values,format=value=>value){return `<tr><th><span class="zh-only">${labelZh}</span><span class="en-only">${labelEn}</span></th>${values.map(value=>`<td>${format(value)}</td>`).join('')}</tr>`}
function renderComparison(){
  const output=document.querySelector('[data-compare-output]');if(!compareData||selected.size<2){if(output)output.hidden=true;return}output.hidden=false;
  const projects=[...selected].map(slug=>compareData.projects.find(project=>project.slug===slug)).filter(Boolean);const editorial=projects.map(project=>comparisonEditorial[project.slug]);
  document.querySelector('[data-compare-head]').innerHTML=`<tr><th><span class="zh-only">指标</span><span class="en-only">Metric</span></th>${projects.map((project,index)=>`<th><span class="compare-rank">0${index+1}</span><a href="/projects/${project.slug}/">${editorial[index].name}</a><small>${project.repo}</small></th>`).join('')}</tr>`;
  const signed=value=>value==null?'—':`${value>=0?'+':''}${number.format(value)}`;
  document.querySelector('[data-compare-body]').innerHTML=[
    metric('编辑总分','Editorial score',editorial.map(item=>item.score),value=>`<strong class="score-cell">${value}</strong> / 100`),
    metric('证据置信度','Evidence confidence',editorial.map(item=>item.confidence),value=>`${value}%`),
    metric('Stars','Stars',projects.map(item=>item.stars),value=>number.format(value)),
    metric('快照 Star 增量','Snapshot star delta',projects.map(item=>item.stars_since_previous_capture),signed),
    metric('Forks','Forks',projects.map(item=>item.forks),value=>number.format(value)),
    metric('未关闭 Issues','Open issues',projects.map(item=>item.open_issues),value=>number.format(value)),
    metric('主要语言','Primary language',projects.map(item=>item.language||'—')),
    metric('许可证','License',projects.map(item=>item.license||'未声明 / Not declared'))
  ].join('');
  const highest=projects.reduce((best,project)=>comparisonEditorial[project.slug].score>comparisonEditorial[best.slug].score?project:best,projects[0]);
  const growth=projects.reduce((best,project)=>(project.stars_since_previous_capture??-Infinity)>(best.stars_since_previous_capture??-Infinity)?project:best,projects[0]);
  document.querySelector('[data-comparison-summary]').innerHTML=`<div><span><span class="zh-only">本组最高编辑分</span><span class="en-only">Highest editorial score</span></span><strong>${comparisonEditorial[highest.slug].name} · ${comparisonEditorial[highest.slug].score}</strong></div><div><span><span class="zh-only">本次快照增量最高</span><span class="en-only">Highest snapshot growth</span></span><strong>${comparisonEditorial[growth.slug].name} · ${signed(growth.stars_since_previous_capture)} ★</strong></div>`;
}
fetch('/data/projects.json').then(response=>response.ok?response.json():Promise.reject(new Error('data unavailable'))).then(data=>{
  compareData=data;picker.innerHTML=data.projects.map(project=>`<label class="project-choice"><input type="checkbox" value="${project.slug}"><span><strong>${comparisonEditorial[project.slug]?.name||project.slug}</strong><small>${project.repo}</small></span><i>${number.format(project.stars)} ★</i></label>`).join('');
  picker.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{if(input.checked&&selected.size<3)selected.add(input.value);else selected.delete(input.value);renderPickerState();renderComparison();syncUrl()}));
  document.querySelector('[data-compare-captured]').textContent=new Date(data.captured_at).toLocaleString(document.documentElement.lang==='en'?'en-US':'zh-CN',{dateStyle:'medium',timeStyle:'short'});
  setSelection(readSelection());
}).catch(()=>{picker.innerHTML='<div class="notice">Project snapshot unavailable. Please try again later.</div>'});
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>setSelection(button.dataset.preset.split(','))));
document.querySelector('[data-clear]')?.addEventListener('click',()=>setSelection([]));
window.addEventListener('languagechange',()=>{if(compareData)document.querySelector('[data-compare-captured]').textContent=new Date(compareData.captured_at).toLocaleString(document.documentElement.lang==='en'?'en-US':'zh-CN',{dateStyle:'medium',timeStyle:'short'})});
