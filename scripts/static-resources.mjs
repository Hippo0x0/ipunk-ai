import { stat } from "node:fs/promises";
import { resolve, sep } from "node:path";

// Check authored, quoted resource attributes without executing analytics or tools.
// External URLs, blob previews and inline data belong to runtime/browser checks.
export async function checkStaticResources(html, pageUrl, root) {
  const base = new URL(pageUrl);
  const rootPath = resolve(root);
  let checked = 0;
  const markup = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const [tag, name] of markup.matchAll(/<(script|link|img|source|video|audio|iframe)\b[^>]*>/gi)) {
    for (const [, attribute, , value] of tag.matchAll(/\s(src|href|poster)\s*=\s*(["'])(.*?)\2/gi)) {
      if (attribute.toLowerCase() === "href" && name.toLowerCase() !== "link") continue;
      if (!value || value.startsWith("#")) continue;
      const target = new URL(value.replaceAll("&amp;", "&"), base);
      if (!["http:", "https:"].includes(target.protocol) || target.origin !== base.origin) continue;
      let path;
      try { path = decodeURIComponent(target.pathname); }
      catch { throw new Error(`${pageUrl}: invalid resource URL ${value}`); }
      const file = resolve(rootPath, `.${path}`, ...(path.endsWith("/") ? ["index.html"] : []));
      if (!file.startsWith(rootPath + sep)) throw new Error(`${pageUrl}: resource escapes dist: ${value}`);
      let info;
      try { info = await stat(file); }
      catch { throw new Error(`${pageUrl}: missing static resource ${value}`); }
      if (!info.isFile()) throw new Error(`${pageUrl}: static resource is not a file: ${value}`);
      checked++;
    }
  }
  return checked;
}
