import {readFile} from 'node:fs/promises';
import {inspectResponse} from '../dist/assistant-task-check.mjs';
const path=process.argv[2];if(!path)throw new Error('Usage: node scripts/score-assistant-task.mjs output.json');
const result=inspectResponse(await readFile(path,'utf8'));
console.log(JSON.stringify(result,null,2));
if(result.formatError||result.checks.some(x=>!x.passed))process.exitCode=1;
