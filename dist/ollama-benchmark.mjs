import {readOllamaTiming} from './ollama-timing.mjs';

const form = document.querySelector('#ollama-timing');
const input = form.querySelector('textarea');
const status = form.querySelector('output');
const result = form.querySelector('[data-result]');
const sample = document.querySelector('#ollama-timing-sample');
const promptNote = result.querySelector('[data-prompt-note]');
const language = document.documentElement.lang;
const chinese = language.toLowerCase().startsWith('zh');
const decimals = new Intl.NumberFormat(language, {maximumFractionDigits: 2});
const seconds = new Intl.NumberFormat(language, {maximumFractionDigits: 4});
const countUnit = chinese ? '个 token' : 'tokens';
const secondUnit = chinese ? '秒' : 's';
const chineseErrors = {
  'input-size': '请粘贴一条 Ollama 响应，最多 100 万字符。',
  'input-format': '请粘贴 /api/generate 或 /api/chat 的原生 JSON 或 NDJSON 响应。',
  'invalid-counter': 'Ollama 的计数和耗时字段应为非负整数。',
  'expected-objects': '请粘贴 Ollama 原生响应中的 JSON 对象。',
  'api-error': '这次请求返回了 Ollama 错误。请先处理错误，再重新发送请求。',
  incomplete: '请粘贴一条完整响应，最后一条记录应包含 "done": true。',
  'no-counters': '找不到原生计时字段。请用 /api/generate 或 /api/chat 生成文本后重试。',
};

function format(value, formatter, unit) {
  return value === null ? (chinese ? '无可用数据' : 'Unavailable') : `${formatter.format(value)} ${unit}`;
}

function elapsed(value) {
  if (value !== null && value > 0 && value < 0.0001) return `< 0.0001 ${secondUnit}`;
  return format(value, seconds, secondUnit);
}

function calculate() {
  result.hidden = true;
  try {
    const timing = readOllamaTiming(input.value);
    const values = {
      'generation-rate': format(timing.generation.tokensPerSecond, decimals, 'tokens/s'),
      'generation-count': format(timing.generation.count, decimals, countUnit),
      'prompt-rate': format(timing.prompt.tokensPerSecond, decimals, 'tokens/s'),
      'prompt-count': format(timing.prompt.count, decimals, countUnit),
      'prompt-cache-count': format(timing.prompt.cachedCount, decimals, countUnit),
      'generation-time': elapsed(timing.generation.seconds),
      'prompt-time': elapsed(timing.prompt.seconds),
      load: elapsed(timing.loadSeconds),
      total: elapsed(timing.totalSeconds),
    };
    for (const [name, value] of Object.entries(values)) {
      result.querySelector(`[data-value="${name}"]`).textContent = value;
    }
    promptNote.textContent = chinese ? '响应未提供缓存计数，输入速度按报告的 token 数计算。'
      : 'The response has no cache count. The prompt rate uses the reported token count.';
    promptNote.hidden = timing.prompt.cachedCount !== null || timing.prompt.tokensPerSecond === null;
    result.hidden = false;
    status.textContent = chinese ? '已根据完整响应计算。' : 'Calculated from the completed response.';
  } catch (error) {
    status.textContent = chinese ? (chineseErrors[error.code] ?? '无法计算这条响应。') : error.message;
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
