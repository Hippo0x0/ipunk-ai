const trendNumber=new Intl.NumberFormat('en-US');
const signed=value=>`${value>=0?'+':''}${trendNumber.format(value)}`;
fetch('/data/projects.json').then(response=>response.ok?response.json():Promise.reject(new Error('snapshot unavailable'))).then(data=>{
  const projects=data.projects.map(project=>{
    const comparable=project.stars_since_previous_capture!=null;
    const previous=comparable?project.stars-project.stars_since_previous_capture:null;
    const flagged=comparable&&project.stars_since_previous_capture>1000&&project.stars_since_previous_capture>previous*.05;
    return {...project,comparable,flagged};
  }).sort((a,b)=>(b.stars_since_previous_capture??-1)-(a.stars_since_previous_capture??-1));
  const comparable=projects.filter(project=>project.comparable);
  const fresh=projects.length-comparable.length;
  const flagged=projects.filter(project=>project.flagged).length;
  const summary=document.querySelectorAll('#trend-summary strong');
  [projects.length,comparable.length,fresh,flagged].forEach((value,index)=>{if(summary[index])summary[index].textContent=value});
  const captured=new Date(data.captured_at);
  const previous=comparable.map(project=>new Date(project.previous_capture_at)).sort((a,b)=>a-b)[0];
  const hours=previous?Math.round((captured-previous)/36e5):null;
  const updateTrendMeta=()=>{
    document.querySelector('[data-trend-captured]').textContent=captured.toLocaleString(document.documentElement.lang==='en'?'en-US':'zh-CN',{dateStyle:'medium',timeStyle:'short'});
    document.querySelector('[data-trend-window]').textContent=hours?`${hours} h`:'—';
  };
  updateTrendMeta();window.addEventListener('languagechange',updateTrendMeta);
  document.querySelector('#trend-rows').innerHTML=projects.map((project,index)=>{
    const deltaStars=project.comparable?signed(project.stars_since_previous_capture):'—';
    const deltaForks=project.comparable?signed(project.forks_since_previous_capture):'—';
    const signal=project.flagged?'<span class="flag warning"><span class="zh-only">需复核</span><span class="en-only">Review</span></span>':project.comparable?'<span class="flag"><span class="zh-only">已比较</span><span class="en-only">Compared</span></span>':'<span class="flag new"><span class="zh-only">首次收录</span><span class="en-only">New</span></span>';
    return `<tr><td>${String(index+1).padStart(2,'0')}</td><td><a href="/projects/${project.slug}/"><strong>${project.slug==='gemini-cli'?'Gemini CLI':project.slug==='browser-use'?'Browser Use':project.slug==='markitdown'?'MarkItDown':project.slug==='openclaw'?'OpenClaw':project.slug.toUpperCase()}</strong><small>${project.repo}</small></a></td><td>${trendNumber.format(project.stars)}</td><td class="delta ${project.stars_since_previous_capture>0?'up':''}">${deltaStars}</td><td>${trendNumber.format(project.forks)}</td><td class="delta ${project.forks_since_previous_capture>0?'up':''}">${deltaForks}</td><td>${signal}</td></tr>`;
  }).join('');
}).catch(()=>{document.querySelector('#trend-rows').innerHTML='<tr><td colspan="7">Snapshot unavailable. Please try again later.</td></tr>'});
