import {beginRun} from './analytics-events.mjs';
import {Input,BlobSource,ALL_FORMATS,Output,Mp4OutputFormat,WavOutputFormat,BufferTarget,Conversion} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';
const form=document.querySelector('#audio-extractor'),fileInput=form.querySelector('input'),format=form.querySelector('select'),status=form.querySelector('output'),start=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-cancel]'),download=form.querySelector('a'),preview=form.querySelector('audio'),progress=form.querySelector('progress');
let conversion,url,busy=false,aborted=false;
const n=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
function bytes(v){return v<1000?v+' B':v<1e6?n.format(v/1000)+' kB':n.format(v/1e6)+' MB';}
function clear(){download.hidden=true;preview.hidden=true;preview.pause();preview.removeAttribute('src');preview.load();if(url)URL.revokeObjectURL(url);url=undefined;}
function controls(active){busy=active;fileInput.disabled=active;format.disabled=active;start.disabled=active;cancel.disabled=!active;}
for(const input of [fileInput,format])input.addEventListener('change',()=>{clear();progress.value=0;status.textContent='Ready to extract the selected audio format.';});
cancel.addEventListener('click',async()=>{aborted=true;status.textContent='Cancelling…';try{await conversion?.cancel();}catch{}});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;clear();
 const file=fileInput.files[0];if(!file){status.textContent='Choose a video first.';return;}
 if(file.size>250*1024*1024){status.textContent='Choose a file up to 250 MB. Use a desktop editor for larger files.';return;}
 controls(true);aborted=false;progress.value=0;status.textContent='Reading audio tracks…';
 let input;const analyticsRun=beginRun('audio-extractor');
 try{
  input=new Input({source:new BlobSource(file),formats:ALL_FORMATS});
  const tracks=await input.getAudioTracks();
  if(!tracks.length)throw new Error('This file has no readable audio track. Extraction cannot create missing sound.');
  if(tracks.length!==1)throw new Error('This file has multiple audio tracks. Select the wanted track in a desktop editor first.');
  const m4a=format.value==='m4a';
  if(m4a&&await tracks[0].getCodec()!=='aac')throw new Error('M4A copy mode needs an AAC source track. Choose WAV to decode this track instead.');
  if(!m4a){
   const rate=await tracks[0].getSampleRate(),channels=await tracks[0].getNumberOfChannels(),duration=await tracks[0].computeDuration();
   if(![rate,channels,duration].every(v=>Number.isFinite(v)&&v>0))throw new Error('Unable to estimate the decoded audio size.');
   if((duration+1)*rate*channels*2>250*1024*1024)throw new Error('Decoded WAV would exceed 250 MB. Use M4A for an AAC track or a desktop editor.');
  }
  const target=new BufferTarget(),output=new Output({format:m4a?new Mp4OutputFormat():new WavOutputFormat(),target});
  conversion=await Conversion.init({input,output,video:{discard:true},audio:m4a?{}:{codec:'pcm-s16',forceTranscode:true},copy:m4a?{mode:'forced'}:false,showWarnings:false});
  if(aborted)throw new Error('Cancelled.');
  if(!conversion.isValid||conversion.discardedTracks.some(d=>d.track.isAudioTrack()))throw new Error('This browser cannot preserve the requested audio. Try WAV or a current desktop browser.');
  conversion.onProgress=p=>{progress.value=p;status.textContent='Extracting… '+Math.round(p*100)+'%';};
  await conversion.execute();if(aborted)throw new Error('Cancelled.');
  const blob=new Blob([target.buffer],{type:m4a?'audio/mp4':'audio/wav'});
  const check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
  let duration;
  try{
   if((await check.getAudioTracks()).length!==1||(await check.getVideoTracks()).length!==0)throw new Error('Output track check failed. No download was created.');
   duration=await check.computeDuration();
   if(!Number.isFinite(duration)||duration<=0)throw new Error('No readable audio duration. No download was created.');
  }finally{check.dispose();}
  if(aborted)throw new Error('Cancelled.');
  url=URL.createObjectURL(blob);download.href=url;download.download=file.name.replace(/\.[^.]+$/,'')+'-audio.'+(m4a?'m4a':'wav');download.textContent='Download '+(m4a?'M4A':'WAV');download.hidden=false;preview.src=url;preview.hidden=false;progress.value=1;
  status.textContent=bytes(blob.size)+'; '+n.format(duration)+' seconds; one audio track, no video track. '+(m4a?'AAC copied without re-encoding.':'Decoded to 16-bit PCM WAV. WAV does not restore detail lost in the source.')+' Listen to the saved file before using it.';
 analyticsRun.success();
 }catch(error){aborted?analyticsRun.cancel():analyticsRun.error();status.textContent=aborted?'Cancelled. Your original video is unchanged.':error.message||'Unable to extract this file.';}
 finally{input?.dispose();conversion=undefined;controls(false);}
});
window.addEventListener('pagehide',()=>{aborted=true;conversion?.cancel().catch(()=>{});clear();});
form.hidden=false;
