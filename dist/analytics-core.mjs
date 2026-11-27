export const SITE='ai.ipunk.cn';
export const INTERNAL_KEY='ipunk.analytics.internal.v1',CONSENT_KEY='ipunk.analytics.consent.v1',TEST_KEY='ipunk.analytics.test.v1';
const SAFE_PATH=/^\/[a-zA-Z0-9_./-]*$/;
const TOOLS=new Set(['video-compressor','audio-extractor','video-converter','video-gif','video-crop','assistant-comparison','source-audit','image-brief-builder','assistant-task-selector']);
export function pageContext(path,canonical){
 try{const u=new URL(canonical);if(u.origin!=='https://'+SITE||u.search||u.hash||u.pathname!==path||!SAFE_PATH.test(path)||path.includes('..'))return null;
 const locale=path.startsWith('/en/')?'en':'zh';const page_type=path.includes('/guides/')?'guide':path.includes('/projects/')?'project':path.includes('/privacy/')?'privacy':'index';
 return {site:SITE,page_path:path,page_type,locale};}catch{return null;}
}
export function permitted(runtime){try{return runtime.hostname()===SITE&&!runtime.privacySignal()&&runtime.local.getItem(INTERNAL_KEY)!=='true'&&[null,'granted'].includes(runtime.local.getItem(CONSENT_KEY))&&(runtime.session.getItem('ai.analytics.storage-probe'),true);}catch{return false;}}
export function cleanEvent(event,p={}){
 if(event==='$pageview'||event==='article_engaged')return {};
 if(['article_toc_click','article_decision_steps_click'].includes(event))return Number.isInteger(p.section_index)&&p.section_index>0&&p.section_index<250?{section_index:p.section_index}:null;
 if(event==='related_guide_click')return typeof p.target_path==='string'&&/^\/(?:en\/)?(?:guides|projects)\/[a-z0-9-]+\/$/.test(p.target_path)?{target_path:p.target_path}:null;
 if(event==='external_link_click')return typeof p.target_host==='string'&&/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(p.target_host)?{target_host:p.target_host}:null;
 if(event==='download_initiated')return ['result','evidence'].includes(p.download_kind)?{download_kind:p.download_kind}:null;
 if(!['tool_run_start','tool_run_success','tool_run_error','tool_run_cancel'].includes(event)||!TOOLS.has(p.tool_id)||!['process','import','export'].includes(p.stage)||!/^[a-f0-9-]{36}$/i.test(p.run_id??''))return null;
 const out={tool_id:p.tool_id,stage:p.stage,run_id:p.run_id};
 if(event!=='tool_run_start'){if(!Number.isFinite(p.duration_ms)||p.duration_ms<0)return null;out.duration_ms=Math.min(3600000,Math.round(p.duration_ms));}
 if(event==='tool_run_error')out.error_code='processing_failed';return out;
}
export function createClient(config,runtime,sdk){
 let initialized=false,denied=false;
 const allowed=()=>!denied&&permitted(runtime);
 const stop=()=>{if(!initialized)return;try{sdk.opt_out_capturing();sdk.reset(true);sdk.opt_out_capturing();}catch{}};
 const context=()=>runtime.context();
 const keys=new Set(['token','distinct_id','$device_id','$session_id','$window_id','$pageview_id','$is_identified','$is_first_visit','$browser','$browser_version','$os','$os_version','$device','$device_type','$screen_height','$screen_width','$viewport_height','$viewport_width','$lib','$lib_version','$config_defaults','$insert_id','$time','$host','$pathname']);
 const beforeSend=e=>{
  const page=context(),clean=e&&cleanEvent(e.event,e.properties);if(!allowed()||!page||clean===null)return null;
  const properties={...page,...clean,release_id:config.release,analytics_implementation:'posthog-js',traffic_type:runtime.local.getItem(TEST_KEY)==='true'?'internal_test':'production',$current_url:'https://'+SITE+page.page_path,$process_person_profile:false,$geoip_disable:true};
  for(const k of keys)if(Object.hasOwn(e.properties,k))properties[k]=e.properties[k];
  if(e.properties.$referring_domain==='$direct'||/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(e.properties.$referring_domain??''))properties.$referring_domain=e.properties.$referring_domain;
  return {...e,properties};
 };
 const capture=(event,props={})=>{
  if(!allowed()){stop();return false;}if(!context()||cleanEvent(event,props)===null)return false;
  try{
   if(!initialized){
    if(!/^phc_[a-zA-Z0-9_]{10,200}$/.test(config.key)||!['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(config.host))return false;
    for(const store of [runtime.local,runtime.session]){store.setItem('ai.analytics.storage-probe','1');if(store.getItem('ai.analytics.storage-probe')!=='1')return false;store.removeItem('ai.analytics.storage-probe');}
    sdk.init(config.key,{api_host:config.host,defaults:'2026-08-30',persistence:'localStorage',persistence_name:'ipunk_ai',cross_subdomain_cookie:false,person_profiles:'never',capture_pageview:false,capture_pageleave:false,autocapture:false,capture_dead_clicks:false,rageclick:false,disable_session_recording:true,disable_surveys:true,disable_conversations:true,disable_product_tours:true,disable_web_experiments:true,capture_exceptions:false,capture_performance:false,capture_heatmaps:false,capture_webmcp:false,disable_external_dependency_loading:true,advanced_disable_flags:true,opt_in_site_apps:false,respect_dnt:true,ip:false,save_campaign_params:false,save_referrer:true,disable_scroll_properties:true,request_batching:false,get_current_url:()=> 'https://'+SITE+context().page_path,before_send:beforeSend});initialized=true;
   }
   if(sdk.has_opted_out_capturing())sdk.opt_in_capturing({captureEventName:false});
   return !!sdk.capture(event,props);
  }catch{return false;}
 };
 return {capture,allowed,stop,beforeSend,setConsent(value){if(!['granted','denied'].includes(value))return false;if(value==='denied'){denied=true;stop();}try{runtime.local.setItem(CONSENT_KEY,value);denied=value==='denied';return true;}catch{denied=true;stop();return false;}}};
}
