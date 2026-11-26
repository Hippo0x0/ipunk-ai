import {beginRun} from './analytics-events.mjs';
import {Input,BlobSource,ALL_FORMATS,Output,Mp4OutputFormat,WebMOutputFormat,BufferTarget,Conversion} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';
const form=document.querySelector('#converter'),fileInput=form.querySelector('input'),format=form.querySelector('select'),status=form.querySelector('output'),start=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-cancel]'),download=form.querySelector('a'),preview=form.querySelector('video'),progress=form.querySelector('progress');
let conversion,url,busy=false,aborted=false;
const n=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
function size(v){return v<1000?v+' B':v<1e6?n.format(v/1000)+' kB':n.format(v/1e6)+' MB';}
function clear(){download.hidden=true;preview.hidden=true;preview.pause();preview.removeAttribute('src');preview.load();if(url)URL.revokeObjectURL(url);url=undefined;}
function controls(active){busy=active;fileInput.disabled=active;format.disabled=active;start.disabled=active;cancel.disabled=!active;}
for(const el of [fileInput,format])el.addEventListener('change',()=>{clear();progress.value=0;status.textContent='Ready to convert the selected file.';});
cancel.addEventListener('click',async()=>{aborted=true;status.textContent='Cancelling…';try{await conversion?.cancel();}catch{}});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;clear();const file=fileInput.files[0];
 if(!file){status.textContent='Choose a video first.';return;}
 if(file.size>250*1024*1024){status.textContent='Choose a video up to 250 MB. Use a desktop editor for larger files.';return;}
 controls(true);aborted=false;progress.value=0;status.textContent='Reading video and audio…';let input;const analyticsRun=beginRun('video-converter');
 try{
  input=new Input({source:new BlobSource(file),formats:ALL_FORMATS});
  const v=await input.getVideoTracks(),a=await input.getAudioTracks();
  if(v.length!==1||a.length>1)throw new Error('Use one video track and at most one audio track. Multi-track projects need a desktop editor.');
  const mp4=format.value==='mp4',target=new BufferTarget(),output=new Output({target,format:mp4?new Mp4OutputFormat({fastStart:'in-memory'}):new WebMOutputFormat()});
  conversion=await Conversion.init({input,output,video:{codec:mp4?'avc':'vp9'},audio:{codec:mp4?'aac':'opus'},showWarnings:false});
  if(aborted)throw new Error('Cancelled.');
  if(!conversion.isValid||conversion.discardedTracks.length)throw new Error('This browser cannot preserve every track in that format. Try the other format or a desktop converter; no incomplete download was created.');
  conversion.onProgress=p=>{progress.value=p;status.textContent='Converting… '+Math.round(p*100)+'%';};
  await conversion.execute();if(aborted)throw new Error('Cancelled.');
  const blob=new Blob([target.buffer],{type:mp4?'video/mp4':'video/webm'}),check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
  let detail;
  try{
   const video=await check.getVideoTracks(),audio=await check.getAudioTracks();
   if(video.length!==1||audio.length!==a.length)throw new Error('The output failed its track check; no download was created.');
   const duration=await check.computeDuration();
   if(!Number.isFinite(duration)||duration<=0)throw new Error('The output has no readable duration.');
   detail=await video[0].getDisplayWidth()+' × '+await video[0].getDisplayHeight()+' pixels; '+n.format(duration)+' seconds; '+(audio.length?'audio retained.':'source had no audio.');
  }finally{check.dispose();}
  if(aborted)throw new Error('Cancelled.');
  url=URL.createObjectURL(blob);download.href=url;download.download=file.name.replace(/\.[^.]+$/,'')+'-converted.'+(mp4?'mp4':'webm');download.textContent='Download '+(mp4?'MP4':'WebM');download.hidden=false;preview.src=url;preview.hidden=false;progress.value=1;
  status.textContent=size(file.size)+' → '+size(blob.size)+'. '+detail+' Format conversion does not guarantee a smaller file. Play the saved result in the destination app.';
 analyticsRun.success();
 }catch(error){aborted?analyticsRun.cancel():analyticsRun.error();status.textContent=aborted?'Cancelled. Your original file is unchanged.':error.message||'Unable to convert this video.';}
 finally{input?.dispose();conversion=undefined;controls(false);}
});
window.addEventListener('pagehide',()=>{aborted=true;conversion?.cancel().catch(()=>{});clear();});
form.hidden=false;
