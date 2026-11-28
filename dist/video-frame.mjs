import { ALL_FORMATS, BlobSource, CanvasSink, Input } from './vendor/mediabunny/mediabunny-1.66.4.min.mjs';

const form = document.querySelector('#frame-tool');
const fileField = form.elements.namedItem('video');
const seconds = form.elements.namedItem('seconds');
const timeline = form.elements.namedItem('timeline');
const controls = form.querySelector('fieldset');
const status = form.querySelector('output');
const result = form.querySelector('[data-frame-result]');
const preview = result.querySelector('img');
const download = result.querySelector('a');
let current, outputUrl;

const formatTime = time => time.toFixed(3);
const describeVideo = ({ width, height, duration }) => width + ' × ' + height + ' px · ' + formatTime(duration) + ' s';
const encodePng = canvas => typeof canvas.convertToBlob === 'function'
  ? canvas.convertToBlob({ type: 'image/png' })
  : new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('PNG encoding failed.')),
    'image/png'
  ));

function clearResult() {
  result.hidden = true;
  preview.removeAttribute('src');
  download.removeAttribute('href');
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = undefined;
}

function releaseInput() {
  current?.input?.dispose();
  current = undefined;
  controls.hidden = true;
  controls.disabled = true;
  clearResult();
}

fileField.addEventListener('change', async () => {
  releaseInput();
  const file = fileField.files[0];
  if (!file) {
    status.textContent = 'Choose a video to start.';
    return;
  }

  const session = { file };
  current = session;
  status.textContent = 'Reading video…';
  try {
    session.input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const track = await session.input.getPrimaryVideoTrack();
    if (!track) throw new Error('This file has no video track.');
    if (!await track.canDecode()) throw new Error('This browser cannot decode the video track.');

    const [first, end, width, height] = await Promise.all([
      track.getFirstTimestamp(), track.computeDuration(),
      track.getDisplayWidth(), track.getDisplayHeight()
    ]);
    if (current !== session) return;
    const duration = end - first;
    if (!(Number.isFinite(duration) && duration > 0 && width > 0 && height > 0)) {
      throw new Error('The video has no readable duration or frame size.');
    }

    Object.assign(session, { first, duration, width, height, sink: new CanvasSink(track) });
    seconds.max = duration;
    timeline.max = duration;
    seconds.value = timeline.value = '0';
    controls.hidden = false;
    controls.disabled = false;
    status.textContent = describeVideo(session);
  } catch (error) {
    if (current !== session) return;
    releaseInput();
    status.textContent = error instanceof Error ? error.message : 'Could not read this video.';
  }
});

timeline.addEventListener('input', () => {
  seconds.value = formatTime(timeline.valueAsNumber);
  if (seconds.valueAsNumber > current.duration) seconds.value = current.duration;
  clearResult();
  status.textContent = describeVideo(current);
});
seconds.addEventListener('input', () => {
  if (Number.isFinite(seconds.valueAsNumber)) timeline.value = seconds.value;
  clearResult();
  status.textContent = describeVideo(current);
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const session = current;
  if (!session?.sink || controls.disabled) return;
  const useLast = event.submitter?.hasAttribute('data-last-frame');
  const time = seconds.valueAsNumber;
  if (!useLast && (!Number.isFinite(time) || time < 0 || time > session.duration)) {
    status.textContent = 'Choose a time within the video.';
    return;
  }

  controls.disabled = true;
  clearResult();
  status.textContent = 'Extracting frame…';
  try {
    const target = useLast ? Infinity : session.first + time;
    const frame = await session.sink.getCanvas(target);
    if (!frame) throw new Error('No frame was decoded at that time.');
    const blob = await encodePng(frame.canvas);
    if (current !== session) return;
    const selectedTime = Math.max(0, frame.timestamp - session.first);
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    download.href = outputUrl;
    download.download = session.file.name.replace(/\.[^.]+$/, '') + '-' + formatTime(selectedTime) + 's.png';
    result.hidden = false;
    status.textContent = 'Frame at ' + formatTime(selectedTime) + ' s · ' + frame.canvas.width + ' × ' + frame.canvas.height + ' px';
  } catch (error) {
    if (current !== session) return;
    status.textContent = error instanceof Error ? error.message : 'Could not extract a frame.';
  } finally {
    if (current === session) controls.disabled = false;
  }
});

window.addEventListener('pagehide', event => {
  if (!event.persisted) releaseInput();
});
form.hidden = false;
