const trendNumber=new Intl.NumberFormat('en-US');
const signed=value=>`${value>=0?'+':''}${trendNumber.format(value)}`;
const projectNames={
  'gemini-cli':'Gemini CLI','browser-use':'Browser Use','markitdown':'MarkItDown',openclaw:'OpenClaw',
  'claude-code':'Claude Code','codex-cli':'Codex CLI','qwen-code':'Qwen Code',opencode:'OpenCode',cline:'Cline',
  'deepseek-harness':'DeepSeek Harness',rea:'REA',jev:'Jev'
};
let historyTimeline=null;
const fetchJson=path=>fetch(path).then(response=>response.ok?response.json():Promise.reject(new Error(`${path} unavailable`)));
function sparkline(values){
  const width=240,height=58,pad=4,min=Math.min(...values),max=Math.max(...values),span=max-min||1;
  const points=values.map((value,index)=>`${pad+(index*(width-pad*2)/Math.max(1,values.length-1))},${height-pad-((value-min)/span)*(height-pad*2)}`).join(' ');
  const last=points.split(' ').at(-1).split(',');
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Star history"><line class="baseline" x1="0" y1="${height-pad}" x2="${width}" y2="${height-pad}"></line><polyline class="series" points="${points}"></polyline><circle cx="${last[0]}" cy="${last[1]}" r="3.5"></circle></svg>`;
}
function updateHistoryRange(){
  const target=document.querySelector('[data-history-range]');if(!target||!historyTimeline?.snapshots?.length)return;
  const snapshots=historyTimeline.snapshots;const locale=document.documentElement.lang==='en'?'en-US':'zh-CN';
  const format=value=>new Date(`${value}T00:00:00Z`).toLocaleDateString(locale,{month:'short',day:'numeric',timeZone:'UTC'});
  target.textContent=document.documentElement.lang==='en'?`${format(snapshots[0].date)}–${format(snapshots.at(-1).date)} · ${snapshots.length} daily captures`:`${format(snapshots[0].date)}–${format(snapshots.at(-1).date)} · ${snapshots.length} 次日快照`;
}
function renderHistory(timeline){
  historyTimeline=timeline;const snapshots=timeline?.snapshots||[];const target=document.querySelector('[data-history-grid]');
  if(snapshots.length<2){target.innerHTML='<div class="history-loading"><span class="zh-only">历史快照不足，暂不能计算多日趋势。</span><span class="en-only">Not enough snapshots for a multi-day trend.</span></div>';return}
  const series=Object.keys(projectNames).map(slug=>{
    const points=snapshots.map(snapshot=>snapshot.projects.find(project=>project.slug===slug)).filter(Boolean);
    if(points.length<2)return null;const first=points[0].stars,last=points.at(-1).stars,delta=last-first;
    return {slug,values:points.map(point=>point.stars),first,last,delta,percent:first?delta/first*100:null,captures:points.length};
  }).filter(Boolean).sort((a,b)=>b.delta-a.delta).slice(0,6);
  target.innerHTML=series.map(item=>`<a class="history-card" href="/projects/${item.slug}/"><div class="history-card-head"><div><h3>${projectNames[item.slug]}</h3><small>${item.captures} CAPTURES</small></div><strong class="history-delta ${item.delta<0?'down':''}">${signed(item.delta)} ★</strong></div>${sparkline(item.values)}<div class="history-stats"><span>${trendNumber.format(item.first)} → ${trendNumber.format(item.last)}</span><span>${item.percent==null?'—':`${item.percent>=0?'+':''}${item.percent.toFixed(item.percent>=10?0:1)}%`}</span></div></a>`).join('');
  updateHistoryRange();
}
Promise.all([fetchJson('/data/projects.json'),fetchJson('/data/timeline.json').catch(()=>null)]).then(([data,timeline])=>{
  const projects=data.projects.map(project=>{
    const comparable=project.stars_since_previous_capture!=null;
    const previous=comparable?project.stars-project.stars_since_previous_capture:null;
    const flagged=comparable&&(project.stars_since_previous_capture>1000||project.stars_since_previous_capture>previous*.05);
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
  updateTrendMeta();if(timeline)renderHistory(timeline);else document.querySelector('[data-history-grid]').innerHTML='<div class="history-loading">Timeline unavailable. Latest snapshot data remains available below.</div>';
  window.addEventListener('languagechange',()=>{updateTrendMeta();updateHistoryRange()});
  document.querySelector('#trend-rows').innerHTML=projects.map((project,index)=>{
    const deltaStars=project.comparable?signed(project.stars_since_previous_capture):'—';
    const deltaForks=project.comparable?signed(project.forks_since_previous_capture):'—';
    const signal=project.flagged?'<span class="flag warning"><span class="zh-only">需复核</span><span class="en-only">Review</span></span>':project.comparable?'<span class="flag"><span class="zh-only">已比较</span><span class="en-only">Compared</span></span>':'<span class="flag new"><span class="zh-only">首次收录</span><span class="en-only">New</span></span>';
    return `<tr><td>${String(index+1).padStart(2,'0')}</td><td><a href="/projects/${project.slug}/"><strong>${projectNames[project.slug]??project.slug}</strong><small>${project.repo}</small></a></td><td>${trendNumber.format(project.stars)}</td><td class="delta ${project.stars_since_previous_capture>0?'up':''}">${deltaStars}</td><td>${trendNumber.format(project.forks)}</td><td class="delta ${project.forks_since_previous_capture>0?'up':''}">${deltaForks}</td><td>${signal}</td></tr>`;
  }).join('');
}).catch(()=>{document.querySelector('#trend-rows').innerHTML='<tr><td colspan="7">Snapshot unavailable. Please try again later.</td></tr>'});
