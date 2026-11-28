import { estimateMemory, modelPresets } from './ollama-memory-core.mjs';

const form = document.querySelector('[data-memory-form]');
const panel = form.closest('[data-memory-app]');
const custom = form.querySelector('[data-memory-custom]');
const result = panel.querySelector('[data-memory-result]');
const status = panel.querySelector('[data-memory-status]');
const chinese = document.documentElement.lang === 'zh-CN';
const format = new Intl.NumberFormat(chinese ? 'zh-CN' : 'en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fields = new Map([...result.querySelectorAll('[data-memory-value]')].map(element => [element.dataset.memoryValue, element]));

function updatePreset() {
  const preset = modelPresets[form.elements.model.value];
  custom.hidden = Boolean(preset);
  custom.disabled = Boolean(preset);
  form.elements.context.max = preset?.maxContext ?? 262144;
}

function calculate() {
  const value = name => form.elements[name].valueAsNumber;
  const model = modelPresets[form.elements.model.value] ?? {
    weightBytes: Math.round(value('weightGB') * 1e9),
    layers: value('layers'),
    kvHeads: value('kvHeads'),
    headSize: value('headSize'),
    maxContext: 262144
  };
  try {
    const estimate = estimateMemory({
      model,
      context: value('context'),
      installed: value('installed'),
      systemReserve: value('systemReserve'),
      runtimeReserve: value('runtimeReserve')
    });
    for (const [name, element] of fields) {
      const amount = name === 'remaining' ? Math.abs(estimate.remaining) : estimate[name];
      element.textContent = format.format(amount) + ' GiB';
    }
    result.querySelector('[data-memory-balance]').textContent = estimate.remaining < 0
      ? (chinese ? '超出预算' : 'Over budget')
      : (chinese ? '预算余量' : 'Budget left');
    result.hidden = false;
    status.textContent = '';
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    result.hidden = true;
    status.textContent = error.message === 'budget'
      ? (chinese ? '系统预留应小于总内存，预留值不能为负。' : 'System reserve must be below total memory. Reserve values must be zero or more.')
      : (chinese ? '请检查模型参数与上下文设置。' : 'Check the model dimensions and context setting.');
  }
}

form.elements.model.addEventListener('change', updatePreset);
form.addEventListener('input', () => {
  result.hidden = true;
  status.textContent = '';
});
form.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
updatePreset();
calculate();
panel.hidden = false;
