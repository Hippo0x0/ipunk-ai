import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, MP4, Mp4OutputFormat, Output, QTFF, WEBM, WebMOutputFormat
} from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';

const form = document.querySelector('#mute-tool');
const fileField = form.elements.namedItem('video');
const submit = form.querySelector('button[type=submit]');
const cancel = form.querySelector('[data-cancel]');
const progress = form.querySelector('progress');
const status = form.querySelector('output');
const result = form.querySelector('[data-mute-result]');
const player = result.querySelector('video');
const download = result.querySelector('a');
let active, resultUrl;

function clear() {
  result.hidden = true;
  download.removeAttribute('href');
  player.pause();
  player.removeAttribute('src');
  player.load();
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = undefined;
}

function setBusy(busy) {
  fileField.disabled = busy;
  submit.disabled = busy || !fileField.files.length;
  cancel.hidden = !busy;
  cancel.disabled = !busy;
  progress.hidden = !busy;
  if (busy) progress.value = 0;
}

function requestCancel() {
  if (!active) return;
  active.cancelled = true;
  cancel.disabled = true;
  status.textContent = 'Cancelling…';
  active.conversion?.cancel().catch(() => {});
}

fileField.addEventListener('change', () => {
  clear();
  setBusy(false);
  status.textContent = fileField.files.length ? '' : 'Choose a video to start.';
});
cancel.addEventListener('click', requestCancel);

form.addEventListener('submit', async event => {
  event.preventDefault();
  const file = fileField.files[0];
  if (!file || active) return;
  clear();
  if (file.size > 250 * 1024 * 1024) {
    status.textContent = 'Choose a video up to 250 MiB.';
    return;
  }
  const operation = { cancelled: false };
  active = operation;
  setBusy(true);
  status.textContent = 'Reading tracks…';
  let input;

  try {
    input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const [format, tracks] = await Promise.all([input.getFormat(), input.getTracks()]);
    if (![MP4, QTFF, WEBM].includes(format)) throw new Error('Choose an MP4, MOV or WebM file.');
    const video = tracks.filter(track => track.type === 'video');
    const audioCount = tracks.filter(track => track.type === 'audio').length;
    if (video.length !== 1 || tracks.length !== video.length + audioCount) {
      throw new Error('Use a file with one video track and optional audio tracks. Other track types need a desktop editor.');
    }
    if (!audioCount) {
      status.textContent = 'This video already has no audio track.';
      return;
    }

    const isWebm = format === WEBM;
    const extension = isWebm ? 'webm' : 'mp4';
    const target = new BufferTarget();
    const output = new Output({
      target, format: isWebm ? new WebMOutputFormat() : new Mp4OutputFormat({ fastStart: 'in-memory' })
    });
    operation.conversion = await Conversion.init({
      input, output, audio: { discard: true }, copy: { mode: 'forced' }, showWarnings: false
    });
    if (operation.cancelled) throw new Error('Cancelled.');
    const discarded = operation.conversion.discardedTracks;
    if (!operation.conversion.isValid || discarded.length !== audioCount ||
        discarded.some(entry => entry.reason !== 'discarded_by_user' || entry.track.type !== 'audio')) {
      throw new Error('This video track cannot be copied into the output format without re-encoding.');
    }

    operation.conversion.onProgress = value => {
      progress.value = value;
      if (!operation.cancelled) status.textContent = 'Copying video… ' + Math.round(value * 100) + '%';
    };
    await operation.conversion.execute();
    if (operation.cancelled) throw new Error('Cancelled.');
    const blob = new Blob([target.buffer], { type: 'video/' + extension });
    const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
    let duration;
    try {
      const outputTracks = await check.getTracks();
      const outputTrack = outputTracks[0];
      if (outputTracks.length !== 1 || outputTrack.type !== 'video' ||
          await outputTrack.getCodec() !== await video[0].getCodec()) {
        throw new Error('The result still had an audio track or did not preserve the video codec.');
      }
      duration = await check.computeDuration() - await check.getFirstTimestamp();
      if (!(Number.isFinite(duration) && duration > 0)) throw new Error('The result has no readable video duration.');
    } finally {
      check.dispose();
    }
    if (operation.cancelled) throw new Error('Cancelled.');

    resultUrl = URL.createObjectURL(blob);
    player.src = resultUrl;
    download.href = resultUrl;
    download.download = file.name.replace(/\.[^.]+$/, '') + '-silent.' + extension;
    download.textContent = 'Download silent ' + (isWebm ? 'WebM' : 'MP4');
    result.hidden = false;
    status.textContent = audioCount + (audioCount === 1 ? ' audio track removed' : ' audio tracks removed') +
      ' · ' + duration.toFixed(2) + ' s.';
  } catch (error) {
    status.textContent = operation.cancelled ? 'Cancelled.' :
      (error instanceof Error ? error.message : 'Could not remove the audio.');
  } finally {
    input?.dispose();
    active = undefined;
    setBusy(false);
  }
});

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  requestCancel();
  clear();
});
form.hidden = false;
