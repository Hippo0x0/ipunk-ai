const chooserProfiles={
  'codex-cli':{name:'Codex CLI',workflow:'terminal',score:86,confidence:75},
  'claude-code':{name:'Claude Code',workflow:'terminal',score:85,confidence:72},
  'gemini-cli':{name:'Gemini CLI',workflow:'terminal',score:84,confidence:72},
  opencode:{name:'OpenCode',workflow:'terminal',score:85,confidence:76},
  cline:{name:'Cline',workflow:'ide',score:84,confidence:78},
  'qwen-code':{name:'Qwen Code',workflow:'terminal',score:82,confidence:66}
};
const chooser=document.querySelector('[data-chooser]');
const results=document.querySelector('[data-results]');
const number=new Intl.NumberFormat('en-US');
let chooserData=null;

function answer(name){return new FormData(chooser).get(name)}
function reason(project,profile,workflow,license,priority){
  const zh=[];const en=[];
  if(workflow==='either'){
    zh.push(profile.workflow==='ide'?'IDE 工作流':'终端工作流');en.push(profile.workflow==='ide'?'IDE workflow':'terminal workflow');
  }else if(profile.workflow===workflow){
    zh.push(workflow==='ide'?'匹配 IDE 工作流':'匹配终端工作流');en.push(workflow==='ide'?'matches an IDE workflow':'matches a terminal workflow');
  }else{
    zh.push(profile.workflow==='ide'?'IDE 工具，终端适配度较低':'终端工具，IDE 适配度较低');en.push(profile.workflow==='ide'?'IDE tool; weaker terminal fit':'terminal tool; weaker IDE fit');
  }
  if(license==='open'){zh.push(`${project.license} 许可证`);en.push(`${project.license} license`)}else if(!project.license){zh.push('快照未声明许可证');en.push('license not declared in snapshot')}
  const signal=priority==='confidence'?`${profile.confidence}% 证据置信度`:priority==='score'?`${profile.score}/100 编辑分`:`${project.stars_since_previous_capture>=0?'+':''}${number.format(project.stars_since_previous_capture??0)} ★ 快照增量`;
  zh.push(signal);en.push(signal);
  return {zh:zh.join(' · '),en:en.join(' · ')};
}
function rankProjects(){
  if(!chooserData)return;
  const workflow=answer('workflow');const license=answer('license');const priority=answer('priority');
  const candidates=chooserData.projects.filter(project=>chooserProfiles[project.slug]).filter(project=>license!=='open'||project.license);
  const ranked=candidates.map(project=>{
    const profile=chooserProfiles[project.slug];let fit=0;
    if(workflow==='either')fit+=20;else if(profile.workflow===workflow)fit+=42;else fit-=24;
    if(license==='open'&&project.license)fit+=18;else if(license==='either'&&project.license)fit+=5;
    if(priority==='confidence')fit+=profile.confidence*.45;
    if(priority==='score')fit+=profile.score*.4;
    if(priority==='growth'){const growth=Math.max(0,project.stars_since_previous_capture??0);fit+=Math.min(36,Math.log10(growth+1)*14)}
    return {project,profile,fit,reason:reason(project,profile,workflow,license,priority)};
  }).sort((a,b)=>b.fit-a.fit||b.profile.confidence-a.profile.confidence).slice(0,3);
  results.innerHTML=ranked.map(({project,profile,reason},index)=>`<article class="result-card"><span class="result-rank">0${index+1}</span><div><h3><a href="/projects/${project.slug}/">${profile.name}</a></h3><p>${project.repo}</p></div><dl><div><dt><span class="zh-only">编辑分</span><span class="en-only">Score</span></dt><dd>${profile.score}</dd></div><div><dt>Stars</dt><dd>${number.format(project.stars)}</dd></div></dl><p class="result-reason ${!project.license?'license-warning':''}"><span class="zh-only">${reason.zh}</span><span class="en-only">${reason.en}</span></p></article>`).join('');
  const compare=document.querySelector('[data-compare-choice]');compare.href=`/compare/?projects=${ranked.map(item=>item.project.slug).join(',')}`;
}
function renderCaptured(){
  if(!chooserData)return;const locale=document.body.classList.contains('en')?'en-US':'zh-CN';const value=new Date(chooserData.captured_at).toLocaleString(locale,{dateStyle:'medium',timeStyle:'short'});document.querySelectorAll('[data-choose-captured]').forEach(item=>item.textContent=value)
}
chooser?.addEventListener('change',rankProjects);
fetch('/data/projects.json').then(response=>response.ok?response.json():Promise.reject(new Error('data unavailable'))).then(data=>{chooserData=data;rankProjects();renderCaptured()}).catch(()=>{results.innerHTML='<div class="notice"><span class="zh-only">项目快照暂不可用，请稍后重试。</span><span class="en-only">Project snapshot unavailable. Please try again later.</span></div>'});
window.addEventListener('languagechange',renderCaptured);
