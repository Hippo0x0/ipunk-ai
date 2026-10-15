const button=document.querySelector('[data-language]');
const saved=localStorage.getItem('ipunk-ai-language');
if(saved==='en') document.body.classList.add('en');
function update(){if(!button)return;const en=document.body.classList.contains('en');button.textContent=en?'中文':'English';button.setAttribute('aria-label',en?'切换到中文':'Switch to English');document.documentElement.lang=en?'en':'zh-CN'}
button?.addEventListener('click',()=>{document.body.classList.toggle('en');localStorage.setItem('ipunk-ai-language',document.body.classList.contains('en')?'en':'zh');update()});update();
for(const link of document.querySelectorAll('a.back')) link.href='/#projects';
fetch('/data/projects.json').then(response=>response.ok?response.json():Promise.reject()).then(data=>{
  const number=new Intl.NumberFormat('en-US');
  const paths={rea:'morluto/rea',openclaw:'openclaw/openclaw',jev:'jevmodel/jev-ai','gemini-cli':'google-gemini/gemini-cli','browser-use':'browser-use/browser-use',markitdown:'microsoft/markitdown'};
  for(const card of document.querySelectorAll('.card')){
    const slug=new URL(card.href).pathname.split('/').filter(Boolean).at(-1);const project=data.projects.find(item=>item.repo===paths[slug]);if(!project)continue;
    const values=card.querySelectorAll('.metric strong');if(values[0])values[0].textContent=number.format(project.stars);if(values[1])values[1].textContent=number.format(project.forks);
    const signal=card.querySelector('.signal i');if(signal&&project.stars_since_previous_capture!=null)signal.textContent=`${project.stars_since_previous_capture>=0?'+':''}${number.format(project.stars_since_previous_capture)} ★`;
  }
  const slug=location.pathname.split('/').filter(Boolean).at(-1);const project=data.projects.find(item=>item.repo===paths[slug]);
  if(project){const values=document.querySelectorAll('.snapshot dd');for(const [index,value] of [project.stars,project.forks,project.open_issues].entries())if(values[index])values[index].textContent=number.format(value)}
  for(const target of document.querySelectorAll('[data-captured]')) target.textContent=new Date(data.captured_at).toLocaleString(document.documentElement.lang==='en'?'en-US':'zh-CN',{dateStyle:'medium',timeStyle:'short'});
}).catch(()=>{});
