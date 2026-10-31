import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import zlib from "node:zlib";

const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm",
};
const compressible = /^(text\/|application\/(json|xml)|image\/svg)/;

/** Serves the built site like GitHub Pages: directory -> index.html, missing trailing slash -> 301, gzip, 404.html. */
export async function serveDocs({ root = fileURLToPath(new URL("../docs/", import.meta.url)), port = 8080, host = "127.0.0.1" } = {}) {
  const base = await realpath(root);
  async function resolve(pathname) {
    const file = path.resolve(base, `.${pathname}`);
    if (file !== base && !file.startsWith(`${base}${path.sep}`)) return null;
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) return { directory: true, file: path.join(file, "index.html") };
    return info?.isFile() ? { file } : null;
  }
  function send(request, response, status, file) {
    const type = types[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    const gzip = compressible.test(type) && /\bgzip\b/.test(request.headers["accept-encoding"] ?? "");
    response.writeHead(status, { "Content-Type": type, "Cache-Control": "max-age=600", Vary: "Accept-Encoding", ...(gzip ? { "Content-Encoding": "gzip" } : {}) });
    if (request.method === "HEAD") return response.end();
    const stream = createReadStream(file);
    (gzip ? stream.pipe(zlib.createGzip()) : stream).pipe(response);
  }
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { pathname = null; }
    const found = pathname && await resolve(pathname);
    if (found?.directory && !pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      return response.end();
    }
    if (found && await stat(found.file).then(info => info.isFile(), () => false)) return send(request, response, 200, found.file);
    const notFound = path.join(base, "404.html");
    if (await stat(notFound).then(info => info.isFile(), () => false)) return send(request, response, 404, notFound);
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  });
  await new Promise((done, fail) => server.once("error", fail).listen(port, host, done));
  return server;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const port = Number(process.argv[3] || 8080);
  try {
    await serveDocs({ root: process.argv[2] || undefined, port });
    console.log(`Serving ${process.argv[2] || "docs/"} at http://localhost:${port}/`);
  } catch (error) {
    console.error(`serve-docs failed: ${error.message}`);
    process.exitCode = 1;
  }
}
