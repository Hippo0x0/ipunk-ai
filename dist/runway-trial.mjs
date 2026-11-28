import { runwayTrialBudget } from './runway-trial-math.mjs';

const form = document.querySelector('#runway-trial');
const output = form.querySelector('output');
const format = new Intl.NumberFormat('en-US');
const plural = (value, singular, multiple) => value === 1 ? singular : multiple;

function displayBudget() {
  const values = Object.fromEntries(['balance', 'shortAttempts', 'longAttempts', 'shortCost', 'longCost'].map(
    name => [name, form.elements.namedItem(name).valueAsNumber],
  ));
  try {
    const result = runwayTrialBudget(values);
    const split = `${format.format(result.required)} credits needed (${format.format(result.shortCredits)} for 5-second runs and ${format.format(result.longCredits)} for 10-second runs).`;
    if (result.shortfall > 0) {
      output.textContent = `${split} ${format.format(result.shortfall)} credits short.`;
      return;
    }
    const short = result.extraShortAttempts;
    const long = result.extraLongAttempts;
    output.textContent = `${split} ${format.format(result.remaining)} credits left, enough for ${format.format(short)} extra 5-second ${plural(short, 'run', 'runs')} or ${format.format(long)} extra 10-second ${plural(long, 'run', 'runs')}.`;
  } catch (error) {
    output.textContent = error.message;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  displayBudget();
});
form.addEventListener('input', () => { output.textContent = ''; });
form.hidden = false;
displayBudget();
