import { buildSoraMigrationBrief } from './sora-brief-core.mjs';

const form = document.querySelector('#sora-brief');
const output = document.querySelector('[data-brief-output]');
const status = document.querySelector('[data-sora-brief-status]');
const download = document.querySelector('[data-sora-brief-download]');

form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    const values = Object.fromEntries(new FormData(form));
    output.value = buildSoraMigrationBrief({ ...values, seconds: form.elements.seconds.valueAsNumber });
    download.disabled = false;
    status.textContent = 'Brief ready.';
  } catch (error) {
    output.value = '';
    download.disabled = true;
    status.textContent = error.message;
  }
});

form.addEventListener('input', () => {
  output.value = '';
  download.disabled = true;
  status.textContent = '';
});

download.addEventListener('click', () => {
  if (!output.value) return;
  const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'video-replacement-brief.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

form.hidden = false;
