import { videoBudget } from './video-budget-math.mjs';
const form = document.querySelector('#video-budget');
const output = form.querySelector('output');
const presets = {runway:[625,60],firefly:[2000,100],luma:[10000,100]};
const number = new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
function calculate() {
  try {
    const values = Object.fromEntries(['credits','cost','clips','attempts'].map(k=>[k,form.elements[k].value === '' ? NaN : form.elements[k].valueAsNumber]));
    const r = videoBudget(values);
    output.textContent = number.format(r.required) + ' credits needed. ' + (r.fits ? 'Within the entered allowance.' : number.format(r.shortfall) + ' credits short.') + ' The allowance budgets ' + number.format(r.capacity) + ' finished clips at this attempt count. Usable results are not guaranteed.';
  } catch (error) { output.textContent = error.message; }
}
form.addEventListener('submit',event=>{event.preventDefault();calculate();});
form.elements.preset.addEventListener('change',()=>{
  const preset=presets[form.elements.preset.value];
  if(preset) {form.elements.credits.value=preset[0];form.elements.cost.value=preset[1];}
  calculate();
});
for(const name of ['credits','cost']) form.elements[name].addEventListener('input',()=>{form.elements.preset.value='custom';output.textContent='';});
for(const name of ['clips','attempts']) form.elements[name].addEventListener('input',()=>{output.textContent='';});
form.hidden=false;
calculate();
