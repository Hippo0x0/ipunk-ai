import {summarizeOpenCodeUsage} from './opencode-usage-core.mjs';

const form = document.querySelector('#usage-reader');
const file = form.querySelector('input');
const result = form.querySelector('output');
const numbers = new Intl.NumberFormat('en-US');
let selection = 0;

file.addEventListener('change', async () => {
  const request = ++selection;
  const selected = file.files[0];
  if (!selected) {
    result.textContent = 'Choose an OpenCode JSON lines log.';
    return;
  }
  if (selected.size > 10 * 1024 * 1024) {
    result.textContent = 'Choose a log of 10 MiB or less.';
    return;
  }

  result.textContent = 'Reading log…';
  try {
    const stats = summarizeOpenCodeUsage(await selected.text());
    if (request !== selection) return;
    const {steps, sessions, totals, incomplete, unrecognized, duplicates} = stats;
    const notes = [];
    if (incomplete) notes.push(`${numbers.format(incomplete)} incomplete step records excluded.`);
    if (unrecognized) notes.push(`${numbers.format(unrecognized)} unreadable lines skipped.`);
    if (duplicates) notes.push(`${numbers.format(duplicates)} duplicate steps skipped.`);
    if (!steps) {
      result.textContent = ['No complete step records found. Choose the log from opencode run --format json.', ...notes].join(' ');
      return;
    }
    const summary = `${numbers.format(steps)} steps across ${numbers.format(sessions)} identified sessions. ` +
      `Input: ${numbers.format(totals.input)}. Output: ${numbers.format(totals.output)}. ` +
      `Reasoning: ${numbers.format(totals.reasoning)}. Cache read: ${numbers.format(totals.cacheRead)}. Cache write: ${numbers.format(totals.cacheWrite)}.`;
    result.textContent = [summary, ...notes].join(' ');
  } catch {
    if (request === selection) result.textContent = 'This log could not be read.';
  }
});

form.querySelector('button').addEventListener('click', () => {
  selection++;
  file.value = '';
  result.textContent = 'Choose an OpenCode JSON lines log.';
});
form.hidden = false;
