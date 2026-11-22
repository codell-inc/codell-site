import { copyFile, mkdir, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const defaultInput = new URL("../docs/", import.meta.url);
const defaultOutput = new URL("../dist/video/", import.meta.url);
const entryPath = "/video-production/index.html";

function directory(value) {
  return path.resolve(value instanceof URL ? fileURLToPath(value) : value);
}

async function outputPath(target) {
  try {
    return await realpath(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return path.join(await outputPath(path.dirname(target)), path.basename(target));
  }
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function localPath(reference, from) {
  const value = reference.trim();
  if (/^file:/i.test(value)) throw new Error(`Nonlocal file reference ${JSON.stringify(value)} in ${from}`);
  if (!value || value.startsWith("#") || value.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(value)) return null;
  let pathname;
  try {
    pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
  } catch {
    throw new Error(`Invalid asset URL ${JSON.stringify(value)} in ${from}`);
  }
  if (!pathname) return null;
  if (/[\u0000\\]/.test(pathname)) throw new Error(`Invalid asset path ${JSON.stringify(value)} in ${from}`);
  const segments = pathname.startsWith("/") ? [] : path.posix.dirname(from).split("/").filter(Boolean);
  for (const segment of pathname.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (!segments.length) throw new Error(`Asset path escapes the build directory: ${JSON.stringify(value)} in ${from}`);
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return `/${segments.join("/")}`;
}

function cssReferences(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [
    ...[...source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"()]*))\s*\)/gi)].map(match => (match[1] ?? match[2] ?? match[3]).trim()),
    ...[...source.matchAll(/@import\s+(?:"([^"]+)"|'([^']+)')/gi)].map(match => match[1] ?? match[2]),
  ];
}

function decodeAttribute(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const code = entity.slice(2, -1);
    return String.fromCodePoint(code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code));
  });
}

function htmlReferences(html) {
  const source = html.replace(/<!--[\s\S]*?-->/g, "");
  const references = [];
  for (const match of source.matchAll(/(?<![\w:-])(src|href|poster|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
    const value = decodeAttribute(match[2] ?? match[3] ?? match[4]);
    if (match[1].toLowerCase() === "srcset") {
      // Each candidate starts with a URL, followed by an optional width/density.
      for (const candidate of value.matchAll(/(?:^|,)\s*([^\s,]+)(?:\s+[^,]*)?/g)) {
        if (!value.trim().startsWith("data:")) references.push(candidate[1]);
      }
    } else {
      references.push(value);
    }
  }
  return references.concat(cssReferences(source));
}

/** Package only the video LP and the assets it references from an Astro build. */
export async function prepareVideoSite({ inputDir = defaultInput, outputDir = defaultOutput, siteUrl = "https://video.codell.jp/" } = {}) {
  const input = await realpath(directory(inputDir));
  const output = await outputPath(directory(outputDir));
  if (isWithin(output, input) || isWithin(input, output)) throw new Error("The video output directory must be separate from the input build directory");
  const origin = new URL(siteUrl);
  if (!/^https?:$/.test(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("siteUrl must be an HTTP(S) origin with a root path");
  }
  const files = new Map();
  async function visit(assetPath, from) {
    if (files.has(assetPath)) return;
    const source = path.join(input, assetPath.slice(1));
    let actual;
    try {
      actual = await realpath(source);
    } catch (error) {
      if (error.code === "ENOENT") throw new Error(`Missing asset ${JSON.stringify(assetPath)} referenced from ${from}`);
      throw error;
    }
    if (!isWithin(input, actual)) throw new Error(`Nonlocal file ${JSON.stringify(assetPath)} referenced from ${from}`);
    const info = await stat(actual);
    if (!info.isFile()) throw new Error(`Asset is not a regular file: ${assetPath} referenced from ${from}`);
    if (info.size > MAX_ASSET_BYTES) {
      throw new Error(`${assetPath}: ${info.size} bytes exceeds the Cloudflare static asset limit of ${MAX_ASSET_BYTES} bytes (25 MiB)`);
    }
    files.set(assetPath, actual);
    if (assetPath === entryPath || path.posix.extname(assetPath).toLowerCase() === ".css") {
      const contents = await readFile(actual, "utf8");
      const references = assetPath === entryPath ? htmlReferences(contents) : cssReferences(contents);
      for (const reference of references) {
        const dependency = localPath(reference, assetPath);
        if (dependency) await visit(dependency, assetPath);
      }
    }
  }
  await visit(entryPath, "video LP entry");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const [assetPath, source] of files) {
    const target = path.join(output, assetPath === entryPath ? "index.html" : assetPath.slice(1));
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
  }
  await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${origin}sitemap.xml\n`);
  await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}</loc></url></urlset>\n`);
  await writeFile(path.join(output, "_redirects"), "/video-production / 301\n/video-production/ / 301\n");
  await writeFile(path.join(output, "404.html"), '<!doctype html><html lang="ja"><meta charset="utf-8"><title>ページが見つかりません</title><h1>ページが見つかりません</h1><a href="/">トップへ戻る</a></html>\n');
  return { outputDir: output, assetCount: files.size, siteUrl: origin.href };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await prepareVideoSite({ inputDir: process.argv[2] || defaultInput, outputDir: process.argv[3] || defaultOutput });
    console.log(`Prepared ${result.assetCount} video site files in ${result.outputDir}`);
  } catch (error) {
    console.error(`Video site packaging failed: ${error.message}`);
    process.exitCode = 1;
  }
}
