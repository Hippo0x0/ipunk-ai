const radarStyles=document.createElement('link');radarStyles.rel='stylesheet';radarStyles.href='/radar.css';document.head.append(radarStyles);
const button=document.querySelector('[data-language]');
const saved=localStorage.getItem('ipunk-ai-language');
if(saved==='en') document.body.classList.add('en');
let projectData=null;
let activeFilter='all';

function isEnglish(){return document.body.classList.contains('en')}
function update(){
  if(!button)return;
  const en=isEnglish();
  button.textContent=en?'中文':'English';
  button.setAttribute('aria-label',en?'切换到中文':'Switch to English');
  document.documentElement.lang=en?'en':'zh-CN';
  const search=document.querySelector('[data-search]');if(search)search.placeholder=en?'Search project, repository or use case':'搜索项目、仓库或用途';
  const options=document.querySelectorAll('[data-sort] option');
  const labels=en?['Editorial score','Snapshot growth','Total stars','Confidence']:['综合评分','快照增量','Star 总数','置信度'];
  options.forEach((option,index)=>{option.textContent=labels[index]});
  renderCaptureLabels();
  window.dispatchEvent(new CustomEvent('languagechange'));
}
button?.addEventListener('click',()=>{document.body.classList.toggle('en');localStorage.setItem('ipunk-ai-language',isEnglish()?'en':'zh');update()});
for(const link of document.querySelectorAll('a.back')) link.href='/#projects';
const nav=document.querySelector('.navlinks');
if(nav&&!nav.querySelector('[data-trends-link]')){
  const link=document.createElement('a');link.href='/trends/';link.dataset.trendsLink='';link.innerHTML='<span class="zh-only">趋势榜</span><span class="en-only">Trends</span>';
  nav.insertBefore(link,nav.querySelector('a[href="/methodology/"]')||nav.querySelector('[data-language]'));
}
if(nav&&!nav.querySelector('[data-compare-link]')){
  const link=document.createElement('a');link.href='/compare/';link.dataset.compareLink='';link.innerHTML='<span class="zh-only">项目对比</span><span class="en-only">Compare</span>';
  nav.insertBefore(link,nav.querySelector('a[href="/methodology/"]')||nav.querySelector('[data-language]'));
}

const grid=document.querySelector('#projects .grid');
if(grid){
  const tools=document.createElement('div');tools.className='radar-tools';tools.setAttribute('aria-label','项目筛选与排序');
  tools.innerHTML='<label class="searchbox"><span class="sr-only">搜索项目</span><input type="search" data-search autocomplete="off" placeholder="搜索项目、仓库或用途"></label><div class="filters" role="group" aria-label="项目类型"><button class="filter is-active" type="button" data-filter="all"><span class="zh-only">全部</span><span class="en-only">All</span></button><button class="filter" type="button" data-filter="coding">Coding</button><button class="filter" type="button" data-filter="agent">Agent</button><button class="filter" type="button" data-filter="tool">Tools</button></div><label class="sortbox"><span class="zh-only">排序</span><span class="en-only">Sort</span><select data-sort><option value="score">综合评分</option><option value="growth">快照增量</option><option value="stars">Star 总数</option><option value="confidence">置信度</option></select></label>';
  grid.before(tools);
  const status=document.createElement('div');status.className='radar-status';status.setAttribute('aria-live','polite');status.innerHTML='<span><b data-result-count>12</b> <span class="zh-only">个结果</span><span class="en-only">results</span></span><span class="capture-window" data-capture-window></span>';grid.before(status);
  const empty=document.createElement('div');empty.className='empty-state';empty.dataset.empty='';empty.hidden=true;empty.innerHTML='<strong><span class="zh-only">没有匹配的项目</span><span class="en-only">No matching projects</span></strong><p class="zh-only">试试更短的关键词，或切换到“全部”。</p><p class="en-only">Try a shorter query or switch to All.</p>';grid.after(empty);
  const note=document.createElement('div');note.className='data-note';note.innerHTML='<strong class="zh-only">怎样读“增量”？</strong><strong class="en-only">How to read delta</strong><span class="zh-only"> 卡片中的 +★ 是上次到本次 GitHub 快照之间的变化；准确间隔显示在上方。它不是搜索热度，也不代表项目质量。</span><span class="en-only"> +★ compares the previous GitHub snapshot with the latest one; the exact interval appears above. It is neither search demand nor a quality score.</span>';grid.after(note);
  const categories={rea:'tool',openclaw:'agent',jev:'agent','gemini-cli':'coding','browser-use':'tool',markitdown:'tool','claude-code':'coding','codex-cli':'coding','qwen-code':'coding',opencode:'coding',cline:'coding','deepseek-harness':'agent'};
  for(const card of grid.querySelectorAll('.card')){
    const slug=new URL(card.href).pathname.split('/').filter(Boolean).at(-1);card.dataset.project=slug;card.dataset.category=categories[slug]||'agent';card.dataset.score=card.querySelector('.score')?.textContent.trim()||'0';
    const confidence=card.querySelector('.signal span')?.textContent.match(/(\d+)%/)?.[1]||'0';card.dataset.confidence=confidence;
  }
  document.querySelector('[data-search]')?.addEventListener('input',applyProjectView);
  document.querySelector('[data-sort]')?.addEventListener('change',applyProjectView);
  document.querySelectorAll('[data-filter]').forEach(item=>item.addEventListener('click',()=>{activeFilter=item.dataset.filter;document.querySelectorAll('[data-filter]').forEach(candidate=>candidate.classList.toggle('is-active',candidate===item));applyProjectView()}));
}

function renderCaptureLabels(){
  if(!projectData)return;
  const locale=isEnglish()?'en-US':'zh-CN';const captured=new Date(projectData.captured_at);
  document.querySelectorAll('[data-captured]').forEach(target=>target.textContent=captured.toLocaleString(locale,{dateStyle:'medium',timeStyle:'short'}));
  const previous=projectData.projects.map(item=>item.previous_capture_at).find(Boolean);const target=document.querySelector('[data-capture-window]');
  if(target&&previous){const hours=Math.max(1,Math.round((captured-new Date(previous))/3600000));target.textContent=isEnglish()?`Snapshot interval: ${hours}h`:`快照间隔：${hours} 小时`}
}

function applyProjectView(){
  if(!grid)return;
  const search=(document.querySelector('[data-search]')?.value||'').trim().toLowerCase();const sort=document.querySelector('[data-sort]')?.value||'score';const cards=[...grid.querySelectorAll('.card')];
  cards.sort((a,b)=>Number(b.dataset[sort]||0)-Number(a.dataset[sort]||0)).forEach(card=>grid.append(card));let visible=0;
  for(const card of cards){const show=(activeFilter==='all'||card.dataset.category===activeFilter)&&(!search||card.textContent.toLowerCase().includes(search));card.hidden=!show;if(show)visible+=1}
  const count=document.querySelector('[data-result-count]');if(count)count.textContent=String(visible);const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=visible!==0;
}

fetch('/data/projects.json').then(response=>response.ok?response.json():Promise.reject(new Error(`HTTP ${response.status}`))).then(data=>{
  projectData=data;const number=new Intl.NumberFormat('en-US');
  for(const card of document.querySelectorAll('.card')){
    const slug=card.dataset.project||new URL(card.href).pathname.split('/').filter(Boolean).at(-1);const project=data.projects.find(item=>item.slug===slug);if(!project)continue;
    card.dataset.stars=String(project.stars);card.dataset.growth=String(project.stars_since_previous_capture??-1);
    const values=card.querySelectorAll('.metric strong');if(values[0])values[0].textContent=number.format(project.stars);if(values[1])values[1].textContent=number.format(project.forks);
    const signal=card.querySelector('.signal i');if(signal&&project.stars_since_previous_capture!=null)signal.textContent=`${project.stars_since_previous_capture>=0?'+':''}${number.format(project.stars_since_previous_capture)} ★`;
  }
  const slug=location.pathname.split('/').filter(Boolean).at(-1);const project=data.projects.find(item=>item.slug===slug);
  if(project){const values=document.querySelectorAll('.snapshot dd');for(const [index,value] of [project.stars,project.forks,project.open_issues].entries())if(values[index])values[index].textContent=number.format(value)}
  renderCaptureLabels();applyProjectView();
}).catch(()=>{document.querySelectorAll('[data-capture-window]').forEach(target=>target.textContent=isEnglish()?'Live data unavailable':'实时数据暂不可用')});

update();
