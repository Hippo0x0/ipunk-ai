import {frameFit} from './video-fit-math.mjs';

const form = document.querySelector('#clip-check');
const input = form.querySelector('input');
const target = form.querySelector('select');
const output = form.querySelector('output');
const video = form.querySelector('video');
const overlay = form.querySelector('.crop-overlay');
const preview = form.querySelector('.clip-preview');
const number = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
let selected;

function show() {
  if (!selected) return;
  const {metadata, videoStatus, audioStatus} = selected;
  if (!metadata) {
    output.textContent = `${videoStatus} ${audioStatus}`;
    return;
  }

  const [w, h] = target.value.split(':').map(Number);
  const {width, height, duration} = metadata;
  const fit = frameFit(width, height, w, h);
  const framing = fit.sameRatio
    ? 'The file already matches the selected shape.'
    : `A centered fill keeps ${number.format(fit.retainedPercent)}% of the frame area. Crop region: ${number.format(fit.cropWidth)} × ${number.format(fit.cropHeight)} source pixels. Fit the whole clip on the canvas to preserve the full frame, with space around it.`;
  output.textContent = `${width} × ${height} pixels. ${number.format(duration)} seconds. ${audioStatus} ${framing}`;
  overlay.style.left = `${100 * fit.cropLeft / width}%`;
  overlay.style.top = `${100 * fit.cropTop / height}%`;
  overlay.style.width = `${100 * fit.cropWidth / width}%`;
  overlay.style.height = `${100 * fit.cropHeight / height}%`;
  overlay.hidden = false;
}

function release() {
  const previous = selected;
  selected = undefined;
  video.onloadedmetadata = null;
  video.onerror = null;
  video.pause();
  video.removeAttribute('src');
  video.load();
  if (previous) {
    URL.revokeObjectURL(previous.url);
    previous.container?.dispose();
    previous.container = undefined;
  }
  overlay.hidden = true;
  preview.hidden = true;
}

async function readAudioTracks(file, clip) {
  try {
    const {BlobSource, Input, MP4, QTFF, WEBM} = await import('./vendor/mediabunny/mediabunny-1.66.4.min.mjs');
    if (selected !== clip) return;

    const container = new Input({formats: [MP4, QTFF, WEBM], source: new BlobSource(file)});
    clip.container = container;
    const picture = await container.getPrimaryVideoTrack();
    if (!picture) throw new Error('No video track');
    const tracks = await container.getAudioTracks();
    clip.audioStatus = tracks.length
      ? `${tracks.length} audio ${tracks.length === 1 ? 'track' : 'tracks'}. Play the file to check the sound.`
      : 'No audio track.';
  } catch {
    clip.audioStatus = 'Audio tracks could not be checked.';
  } finally {
    clip.container?.dispose();
    clip.container = undefined;
    if (selected === clip) show();
  }
}

input.addEventListener('change', () => {
  release();
  const file = input.files[0];
  if (!file) {
    output.textContent = 'Choose a downloaded video.';
    return;
  }
  if (file.size > 200 * 1024 * 1024) {
    output.textContent = 'Choose a video smaller than 200 MB, or read its dimensions in your video player.';
    return;
  }
  if (!(file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name))) {
    output.textContent = 'Choose an MP4, WebM or MOV video.';
    return;
  }

  const clip = {
    url: URL.createObjectURL(file),
    audioStatus: 'Checking audio tracks…',
    videoStatus: 'Reading video metadata…',
  };
  selected = clip;
  show();

  video.onloadedmetadata = () => {
    if (selected !== clip || video.currentSrc !== clip.url) return;
    if (!Number.isFinite(video.duration) || !video.videoWidth || !video.videoHeight) {
      clip.videoStatus = 'The file has no readable finite video metadata. Try a complete MP4 export.';
    } else {
      clip.metadata = {width: video.videoWidth, height: video.videoHeight, duration: video.duration};
      preview.hidden = false;
    }
    show();
  };
  video.onerror = () => {
    if (selected !== clip || video.currentSrc !== clip.url) return;
    clip.videoStatus = 'This browser cannot read the video. Try a complete MP4 export or check it in your video player.';
    show();
  };
  video.src = clip.url;
  void readAudioTracks(file, clip);
});

target.addEventListener('change', show);
form.querySelector('button').addEventListener('click', () => {
  release();
  input.value = '';
  output.textContent = 'Choose a downloaded video.';
});
window.addEventListener('pagehide', () => {
  release();
  input.value = '';
  output.textContent = 'Choose a downloaded video.';
});
form.hidden = false;
