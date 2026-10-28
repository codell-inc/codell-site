import { open, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultOutput = new URL("../docs/", import.meta.url);
const routes = [
  ["/", "index.html", "/", "社会の違和感を、前進する力に。"],
  ["/contact.html", "contact.html", "/contact.html", "お問い合わせ"],
  ["/contact/", "contact/index.html", "/contact.html", "お問い合わせ"],
  ["/privacy/", "privacy/index.html", "/privacy/", "プライバシーポリシー"],
  ["/sonovade/", "sonovade/index.html", "/sonovade/", "ソノバデ"],
];

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1].replaceAll("&amp;", "&");
}

/** Read-only checks against the exact company-site artifact uploaded to GitHub Pages. */
export async function verifyCompanyPublication({ outputDir = defaultOutput, baseUrl = "https://codell.jp/", fetcher = fetch } = {}) {
  const output = await realpath(outputDir instanceof URL ? fileURLToPath(outputDir) : path.resolve(outputDir));
  const base = new URL(baseUrl);
  if (!/^https?:$/.test(base.protocol) || base.pathname !== "/" || base.search || base.hash || base.username || base.password) {
    throw new Error("baseUrl must be an HTTP(S) origin with a root path");
  }
  async function artifact(relative) {
    const file = await realpath(path.resolve(output, relative));
    const within = path.relative(output, file);
    if (within === ".." || within.startsWith(`..${path.sep}`) || path.isAbsolute(within)) throw new Error(`Artifact escapes output directory: ${relative}`);
    const info = await stat(file);
    if (!info.isFile() || !info.size) throw new Error(`Artifact is not a nonempty file: ${relative}`);
    return { file, size: info.size };
  }
  async function verify(pathname, local, ranged = false) {
    const response = await fetcher(new URL(pathname, base).href, {
      method: "GET", redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(20_000),
      headers: { "Accept-Encoding": "identity", ...(ranged ? { Range: "bytes=0-1023" } : {}) },
    });
    if (response.redirected) throw new Error(`${pathname}: unexpected redirect`);
    if (response.status !== 200 && !(ranged && response.status === 206)) throw new Error(`${pathname}: expected HTTP ${ranged ? "206 or 200" : "200"}, received ${response.status}`);
    let expected;
    if (response.status === 206) {
      const length = Math.min(1024, local.size);
      const range = `bytes 0-${length - 1}/${local.size}`;
      if (response.headers.get("content-range") !== range) throw new Error(`${pathname}: expected Content-Range ${range}, received ${response.headers.get("content-range")}`);
      expected = Buffer.alloc(length);
      const handle = await open(local.file, "r");
      try { await handle.read(expected, 0, length, 0); } finally { await handle.close(); }
    } else {
      expected = await readFile(local.file);
    }
    const received = Buffer.from(await response.arrayBuffer());
    if (!received.equals(expected)) throw new Error(`${pathname}: published bytes differ from the built artifact (${received.length} received, ${expected.length} expected)`);
    return { path: pathname, status: response.status, bytes: received.length };
  }

  const checks = [];
  let home;
  for (const [pathname, filename, canonical, marker] of routes) {
    const local = await artifact(filename);
    const html = await readFile(local.file, "utf8");
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
    const canonicalLinks = links.filter(tag => attribute(tag, "rel")?.toLowerCase() === "canonical");
    if (canonicalLinks.length !== 1 || attribute(canonicalLinks[0], "href") !== `https://codell.jp${canonical}`) throw new Error(`${pathname}: artifact has an incorrect canonical URL`);
    if (!html.includes(marker)) throw new Error(`${pathname}: artifact is missing expected page content`);
    checks.push(await verify(pathname, local));
    if (pathname === "/") home = { html, links };
  }
  const stylesheet = home.links.map(tag => ({ rel: attribute(tag, "rel"), href: attribute(tag, "href") }))
    .find(link => link.rel?.toLowerCase().split(/\s+/).includes("stylesheet") && link.href && new URL(link.href, base).origin === base.origin);
  if (!stylesheet) throw new Error("Homepage artifact does not reference a local stylesheet");
  const assetPaths = [new URL(stylesheet.href, base).pathname, "/assets/codell-logo.svg", "/assets/main-visual-1920.webp"];
  for (const pathname of assetPaths) {
    if (pathname.startsWith("/assets/") && !home.html.includes(pathname)) throw new Error(`Homepage artifact does not reference ${pathname}`);
    checks.push(await verify(pathname, await artifact(decodeURIComponent(pathname.slice(1))), true));
  }
  return { baseUrl: base.href, checks };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await verifyCompanyPublication({ outputDir: process.argv[2] || defaultOutput, baseUrl: process.argv[3] || "https://codell.jp/" });
    console.log(`Verified ${result.baseUrl}: 5 company pages and 3 homepage assets match the built artifact.`);
  } catch (error) {
    console.error(`Company publication verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
