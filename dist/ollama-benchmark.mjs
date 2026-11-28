import {readOllamaTiming} from './ollama-timing.mjs';

const form = document.querySelector('#ollama-timing');
const input = form.querySelector('textarea');
const status = form.querySelector('output');
const result = form.querySelector('[data-result]');
const sample = document.querySelector('#ollama-timing-sample');
const decimals = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
const seconds = new Intl.NumberFormat('en-US', {maximumFractionDigits: 4});

function format(value, formatter, unit) {
  return value === null ? 'Unavailable' : `${formatter.format(value)} ${unit}`;
}

function elapsed(value) {
  if (value !== null && value > 0 && value < 0.0001) return '< 0.0001 s';
  return format(value, seconds, 's');
}

function calculate() {
  result.hidden = true;
  try {
    const timing = readOllamaTiming(input.value);
    const values = {
      'generation-rate': format(timing.generation.tokensPerSecond, decimals, 'tokens/s'),
      'generation-count': format(timing.generation.count, decimals, 'tokens'),
      'prompt-rate': format(timing.prompt.tokensPerSecond, decimals, 'tokens/s'),
      'prompt-count': format(timing.prompt.count, decimals, 'tokens'),
      'generation-time': elapsed(timing.generation.seconds),
      'prompt-time': elapsed(timing.prompt.seconds),
      load: elapsed(timing.loadSeconds),
      total: elapsed(timing.totalSeconds),
    };
    for (const [name, value] of Object.entries(values)) {
      result.querySelector(`[data-value="${name}"]`).textContent = value;
    }
    result.hidden = false;
    status.textContent = 'Calculated from the completed response.';
  } catch (error) {
    status.textContent = error.message;
  }
}

function clearResult() {
  result.hidden = true;
  status.textContent = '';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
form.querySelector('[data-sample]').addEventListener('click', () => {
  input.value = sample.content.textContent.trim();
  calculate();
});
form.addEventListener('reset', clearResult);
input.addEventListener('input', clearResult);
window.addEventListener('pagehide', () => {
  form.reset();
});
form.hidden = false;
