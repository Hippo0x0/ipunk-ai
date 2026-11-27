const alternatives = {
  research: {name:'Perplexity', path:'/en/guides/perplexity-vs-chatgpt/', reason:'Try the same source-based question in Perplexity, then open each cited source. Our retained exercise supported seven required facts in both Perplexity and ChatGPT; it did not establish an accuracy winner.', evidence:'Seven facts, first answers and source checks', prompt:'/evidence/research-comparison/prompt.txt'},
  writing: {name:'Claude', path:'/en/guides/claude-vs-chatgpt/', reason:'Try Claude on a supplied document, a small table and a constrained notice. In our one retained batch both assistants got the arithmetic right; Claude needed one follow-up to return JSON without introductory prose.', evidence:'Original replies, correction and a bounded checker', prompt:'/evidence/assistant-task/prompt.txt'},
  images: {name:'Gemini', path:'/en/guides/gemini-vs-chatgpt/', reason:'Try Gemini with a brief you can check visually. Both Gemini and ChatGPT reproduced the requested count and lettering in our two retained image briefs. Your account access and editing task still need a separate trial.', evidence:'Four original images from two identical briefs', prompt:'/evidence/gemini-chatgpt-images/mugs-prompt.txt'},
  coding: {name:'A bounded coding-agent trial', path:'/en/guides/claude-code-vs-cursor/', reason:'Run a small repair task in a separate repository copy. Keep the actual model, tool version, first patch and unchanged tests. A passing fixture is not a general product ranking.', evidence:'Claude Code and Cursor: a repeatable repository task', prompt:'/evidence/coding-trial/prompt.txt'},
  local: {name:'A local API and restart check', path:'/en/guides/ollama-vs-lm-studio/', reason:'Verify the actual model identifier, ordinary response and finished stream before moving a client between local runtimes. The retained same-GGUF exercise covers one M3 Pro and a small model, not a general speed or privacy guarantee.', evidence:'Same-GGUF Ollama and LM Studio API checks', prompt:null}
};
export function chooseAlternative(task){
  if(!Object.hasOwn(alternatives,task))throw new Error('Choose a listed task.');
  return {...alternatives[task]};
}
function field(value,max,name){
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`${name} must contain 1–${max} characters.`);
  return value.trim();
}
export function buildImageBrief({kind,subject,words}){
  if(!['objects','poster','edit'].includes(kind))throw new Error('Choose a listed image task.');
  const description=field(subject,500,'Description');
  const lettering=typeof words==='string'?words.trim():'';
  if(lettering.length>300)throw new Error('Required text must be at most 300 characters.');
  const lines=lettering?lettering.split(/\r?\n/):[];
  const literal=lines.length?`Render exactly these ${lines.length} line(s), in this order. The quoted strings below are literal image text:\n${lines.map(v=>JSON.stringify(v)).join('\n')}\nAdd no other letters, words or numbers.`:'Add no text, logos or watermarks of your own. Do not remove a service-required provenance mark.';
  const prompt=kind==='edit'?`Edit the attached image. Requested change: ${description}\nPreserve the rest of the composition unless the requested change requires it.\n${literal}`:`Create one square image. ${description}\n${literal}`;
  const checks=[kind==='edit'?'Compare the changed area and unchanged surroundings with the input.':'Check the requested subjects, object counts, positions and visual style.',...lines.map(v=>`Read the exact line: ${JSON.stringify(v)}`),'Open the saved output and check its actual dimensions and readability.','Record the app, displayed model or mode, plan, date and number of attempts.'];
  return {version:1,kind,prompt,checks,scope:'A locally assembled brief and manual checklist; no image is generated or evaluated here.'};
}
