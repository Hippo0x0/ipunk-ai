import {beginRun} from './analytics-events.mjs';
import {Input,BlobSource,ALL_FORMATS,Output,Mp4OutputFormat,BufferTarget,Conversion,Quality} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';
const form=document.querySelector('#compressor'), status=form.querySelector('output'), fileInput=form.querySelector('input[type=file]'), button=form.querySelector('button[type=submit]'), cancel=form.querySelector('[data-cancel]'), link=form.querySelector('[data-download]'), preview=form.querySelector('video'), progress=form.querySelector('progress');
let conversion,url,aborted=false,busy=false;
const number=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
function bytesText(bytes){return bytes<1000?bytes+' B':bytes<1e6?number.format(bytes/1000)+' kB':number.format(bytes/1e6)+' MB';}
function clearResult(){link.hidden=true;preview.hidden=true;preview.pause();preview.removeAttribute('src');preview.load();if(url)URL.revokeObjectURL(url);url=undefined;}
function controls(working){busy=working;button.disabled=working;fileInput.disabled=working;for(const s of form.querySelectorAll('select'))s.disabled=working;cancel.disabled=!working;}
fileInput.addEventListener('change',()=>{clearResult();status.textContent='Ready to compress the selected file.';});
cancel.addEventListener('click',async()=>{aborted=true;status.textContent='Cancelling…';try{if(conversion)await conversion.cancel();}catch{}});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 clearResult();const file=fileInput.files[0];
 if(!file){status.textContent='Choose a video first.';return;}
 if(file.size>250*1024*1024){status.textContent='Choose a video up to 250 MB. For larger files, use a desktop editor.';return;}
 if(!('VideoEncoder' in window)||!('VideoDecoder' in window)){status.textContent='This browser cannot run the video encoder. Try a current desktop Chrome or Edge browser.';return;}
 controls(true);aborted=false;progress.value=0;status.textContent='Reading video…';
 let input;const analyticsRun=beginRun('video-compressor');
 try{
  input=new Input({source:new BlobSource(file),formats:ALL_FORMATS});
  const videoTracks=await input.getVideoTracks(),audioTracks=await input.getAudioTracks();
  if(videoTracks.length!==1||audioTracks.length>1)throw new Error('Use a file with one video track and at most one audio track. Multi-track files need a desktop editor.');
  const track=videoTracks[0],width=await track.getDisplayWidth(),height=await track.getDisplayHeight();
  const longest=Number(form.elements.longest.value),scale=Math.min(1,longest/Math.max(width,height));
  const outputWidth=Math.max(2,Math.floor(width*scale/2)*2),outputHeight=Math.max(2,Math.floor(height*scale/2)*2);
  const target=new BufferTarget(),output=new Output({format:new Mp4OutputFormat(),target});
  conversion=await Conversion.init({input,output,video:{codec:'avc',width:outputWidth,height:outputHeight,fit:'contain',quality:new Quality({bitrate:Number(form.elements.bitrate.value)*1e6}),forceTranscode:true},audio:{codec:'aac'},showWarnings:false});
  if(aborted)throw new Error('Cancelled. Your original file is unchanged.');
  if(!conversion.isValid||conversion.discardedTracks.length)throw new Error('A track cannot be preserved in MP4 in this browser. Try another browser or a desktop editor; no incomplete download was created.');
  conversion.onProgress=value=>{progress.value=value;status.textContent='Compressing… '+Math.round(value*100)+'%';};
  await conversion.execute();
  if(aborted)throw new Error('Cancelled. Your original file is unchanged.');
  const blob=new Blob([target.buffer],{type:'video/mp4'});
  const verify=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
  try {
   const v=await verify.getVideoTracks(),a=await verify.getAudioTracks();
   if(v.length!==1||a.length!==audioTracks.length)throw new Error('Output verification failed. No download was created.');
   const duration=await verify.computeDuration();
   if(!Number.isFinite(duration)||duration<=0)throw new Error('Output has no readable duration.');
   const n=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
   const difference=100*(1-blob.size/file.size);
   status.textContent=bytesText(file.size)+' → '+bytesText(blob.size)+'. '+(difference>0?n.format(difference)+'% smaller.':'The output is not smaller; keep the original or try a lower bitrate.')+' '+outputWidth+' × '+outputHeight+' pixels; '+n.format(duration)+' seconds; '+(a.length?'audio track retained.':'source had no audio.')+' Play the result to check picture and sound before using it.';
  } finally {verify.dispose();}
  if(aborted)throw new Error('Cancelled. Your original file is unchanged.');
  url=URL.createObjectURL(blob);link.href=url;link.download=file.name.replace(/\.[^.]+$/,'')+'-compressed.mp4';link.hidden=false;preview.src=url;preview.hidden=false;progress.value=1;
 analyticsRun.success();
 }catch(error){aborted?analyticsRun.cancel():analyticsRun.error();status.textContent=aborted?'Cancelled. Your original file is unchanged.':error.message||'Unable to compress this file.';}
 finally{input?.dispose();conversion=undefined;controls(false);}
});
window.addEventListener('pagehide',()=>{aborted=true;conversion?.cancel().catch(()=>{});clearResult();});
form.hidden=false;
