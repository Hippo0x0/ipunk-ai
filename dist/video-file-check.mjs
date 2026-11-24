import {frameFit} from './video-fit-math.mjs';
const form=document.querySelector('#clip-check');
const input=form.querySelector('input');
const target=form.querySelector('select');
const output=form.querySelector('output');
const video=form.querySelector('video');
const overlay=form.querySelector('.crop-overlay');
const preview=form.querySelector('.clip-preview');
let objectURL,metadata,request=0;
function show() {
 if(!metadata)return;
 const [w,h]=target.value.split(':').map(Number);
 const fit=frameFit(metadata.width,metadata.height,w,h);
 const f=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
 output.textContent=metadata.width+' × '+metadata.height+' pixels; '+f.format(metadata.duration)+' seconds. '+(fit.sameRatio?'The file already matches the selected shape.':'A centered fill keeps '+f.format(fit.retainedPercent)+'% of the frame area. Crop region: '+f.format(fit.cropWidth)+' × '+f.format(fit.cropHeight)+' source pixels. Fit the whole clip on the canvas to preserve the full frame, with space around it.');
 overlay.style.left=100*fit.cropLeft/metadata.width+'%';
 overlay.style.top=100*fit.cropTop/metadata.height+'%';
 overlay.style.width=100*fit.cropWidth/metadata.width+'%';
 overlay.style.height=100*fit.cropHeight/metadata.height+'%';
 overlay.hidden=false;
}
function release() {
 video.pause();video.removeAttribute('src');video.load();
 if(objectURL)URL.revokeObjectURL(objectURL);
 objectURL=undefined;metadata=undefined;overlay.hidden=true;preview.hidden=true;
}
input.addEventListener('change',()=>{
 const token=++request;
 release();
 const file=input.files[0];
 if(!file){output.textContent='Choose a downloaded video.';return;}
 if(file.size>200*1024*1024){output.textContent='Choose a video smaller than 200 MB, or read its dimensions in your video player.';return;}
 if(!(file.type.startsWith('video/')||/\.(mp4|webm|mov)$/i.test(file.name))){output.textContent='Choose an MP4, WebM or MOV video.';return;}
 output.textContent='Reading video metadata…';
 video.onloadedmetadata=()=>{
  if(token!==request)return;
  if(!Number.isFinite(video.duration)||!video.videoWidth||!video.videoHeight){output.textContent='The file has no readable finite video metadata. Try a complete MP4 export.';return;}
  metadata={width:video.videoWidth,height:video.videoHeight,duration:video.duration};
  preview.hidden=false;show();
 };
 video.onerror=()=>{if(token===request)output.textContent='This browser cannot read the video. Try a complete MP4 export or check it in your video player.';};
 objectURL=URL.createObjectURL(file);video.src=objectURL;
});
target.addEventListener('change',show);
form.querySelector('button').addEventListener('click',()=>{request++;release();input.value='';output.textContent='Choose a downloaded video.';});
window.addEventListener('pagehide',()=>{request++;release();});
form.hidden=false;
