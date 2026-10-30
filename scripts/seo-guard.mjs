// Validate the HTML delivered before JavaScript runs; passing is not proof of indexing.
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(([, name, a, b]) => [name.toLowerCase(), a ?? b]));
}
export function checkIndexableHtml(html, expectedUrl) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  if (!head) throw new Error(`${expectedUrl}: missing head`);
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const canonicals = links.filter(a => a.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  if (canonicals.length !== 1 || canonicals[0].href !== expectedUrl) throw new Error(`${expectedUrl}: expected exactly one self canonical in head`);
  const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  for (const tag of meta) {
    if (["robots", "googlebot", "bingbot"].includes(tag.name?.toLowerCase()) && /\b(noindex|none)\b/i.test(tag.content ?? "")) throw new Error(`${expectedUrl}: indexing blocked by meta`);
  }
  if (!meta.some(a => a.name?.toLowerCase() === "description" && a.content?.trim())) throw new Error(`${expectedUrl}: missing description in head`);
  if (!/<title>[^<]+<\/title>/i.test(head)) throw new Error(`${expectedUrl}: missing title in head`);
}

export function checkModifiedDate(html, expectedUrl, sitemapDate) {
  const dates = [...html.matchAll(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)].map(([, date]) => date);
  if (dates.some((date) => date !== sitemapDate)) {
    throw new Error(`${expectedUrl}: sitemap lastmod differs from structured dateModified`);
  }
}
