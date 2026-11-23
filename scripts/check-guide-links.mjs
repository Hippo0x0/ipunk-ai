import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve('dist');
let count = 0;
for (const prefix of ['', 'en/']) for (const slug of ['opencode-connection-errors', 'opencode-ollama-local-models']) {
  const path = `${prefix}guides/${slug}/index.html`;
  const html = await readFile(resolve(root, path), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ID in ${path}`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith('#') && !href.startsWith('/')) continue;
    const [url, fragment] = href.split('#');
    const target = url ? resolve(root, `.${url}${url.endsWith('/') ? 'index.html' : ''}`) : resolve(root, path);
    const body = await readFile(target, 'utf8');
    if (fragment && !body.includes(`id="${fragment}"`)) throw new Error(`${path}: missing ${href}`);
    count++;
  }
  for (const block of html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)) {
    const value = block[1].replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
    if (value.trim().startsWith('{')) JSON.parse(value);
  }
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  if (schema.inLanguage !== (prefix ? 'en' : 'zh-CN')) throw new Error(`${path}: wrong schema language`);
}
console.log(`Guide checks passed: 4 static bilingual pages, ${count} local links and valid JSON examples`);
