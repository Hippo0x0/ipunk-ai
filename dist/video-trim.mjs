import { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';

const form = document.querySelector('#trim-tool');
const fileField = form.elements.namedItem('video');
const startField = form.elements.namedItem('start');
const endField = form.elements.namedItem('end');
const controls = form.querySelector('fieldset');
const source = form.querySelector('[data-source]');
const status = form.querySelector('output');
const progress = form.querySelector('progress');
const cancel = form.querySelector('[data-cancel]');
const result = form.querySelector('[data-trim-result]');
const player = result.querySelector('video');
const download = result.querySelector('a');
const formatSeconds = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });
let current, active, sourceUrl, resultUrl;

function resetVideo(video) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

function clearResult() {
  result.hidden = true;
  download.removeAttribute('href');
  resetVideo(player);
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = undefined;
  progress.hidden = true;
  progress.value = 0;
}

function releaseInput() {
  current?.input?.dispose();
  current = undefined;
  controls.hidden = true;
  controls.disabled = true;
  source.hidden = true;
  resetVideo(source);
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = undefined;
  clearResult();
}

function setBusy(busy) {
  fileField.disabled = busy;
  controls.disabled = busy || !current;
  cancel.hidden = !busy;
  cancel.disabled = !busy;
}

function stop() {
  if (!active) return;
  active.cancelled = true;
  cancel.disabled = true;
  status.textContent = 'Cancelling…';
  active.conversion?.cancel().catch(() => {});
}

fileField.addEventListener('change', async () => {
  releaseInput();
  const file = fileField.files[0];
  if (!file) {
    status.textContent = 'Choose a video to start.';
    return;
  }
  if (file.size > 250 * 1024 * 1024) {
    status.textContent = 'Choose a file up to 250 MiB.';
    return;
  }

  const session = { file };
  current = session;
  status.textContent = 'Reading video…';
  try {
    session.input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const [video, audio] = await Promise.all([session.input.getVideoTracks(), session.input.getAudioTracks()]);
    if (video.length !== 1 || audio.length > 1) {
      throw new Error('Choose a file with one video track and at most one audio track.');
    }
    const tracks = [...video, ...audio];
    const [first, end] = await Promise.all([session.input.getFirstTimestamp(tracks), session.input.computeDuration(tracks)]);
    if (current !== session) return;
    const duration = end - first;
    if (!(Number.isFinite(duration) && duration > 0)) throw new Error('The source has no readable duration.');
    Object.assign(session, { first, duration, audioCount: audio.length });
    startField.value = '0';
    endField.value = duration;
    startField.max = endField.max = duration;
    controls.hidden = false;
    controls.disabled = false;
    sourceUrl = URL.createObjectURL(file);
    source.src = sourceUrl;
    status.textContent = 'Source length: ' + formatSeconds.format(duration) + ' s.';
  } catch (error) {
    if (current !== session) return;
    releaseInput();
    status.textContent = error instanceof Error ? error.message : 'Could not read this video.';
  }
});

source.addEventListener('loadedmetadata', () => {
  source.hidden = !sourceUrl;
});
source.addEventListener('error', () => {
  source.hidden = true;
});

for (const field of [startField, endField]) field.addEventListener('input', () => {
  clearResult();
  status.textContent = 'Source length: ' + formatSeconds.format(current.duration) + ' s.';
});
cancel.addEventListener('click', stop);

form.addEventListener('submit', async event => {
  event.preventDefault();
  const session = current;
  if (!session || active || controls.hidden) return;
  const start = startField.valueAsNumber;
  const end = endField.valueAsNumber;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > session.duration || start >= end) {
    status.textContent = 'Choose an end time after the start and within the video.';
    return;
  }
  clearResult();
  source.pause();
  const operation = { cancelled: false };
  active = operation;
  setBusy(true);
  progress.hidden = false;
  status.textContent = 'Preparing MP4…';

  try {
    const target = new BufferTarget();
    const output = new Output({ target, format: new Mp4OutputFormat({ fastStart: 'in-memory' }) });
    operation.conversion = await Conversion.init({
      input: session.input,
      output,
      trim: { start: session.first + start, end: session.first + end },
      video: { codec: 'avc', forceTranscode: true },
      audio: { codec: 'aac' },
      showWarnings: false
    });
    if (operation.cancelled) throw new Error('Cancelled.');
    if (!operation.conversion.isValid || operation.conversion.discardedTracks.length) {
      throw new Error('This browser cannot export all tracks to MP4. Try a different browser or source file.');
    }
    operation.conversion.onProgress = value => {
      progress.value = value;
      if (!operation.cancelled) status.textContent = 'Trimming… ' + Math.round(value * 100) + '%';
    };
    await operation.conversion.execute();
    if (operation.cancelled) throw new Error('Cancelled.');

    const blob = new Blob([target.buffer], { type: 'video/mp4' });
    const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
    let duration;
    try {
      const [video, audio] = await Promise.all([check.getVideoTracks(), check.getAudioTracks()]);
      if (video.length !== 1 || audio.length !== session.audioCount) {
        throw new Error('The trimmed file did not pass the track check.');
      }
      duration = await check.computeDuration();
      if (!(Number.isFinite(duration) && duration > 0)) throw new Error('The selection produced no playable video.');
    } finally {
      check.dispose();
    }
    if (operation.cancelled) throw new Error('Cancelled.');

    resultUrl = URL.createObjectURL(blob);
    player.src = resultUrl;
    download.href = resultUrl;
    download.download = session.file.name.replace(/\.[^.]+$/, '') + '-trimmed.mp4';
    result.hidden = false;
    status.textContent = formatSeconds.format(duration) + ' s · ' +
      (session.audioCount ? 'Audio track included.' : 'The source has no audio track.');
  } catch (error) {
    status.textContent = operation.cancelled ? 'Cancelled.' :
      (error instanceof Error ? error.message : 'Could not trim this video.');
  } finally {
    active = undefined;
    progress.hidden = true;
    setBusy(false);
  }
});

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  stop();
  releaseInput();
});
form.hidden = false;
