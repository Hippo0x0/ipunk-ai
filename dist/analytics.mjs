import {SITE,INTERNAL_KEY,CONSENT_KEY,TEST_KEY,pageContext,permitted,createClient} from './analytics-core.mjs';
const storage=name=>{try{return window[name];}catch{return undefined;}};
const runtime={hostname:()=>location.hostname,privacySignal:()=>['1','yes'].includes(navigator.doNotTrack)||navigator.globalPrivacyControl===true,local:storage('localStorage'),session:storage('sessionStorage'),context:()=>pageContext(location.pathname,document.querySelector('link[rel="canonical"]')?.href)};
let client,loading;
async function start(){if(client||!permitted(runtime)||!runtime.context())return;try{loading??=Promise.all([fetch('/analytics-config.json').then(r=>{if(!r.ok)throw Error();return r.json();}),import('./posthog-sdk.mjs')]);const [config,{default:sdk}]=await loading;if(client||!permitted(runtime))return;client=createClient(config,runtime,sdk);client.capture('$pageview');}catch{loading=undefined;}}
function capture(event,detail={}){client?.capture(event,detail);}
window.addEventListener('ai:analytics',e=>{const {event,...p}=e.detail??{};capture(event,p);});
window.addEventListener('storage',()=>{if(!permitted(runtime))client?.stop();else start();refresh();});
document.addEventListener('click',e=>{
 const a=e.target.closest?.('a');if(!a)return;let u;try{u=new URL(a.href,location.href);}catch{return;}
 if(a.hasAttribute('download')){capture('download_initiated',{download_kind:u.protocol==='blob:'?'result':'evidence'});return;}
 if(!['http:','https:'].includes(u.protocol))return;
 if(u.origin!==location.origin){capture('external_link_click',{target_host:u.hostname});return;}
 if(u.pathname===location.pathname&&u.hash){const links=[...document.querySelectorAll('.guide-toc a,.toc a')],i=links.indexOf(a);if(i>=0)capture('article_toc_click',{section_index:i+1});const steps=[...document.querySelectorAll('.decision-links a')],j=steps.indexOf(a);if(j>=0)capture('article_decision_steps_click',{section_index:j+1});}
 else capture('related_guide_click',{target_path:u.pathname});
});
let interacted=false,active=0,last=performance.now(),engaged=false;
for(const name of ['pointerdown','keydown','scroll'])window.addEventListener(name,e=>{if(e.isTrusted)interacted=true;},{passive:true});
setInterval(()=>{const now=performance.now(),delta=now-last;last=now;if(!client?.allowed()||document.hidden||!runtime.context()||!['guide','project'].includes(runtime.context().page_type))return;if(delta>0&&delta<2000)active+=delta;if(!engaged&&interacted&&active>=30000){capture('article_engaged');engaged=true;}},1000);
const preferences=document.querySelector('[data-analytics-preferences]');
function refresh(){if(!preferences)return;const status=preferences.querySelector('output'),en=document.documentElement.lang==='en';let allow=permitted(runtime);status.textContent=allow?(en?'Basic usage analytics is on.':'基础体验统计已开启。'):(en?'Usage analytics is off in this browser.':'当前浏览器不采集体验统计。');for(const b of preferences.querySelectorAll('button'))b.setAttribute('aria-pressed',String((b.value==='granted')===allow));}
if(preferences){for(const button of preferences.querySelectorAll('button'))button.addEventListener('click',()=>{try{runtime.local.setItem(CONSENT_KEY,button.value);client?.setConsent(button.value);if(button.value==='denied')client?.stop();else start();}catch{}refresh();});refresh();}
start();
