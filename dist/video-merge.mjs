import {
  ALL_FORMATS, AudioBufferSink, AudioBufferSource, BlobSource, BufferTarget, CanvasSink, CanvasSource,
  Input, Mp4OutputFormat, Output, QUALITY_MEDIUM
} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';

const form = document.querySelector('#merge-tool');
const chooser = form.elements.namedItem('videos');
const list = form.querySelector('ol');
const submit = form.querySelector('button[type=submit]');
const cancel = form.querySelector('[data-cancel]');
const status = form.querySelector('output');
const progress = form.querySelector('progress');
const result = form.querySelector('[data-merge-result]');
const player = result.querySelector('video');
const download = result.querySelector('a');
const sampleRate = 48000;
let files = [], active, resultUrl;

function clear() {
  result.hidden = true;
  download.removeAttribute('href');
  player.pause();
  player.removeAttribute('src');
  player.load();
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = undefined;
}

function controls(busy) {
  chooser.disabled = busy;
  submit.disabled = busy || files.length < 2 || files.length > 8;
  cancel.hidden = progress.hidden = !busy;
  cancel.disabled = !busy;
  for (const button of list.querySelectorAll('button')) {
    button.disabled = busy || button.dataset.atEdge === 'true';
  }
}

function renderList() {
  list.replaceChildren();
  for (const [index, file] of files.entries()) {
    const row = document.createElement('li');
    row.tabIndex = -1;
    const name = document.createElement('span');
    name.textContent = file.name;
    const actions = document.createElement('div');
    actions.className = 'merge-order';
    for (const [label, step] of [['Up', -1], ['Down', 1]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', 'Move ' + file.name + ' ' + label.toLowerCase());
      const other = index + step;
      button.dataset.atEdge = String(other < 0 || other >= files.length);
      button.addEventListener('click', () => {
        [files[index], files[other]] = [files[other], files[index]];
        clear();
        renderList();
        list.children[other].focus();
      });
      actions.append(button);
    }
    row.append(name, actions);
    list.append(row);
  }
  list.hidden = !files.length;
  controls(Boolean(active));
}

chooser.addEventListener('change', () => {
  clear();
  files = Array.from(chooser.files);
  renderList();
  status.textContent = files.length > 8 ? 'Choose at most eight clips.' : '';
});

function stop() {
  if (!active) return;
  active.cancelled = true;
  cancel.disabled = true;
  status.textContent = 'Cancelling…';
  active.output?.cancel().catch(() => {});
}

function checkActive(job) {
  if (job.cancelled || job.failed) throw new Error('Cancelled.');
}

async function inspect(file, job) {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  job.inputs.push(input);
  const tracks = await input.getTracks();
  const videos = tracks.filter(track => track.type === 'video');
  const audios = tracks.filter(track => track.type === 'audio');
  if (videos.length !== 1 || audios.length > 1 || tracks.length !== videos.length + audios.length) {
    throw new Error('Each clip needs one video track and at most one audio track. Other tracks require a desktop editor.');
  }
  const [video] = videos;
  const [audio] = audios;
  if (!await video.canDecode() || (audio && !await audio.canDecode())) {
    throw new Error('This browser cannot decode every track in ' + file.name + '.');
  }
  const [first, end, width, height] = await Promise.all([
    video.getFirstTimestamp(), video.computeDuration(), video.getDisplayWidth(), video.getDisplayHeight()
  ]);
  const samples = Math.round((end - first) * sampleRate);
  if (!(Number.isSafeInteger(samples) && samples > 0 && width > 0 && height > 0)) {
    throw new Error('A clip has no usable video duration or dimensions.');
  }
  return { video, audio, first, samples, width, height };
}

async function renderAudio(clip, job) {
  if (!clip.audio) return new AudioBuffer({ length: clip.samples, sampleRate, numberOfChannels: 2 });
  const audio = new OfflineAudioContext(2, clip.samples, sampleRate);
  const end = clip.samples / sampleRate;
  for await (const entry of new AudioBufferSink(clip.audio).buffers()) {
    checkActive(job);
    const at = entry.timestamp - clip.first;
    if (at >= end) break;
    if (at + entry.buffer.duration <= 0) continue;
    const source = audio.createBufferSource();
    source.buffer = entry.buffer;
    source.connect(audio.destination);
    source.start(Math.max(0, at), Math.max(0, -at));
  }
  return audio.startRendering();
}

async function writeVideo(clips, job, source, canvas, totalSamples) {
  const context = canvas.getContext('2d', { alpha: false });
  let offset = 0;
  for (const clip of clips) {
    const sink = new CanvasSink(clip.video, { width: canvas.width, height: canvas.height, fit: 'contain' });
    const seconds = clip.samples / sampleRate;
    let started = false;
    for await (const frame of sink.canvases()) {
      checkActive(job);
      const time = Math.max(0, frame.timestamp - clip.first);
      const duration = Math.min(frame.duration, seconds - time);
      if (duration <= 0) continue;
      context.drawImage(frame.canvas, 0, 0);
      await source.add(offset + time, duration, { keyFrame: !started });
      started = true;
      progress.value = Math.min(.99, (offset + time) * sampleRate / totalSamples);
    }
    if (!started) throw new Error('A clip had no frames to merge.');
    offset += seconds;
  }
  source.close();
}

async function writeAudio(clips, job, source) {
  for (const clip of clips) {
    checkActive(job);
    const buffer = await renderAudio(clip, job);
    checkActive(job);
    await source.add(buffer);
  }
  source.close();
}

cancel.addEventListener('click', stop);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (active || submit.disabled) return;
  clear();
  if (files.reduce((total, file) => total + file.size, 0) > 250 * 1024 * 1024) {
    status.textContent = 'Choose clips that total up to 250 MiB.';
    return;
  }
  const job = { cancelled: false, failed: false, inputs: [] };
  active = job;
  controls(true);
  progress.value = 0;
  status.textContent = 'Reading clips…';
  let tasks = [];

  try {
    const clips = [];
    for (const file of files) {
      checkActive(job);
      clips.push(await inspect(file, job));
    }
    const samples = clips.reduce((total, clip) => total + clip.samples, 0);
    if (samples > 120 * sampleRate) throw new Error('Choose clips with a combined duration of up to two minutes.');
    checkActive(job);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1280 / Math.max(clips[0].width, clips[0].height));
    canvas.width = Math.max(2, Math.round(clips[0].width * scale / 2) * 2);
    canvas.height = Math.max(2, Math.round(clips[0].height * scale / 2) * 2);
    const target = new BufferTarget();
    job.output = new Output({ target, format: new Mp4OutputFormat({ fastStart: 'in-memory' }) });
    const video = new CanvasSource(canvas, { codec: 'avc', bitrate: QUALITY_MEDIUM });
    const audio = clips.some(clip => clip.audio) ? new AudioBufferSource({ codec: 'aac', bitrate: 128000 }) : null;
    job.output.addVideoTrack(video);
    if (audio) job.output.addAudioTrack(audio);
    await job.output.start();
    checkActive(job);
    status.textContent = 'Merging clips…';

    tasks = [writeVideo(clips, job, video, canvas, samples)];
    if (audio) tasks.push(writeAudio(clips, job, audio));
    await Promise.all(tasks);
    checkActive(job);
    await job.output.finalize();
    checkActive(job);

    const blob = new Blob([target.buffer], { type: 'video/mp4' });
    const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
    let duration;
    try {
      const [videoTracks, audioTracks] = await Promise.all([check.getVideoTracks(), check.getAudioTracks()]);
      duration = await check.computeDuration();
      if (videoTracks.length !== 1 || audioTracks.length !== Number(Boolean(audio)) ||
          !Number.isFinite(duration) || duration <= 0 || Math.abs(duration - samples / sampleRate) > .15) {
        throw new Error('The merged file did not pass its track or duration check.');
      }
    } finally { check.dispose(); }
    checkActive(job);

    resultUrl = URL.createObjectURL(blob);
    player.src = resultUrl;
    download.href = resultUrl;
    download.download = 'merged-video.mp4';
    result.hidden = false;
    status.textContent = duration.toFixed(2) + ' s · ' + canvas.width + ' × ' + canvas.height + ' px · ' +
      (audio ? 'Audio included.' : 'No audio tracks in the source clips.');
  } catch (error) {
    job.failed = true;
    await job.output?.cancel().catch(() => {});
    await Promise.allSettled(tasks);
    status.textContent = job.cancelled ? 'Cancelled.' :
      (error instanceof Error ? error.message : 'Could not merge these clips.');
  } finally {
    for (const input of job.inputs) input.dispose();
    active = undefined;
    controls(false);
  }
});

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  stop();
  clear();
});
form.hidden = false;
