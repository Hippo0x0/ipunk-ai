const form = document.querySelector('#video-audio-check');
const fileInput = form.querySelector('input[type=file]');
const offset = form.querySelector('input[type=number]');
const output = form.querySelector('output');
const number = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
const seconds = new Intl.NumberFormat('en-US', {maximumFractionDigits: 3});
let current;

function reset() {
  current?.abort();
  current = undefined;
  output.textContent = 'Choose an MP4, MOV or WebM video.';
}

function describe(result) {
  switch (result.status) {
    case 'not-video':
      return 'No video track found. Choose an MP4, MOV or WebM video.';
    case 'track-count':
      return result.tracks === 0
        ? 'No audio track found.'
        : `${result.tracks} audio tracks found. Select the individual track in a desktop editor and check it there.`;
    case 'no-samples':
      return 'One audio track found, but there are no decoded samples in this time range. Try an earlier start time or a different export.';
    case 'unsupported':
      return 'One audio track found, but this browser cannot decode it. Check it in a desktop video player or try another browser.';
    case 'checked': {
      const range = `${seconds.format(result.start)}–${seconds.format(result.end)} seconds`;
      const dbfs = 20 * Math.log10(result.peak);
      let level = `Audio signal found. Peak ${number.format(dbfs)} dBFS.`;
      if (result.peak === 0) level = 'The decoded samples were all zero.';
      else if (dbfs < -120) level = 'Very low nonzero signal. Peak below −120 dBFS.';
      return `One audio track. Checked ${range}. ${level}${result.partial ? ' The rest of the track was outside this check.' : ''}`;
    }
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  reset();
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 200 * 1024 * 1024) {
    output.textContent = 'Choose a video up to 200 MiB, or check a shorter export.';
    return;
  }
  const start = offset.valueAsNumber;
  if (!Number.isFinite(start) || start < 0 || start > Number.MAX_SAFE_INTEGER - 60) {
    output.textContent = 'Enter a start time in seconds, 0 or higher.';
    return;
  }

  const run = new AbortController();
  current = run;
  output.textContent = 'Checking audio…';
  try {
    const {checkVideoAudio} = await import('./video-audio-signal.mjs');
    const result = await checkVideoAudio(file, start, run.signal);
    if (current === run) output.textContent = describe(result);
  } catch {
    if (current === run) output.textContent = 'The audio check could not finish. Try a complete file, a shorter export or a desktop player.';
  } finally {
    if (current === run) current = undefined;
  }
});

fileInput.addEventListener('change', reset);
offset.addEventListener('input', reset);
form.addEventListener('reset', reset);
window.addEventListener('pagehide', () => {
  reset();
  fileInput.value = '';
  offset.value = '0';
});
form.hidden = false;
