const form = document.querySelector('#go-calculator');
const rows = form.querySelector('#model-rows');
const result = form.querySelector('#go-result');
function calculate() {
  let monthlyShare = 0;
  for (const [index, row] of [...rows.children].entries()) {
    const [used, limit] = row.querySelectorAll('input');
    if (index > 0 && used.value === '' && limit.value === '') continue;
    if (used.value === '' || limit.value === '' || !Number.isFinite(used.valueAsNumber) || !Number.isFinite(limit.valueAsNumber) || used.valueAsNumber < 0 || limit.valueAsNumber <= 0) {
      result.textContent = 'Enter both values for model ' + (index + 1) + ', or leave both blank for an optional model.';
      return;
    }
    monthlyShare += 100 * (used.valueAsNumber / limit.valueAsNumber);
  }
  const share = monthlyShare / Number(form.elements.window.value) * 100;
  if (!Number.isFinite(share)) {
    result.textContent = 'Enter smaller usage values.';
    return;
  }
  const readable = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });
  const status = share >= 100 ? 'At or above the selected cap.' : 'Below the selected cap.';
  result.textContent = readable.format(share) + '% of the selected window (' + readable.format(monthlyShare) + '% of the monthly allowance). ' + status;
}
form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
form.addEventListener('input', () => { result.textContent = ''; });
form.querySelector('#add-model').addEventListener('click', () => {
  const row = rows.children[1].cloneNode(true);
  row.firstElementChild.textContent = 'Model ' + (rows.children.length + 1) + ' (optional)';
  for (const input of row.querySelectorAll('input')) input.value = '';
  rows.append(row);
  row.querySelector('input').focus();
});
form.hidden = false;
calculate();
