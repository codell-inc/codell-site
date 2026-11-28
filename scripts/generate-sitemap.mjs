import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ビルド結果から sitemap.xml を生成する。ページを追加しても sitemap の更新忘れが
// 起きないように、docs/ の実在するルートだけを列挙する方針。
const outputRoot = new URL("../docs/", import.meta.url);
const origin = "https://codell.jp/";
// video.codell.jp に正規化を寄せる議論が未決のままのため、現行の手動運用と同じく除外。
const excludedDirectories = new Set(["video-production"]);

async function routes(directory, prefix = "") {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || excludedDirectories.has(entry.name)) continue;
      found.push(...await routes(path.join(directory, entry.name), `${prefix}${entry.name}/`));
    } else if (entry.name === "index.html") {
      found.push(prefix);
    } else if (entry.name === "contact.html") {
      // 旧URLとの互換維持のため残しているルートのみを登録する。
      found.push(`${prefix}contact.html`);
    }
  }
  return found;
}

const urls = (await routes(fileURLToPath(outputRoot))).sort((a, b) => a.localeCompare(b));
const existing = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8").then((text) => new Set([...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc.replace(origin, "")))).catch(() => new Set());
const missing = [...existing].filter((route) => !urls.includes(route));
if (missing.length > 0) {
  console.warn(`generate-sitemap: public/sitemap.xml にだけ存在する経路を検出（生成対象から漏れました）: ${missing.join(", ")}`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((route) => `  <url><loc>${origin}${route}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(new URL("sitemap.xml", outputRoot), xml);
console.log(`generate-sitemap: ${urls.length} URLs`);
