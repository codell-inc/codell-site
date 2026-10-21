import { open, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultOutput = new URL("../dist/video/", import.meta.url);
const rangeBytes = 1024;

function attribute(tag, name) {
  const match = tag.match(new RegExp(`(?:\\s|^)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\x60]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3]).replaceAll("&amp;", "&") : null;
}

function references(html, base) {
  const css = new Map();
  const media = new Map();
  function local(reference) {
    if (!reference) return null;
    const url = new URL(reference, base);
    if (url.origin !== base.origin) return null;
    url.hash = "";
    return url;
  }
  for (const [tag] of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(?:link|img|source)\b[^>]*>/gi)) {
    if (/^<link\b/i.test(tag) && attribute(tag, "rel")?.toLowerCase().split(/\s+/).includes("stylesheet")) {
      const url = local(attribute(tag, "href"));
      if (url) css.set(url.href, { url, type: "CSS" });
    }
    const url = local(attribute(tag, "src"));
    if (url?.pathname.endsWith("/hero-cinematic.webp")) media.set(url.href, { url, type: "hero image" });
    if (/^<source\b/i.test(tag) && /\.mp4$/i.test(url?.pathname ?? "")) media.set(url.href, { url, type: "MP4" });
  }
  if (!css.size) throw new Error("The video artifact does not reference a local stylesheet");
  if (![...media.values()].some(asset => asset.type === "hero image")) throw new Error("The video artifact does not reference hero-cinematic.webp");
  if (![...media.values()].some(asset => asset.type === "MP4")) throw new Error("The video artifact does not reference an MP4 source");
  return [...css.values(), ...media.values()];
}

/** Verify a deployed video site against the exact artifact that was published. */
export async function verifyVideoPublication({ outputDir = defaultOutput, baseUrl = "https://video.codell.jp/", fetcher = fetch } = {}) {
  const output = await realpath(outputDir instanceof URL ? fileURLToPath(outputDir) : path.resolve(outputDir));
  const base = new URL(baseUrl);
  if (!/^https?:$/.test(base.protocol) || base.pathname !== "/" || base.search || base.hash || base.username || base.password) {
    throw new Error("baseUrl must be an HTTP(S) origin with a root path");
  }
  async function artifact(url) {
    const file = await realpath(path.resolve(output, `.${decodeURIComponent(url.pathname)}`));
    const relative = path.relative(output, file);
    if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
      throw new Error(`Artifact path escapes the output directory: ${url.pathname}`);
    }
    const info = await stat(file);
    if (!info.isFile()) throw new Error(`Artifact is not a regular file: ${url.pathname}`);
    return { file, size: info.size };
  }
  async function request(url, ranged = false) {
    const response = await fetcher(url.href, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: { "Accept-Encoding": "identity", ...(ranged ? { Range: `bytes=0-${rangeBytes - 1}` } : {}) },
    });
    if (response.redirected) throw new Error(`${url.pathname}: unexpected redirect`);
    return response;
  }
  async function verifyFull(response, url, expected) {
    if (response.status !== 200) throw new Error(`${url.pathname}: expected HTTP 200, received ${response.status}`);
    const received = Buffer.from(await response.arrayBuffer());
    if (!received.equals(expected)) throw new Error(`${url.pathname}: published bytes differ from the built artifact (${received.length} received, ${expected.length} expected)`);
    return { path: url.pathname, status: 200, bytes: received.length };
  }
  const html = await readFile(path.join(output, "index.html"));
  const assets = references(html.toString("utf8"), base);
  const root = await verifyFull(await request(base), base, html);
  const checks = await Promise.allSettled(assets.map(async ({ url, type }) => {
    const local = await artifact(url);
    const response = await request(url, type !== "CSS");
    if (type === "CSS" || response.status === 200) {
      return { ...await verifyFull(response, url, await readFile(local.file)), type };
    }
    if (response.status !== 206) throw new Error(`${url.pathname}: expected HTTP 206 or 200, received ${response.status}`);
    const expectedLength = Math.min(rangeBytes, local.size);
    const expectedRange = `bytes 0-${expectedLength - 1}/${local.size}`;
    if (response.headers.get("content-range") !== expectedRange) {
      throw new Error(`${url.pathname}: expected Content-Range ${JSON.stringify(expectedRange)}, received ${JSON.stringify(response.headers.get("content-range"))}`);
    }
    const received = Buffer.from(await response.arrayBuffer());
    const expected = Buffer.alloc(expectedLength);
    const handle = await open(local.file, "r");
    try {
      await handle.read(expected, 0, expectedLength, 0);
    } finally {
      await handle.close();
    }
    if (!received.equals(expected)) throw new Error(`${url.pathname}: range bytes differ from the built artifact (${received.length} received, ${expectedLength} expected)`);
    return { path: url.pathname, type, status: 206, bytes: received.length };
  }));
  const failures = checks.filter(check => check.status === "rejected");
  if (failures.length) throw new Error(failures.map(check => check.reason.message).join("; "));
  return { baseUrl: base.href, checks: [root, ...checks.map(check => check.value)] };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await verifyVideoPublication({ outputDir: process.argv[2] || defaultOutput, baseUrl: process.argv[3] || "https://video.codell.jp/" });
    console.log(`Verified ${result.baseUrl}: current HTML and ${result.checks.length - 1} CSS/image/video assets match the built artifact.`);
  } catch (error) {
    console.error(`Video publication verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
