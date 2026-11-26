import {beginRun} from './analytics-events.mjs';
import {Input,BlobSource,ALL_FORMATS,Output,Mp4OutputFormat,BufferTarget,Conversion} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';
const form=document.querySelector('#crop-tool'),file=form.querySelector('[type=file]'),ratio=form.querySelector('select'),x=form.querySelector('[name=x]'),y=form.querySelector('[name=y]'),source=form.querySelector('[data-source]'),box=form.querySelector('[data-box]'),frame=form.querySelector('[data-frame]'),result=form.querySelector('[data-result]'),status=form.querySelector('output'),geometry=form.querySelector('[data-geometry]'),start=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-cancel]'),download=form.querySelector('a'),progress=form.querySelector('progress');
let sourceURL,resultURL,conversion,busy=false,aborted=false,ready=false;
function releaseResult(){result.pause();result.removeAttribute('src');result.load();result.hidden=true;download.hidden=true;if(resultURL)URL.revokeObjectURL(resultURL);resultURL=undefined;}
function rect(){
 const w=source.videoWidth,h=source.videoHeight,[p,q]=ratio.value.split(':').map(Number),k=Math.floor(Math.min(w/p,h/q)/2)*2;
 if(!k)throw new Error('The source is too small for this crop.');
 const width=p*k,height=q*k,left=Math.round((w-width)*Number(x.value)/200)*2,top=Math.round((h-height)*Number(y.value)/200)*2;
 const s=Math.min(1,1280/Math.max(width,height)),outK=Math.max(2,Math.floor(k*s/2)*2);
 return {left:Math.min(left,w-width),top:Math.min(top,h-height),width,height,outW:p*outK,outH:q*outK};
}
function update(){if(!ready)return;releaseResult();const r=rect();box.style.cssText=`left:${r.left/source.videoWidth*100}%;top:${r.top/source.videoHeight*100}%;width:${r.width/source.videoWidth*100}%;height:${r.height/source.videoHeight*100}%`;
 x.disabled=busy||r.width===source.videoWidth;y.disabled=busy||r.height===source.videoHeight;
 geometry.textContent=`Keep ${r.width} × ${r.height} pixels from left ${r.left}, top ${r.top}. Output: ${r.outW} × ${r.outH} pixels. The same rectangle applies throughout.`;
 status.textContent='Preview the whole shot, then save the crop.';progress.value=0;
}
function controls(active){busy=active;file.disabled=active;ratio.disabled=active;x.disabled=active;y.disabled=active;start.disabled=active||!ready;cancel.disabled=!active;if(!active&&ready){const r=rect();x.disabled=r.width===source.videoWidth;y.disabled=r.height===source.videoHeight;}}
file.addEventListener('change',()=>{ready=false;source.pause();source.removeAttribute('src');source.load();frame.hidden=true;releaseResult();if(sourceURL)URL.revokeObjectURL(sourceURL);sourceURL=undefined;controls(false);geometry.textContent='';progress.value=0;
 const selected=file.files[0];if(!selected)return;
 if(selected.size>250*1024*1024){status.textContent='Choose a file up to 250 MB. Use a desktop editor for larger files.';return;}
 sourceURL=URL.createObjectURL(selected);source.src=sourceURL;status.textContent='Reading video…';
});
source.addEventListener('loadedmetadata',()=>{if(!source.videoWidth||!source.videoHeight||!Number.isFinite(source.duration)){status.textContent='This video has no readable frame or duration.';return;}
 ready=true;frame.hidden=false;frame.style.aspectRatio=`${source.videoWidth}/${source.videoHeight}`;x.value=y.value='50';controls(false);try{update();}catch(e){ready=false;controls(false);status.textContent=e.message;}
});
source.addEventListener('error',()=>{ready=false;controls(false);status.textContent='This browser cannot preview the selected video. Try a complete H.264 MP4 or a desktop editor.';});
for(const el of [ratio,x,y])el.addEventListener('input',()=>{try{update();}catch(e){status.textContent=e.message;}});
cancel.addEventListener('click',async()=>{aborted=true;status.textContent='Cancelling…';try{await conversion?.cancel();}catch{}});
form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!ready)return;releaseResult();source.pause();controls(true);aborted=false;progress.value=0;status.textContent='Preparing crop…';let input;const analyticsRun=beginRun('video-crop');
 try{
  const r=rect(),selected=file.files[0];input=new Input({source:new BlobSource(selected),formats:ALL_FORMATS});
  const v=await input.getVideoTracks(),a=await input.getAudioTracks();
  if(v.length!==1||a.length>1)throw new Error('Use one video track and at most one audio track. No cropped file was created.');
  if(await v[0].getDisplayWidth()!==source.videoWidth||await v[0].getDisplayHeight()!==source.videoHeight)throw new Error('Preview and decoded dimensions differ. Use a desktop editor for this source.');
  const target=new BufferTarget(),output=new Output({target,format:new Mp4OutputFormat({fastStart:'in-memory'})});
  conversion=await Conversion.init({input,output,video:{codec:'avc',crop:{left:r.left,top:r.top,width:r.width,height:r.height},width:r.outW,height:r.outH,fit:'fill',forceTranscode:true,allowTransformationMetadata:false},audio:{codec:'aac'},showWarnings:false});
  if(aborted)throw new Error('Cancelled.');
  if(!conversion.isValid||conversion.discardedTracks.length)throw new Error('This browser cannot encode every track. Try an updated browser or a desktop editor; no incomplete download was created.');
  conversion.onProgress=p=>{progress.value=p;status.textContent='Cropping… '+Math.round(p*100)+'%';};await conversion.execute();if(aborted)throw new Error('Cancelled.');
  const blob=new Blob([target.buffer],{type:'video/mp4'}),check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
  let duration;try{const vv=await check.getVideoTracks(),aa=await check.getAudioTracks();duration=await check.computeDuration();if(vv.length!==1||aa.length!==a.length||await vv[0].getDisplayWidth()!==r.outW||await vv[0].getDisplayHeight()!==r.outH||!(duration>0))throw new Error('The output failed its dimension or track check; no download was created.');}finally{check.dispose();}
  if(aborted)throw new Error('Cancelled.');resultURL=URL.createObjectURL(blob);download.href=resultURL;download.download=selected.name.replace(/\.[^.]+$/,'')+'-cropped.mp4';download.hidden=false;result.src=resultURL;result.hidden=false;progress.value=1;
  status.textContent=`Ready: ${r.outW} × ${r.outH} pixels, ${duration.toFixed(2)} seconds, ${blob.size.toLocaleString('en-US')} bytes; ${a.length?'audio retained':'source had no audio'}. Download and check the saved video.`;
 analyticsRun.success();
 }catch(e){aborted?analyticsRun.cancel():analyticsRun.error();status.textContent=aborted?'Cancelled. Your original is unchanged.':e.message||'Unable to crop this video.';}finally{input?.dispose();conversion=undefined;controls(false);}
});
window.addEventListener('pagehide',()=>{aborted=true;conversion?.cancel().catch(()=>{});source.pause();if(sourceURL)URL.revokeObjectURL(sourceURL);releaseResult();});form.hidden=false;
