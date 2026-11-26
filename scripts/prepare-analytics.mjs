import {readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
try{process.loadEnvFile('.env.local');}catch(e){if(e.code!=='ENOENT')throw e;}
const key=process.env.POSTHOG_PROJECT_TOKEN,host=process.env.POSTHOG_HOST,release=process.env.ANALYTICS_RELEASE;
if(!/^phc_[a-zA-Z0-9_]{10,200}$/.test(key??'')||!['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(host)||!/^[a-zA-Z0-9.-]{1,80}$/.test(release??''))throw Error('Set project token, ingestion host and release in .env.local');
await copyFile('node_modules/posthog-js/dist/module.slim.no-external.js','dist/posthog-sdk.mjs');
await copyFile('node_modules/posthog-js/LICENSE','dist/posthog-sdk.LICENSE');
await writeFile('dist/analytics-config.json',JSON.stringify({key,host,release})+'\n');
async function inject(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())await inject(path);else if(entry.name.endsWith('.html')){let html=await readFile(path,'utf8');if(!html.includes('rel="canonical"'))continue;if(!html.includes('src="/analytics.mjs"'))html=html.replace('</head>','<script type="module" src="/analytics.mjs"></script></head>');if(!html.includes('data-analytics-privacy')){const en=/<html[^>]+lang="en"/.test(html);html=html.replace('</footer>',`<p class="wrap" data-analytics-privacy><a href="${en?'/en/privacy/':'/privacy/'}">${en?'Privacy &amp; analytics':'隐私与统计'}</a></p></footer>`);}await writeFile(path,html);}}}
await inject('dist');
