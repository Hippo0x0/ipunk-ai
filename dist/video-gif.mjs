import {Input,BlobSource,ALL_FORMATS,CanvasSink} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';
import {GIFEncoder,quantize,applyPalette} from './vendor/gifenc/gifenc-1.0.3.mjs';
const form=document.querySelector('#gif-tool'),fileInput=form.querySelector('input[type=file]'),status=form.querySelector('output'),startButton=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-cancel]'),download=form.querySelector('a'),preview=form.querySelector('img'),progress=form.querySelector('progress');
let url,busy=false,aborted=false;
const n=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
function clear(){download.hidden=true;preview.hidden=true;preview.removeAttribute('src');if(url)URL.revokeObjectURL(url);url=undefined;}
function controls(active){busy=active;for(const el of form.querySelectorAll('input,select'))el.disabled=active;startButton.disabled=active;cancel.disabled=!active;}
for(const el of form.querySelectorAll('input,select'))el.addEventListener('change',()=>{clear();progress.value=0;status.textContent='Ready to convert the selected segment.';});
cancel.addEventListener('click',()=>{aborted=true;status.textContent='Cancelling…';});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;clear();
 const file=fileInput.files[0];if(!file){status.textContent='Choose a video first.';return;}
 if(file.size>250*1024*1024){status.textContent='Choose a video up to 250 MB.';return;}
 const start=form.elements.namedItem('start').valueAsNumber,length=form.elements.namedItem('length').valueAsNumber,fps=Number(form.elements.fps.value),longest=Number(form.elements.longest.value);
 if(!Number.isFinite(start)||start<0||!Number.isFinite(length)||length<.4||length>10){status.textContent='Use a non-negative start and a length from 0.4 to 10 seconds.';return;}
 controls(true);aborted=false;progress.value=0;status.textContent='Reading video…';
 let input;
 try{
  input=new Input({source:new BlobSource(file),formats:ALL_FORMATS});
  const tracks=await input.getVideoTracks();
  if(tracks.length!==1)throw new Error('Choose a file with one video track.');
  const track=tracks[0],end=await track.computeDuration(),first=await track.getFirstTimestamp(),duration=end-first;
  if(!Number.isFinite(duration)||start>=duration)throw new Error('The start is outside the video. Choose an earlier start.');
  const used=Math.min(length,duration-start),frames=Math.ceil(used*fps);
  if(frames<2)throw new Error('Choose a longer segment to create a multi-frame GIF.');
  const w=await track.getDisplayWidth(),h=await track.getDisplayHeight(),scale=Math.min(1,longest/Math.max(w,h)),width=Math.max(1,Math.round(w*scale)),height=Math.max(1,Math.round(h*scale));
  const sink=new CanvasSink(track,{width,height,fit:'contain'}),gif=GIFEncoder();
  const timestamps=Array.from({length:frames},(_,i)=>first+start+i/fps);
  let count=0;
  for await(const wrapped of sink.canvasesAtTimestamps(timestamps)){
   if(aborted)throw new Error('Cancelled.');
   if(!wrapped)throw new Error('A requested frame could not be decoded. Try another segment or a current desktop browser.');
   const rgba=wrapped.canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,width,height).data;
   const palette=quantize(rgba,256),index=applyPalette(rgba,palette);
   const delay=Math.max(10,Math.round(Math.min(1/fps,used-count/fps)*1000/10)*10);
   gif.writeFrame(index,width,height,{palette,delay,repeat:0});
   count++;progress.value=count/frames;status.textContent='Creating GIF… '+count+' / '+frames+' frames';
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(aborted)throw new Error('Cancelled.');
  if(count!==frames)throw new Error('The segment was incomplete. No download was created.');
  gif.finish();
  const blob=new Blob([gif.bytes()],{type:'image/gif'});
  url=URL.createObjectURL(blob);download.href=url;download.download=file.name.replace(/\.[^.]+$/,'')+'-clip.gif';download.hidden=false;
  preview.src=url;preview.hidden=matchMedia('(prefers-reduced-motion: reduce)').matches;
  status.textContent=n.format(blob.size/1000)+' kB; '+width+' × '+height+' pixels; '+count+' frames; '+n.format(used)+' seconds from '+n.format(start)+'s. GIF has no audio and loops continuously.'+(preview.hidden?' Preview hidden for your reduced-motion preference.':'');
 }catch(error){status.textContent=aborted?'Cancelled. Your original video is unchanged.':error.message||'Unable to create a GIF.';}
 finally{input?.dispose();controls(false);}
});
window.addEventListener('pagehide',()=>{aborted=true;clear();});
form.hidden=false;
