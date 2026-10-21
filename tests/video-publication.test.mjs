import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { verifyVideoPublication } from "../scripts/verify-video-publication.mjs";

const baseUrl = "https://video.codell.jp/";
const heroPath = "/video-production/assets/hero-cinematic.webp";
const moviePath = "/video-production/assets/sonovade-pr.mp4";

async function fixture(t, { fullMedia = false, override } = {}) {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "codell-video-publication-"));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  const files = new Map([
    ["/", Buffer.from(`<!doctype html><link rel="canonical" href="${baseUrl}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Example"><link href="/_astro/video.css" rel="stylesheet"><img src="${heroPath}"><video><source src="${moviePath}" type="video/mp4"></video><video><source src="/video-production/assets/kiduki-pr.mp4" type="video/mp4"></video>`)],
    ["/_astro/video.css", Buffer.from(".hero { display: block; }")],
    [heroPath, Buffer.alloc(1536, 23)],
    [moviePath, Buffer.alloc(4096, 45)],
    ["/video-production/assets/kiduki-pr.mp4", Buffer.alloc(2048, 67)],
  ]);
  for (const [pathname, body] of files) {
    const file = path.join(outputDir, pathname === "/" ? "index.html" : pathname.slice(1));
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  }
  const requests = [];
  async function fetcher(url, options) {
    const pathname = new URL(url).pathname;
    requests.push({ url, pathname, options });
    const body = files.get(pathname);
    const custom = override?.({ pathname, options, body });
    if (custom) return custom;
    if (!body) return new Response("Missing", { status: 404 });
    if (options.headers.Range && !fullMedia) {
      const range = body.subarray(0, 1024);
      return new Response(range, { status: 206, headers: { "Content-Range": `bytes 0-${range.length - 1}/${body.length}` } });
    }
    return new Response(body, { status: 200 });
  }
  return { files, requests, verify: () => verifyVideoPublication({ outputDir: pathToFileURL(`${outputDir}/`), baseUrl, fetcher }) };
}

test("verifies current HTML, local CSS, hero and every MP4 using byte ranges", async t => {
  const f = await fixture(t);
  const result = await f.verify();
  assert.equal(result.baseUrl, baseUrl);
  assert.deepEqual(result.checks.map(check => check.status), [200, 200, 206, 206, 206]);
  assert.equal(f.requests.length, 5);
  assert(f.requests.every(request => new URL(request.url).origin === new URL(baseUrl).origin));
  for (const { pathname, options } of f.requests) {
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert(options.signal instanceof AbortSignal);
    assert.equal(options.headers.Range, pathname === "/" || pathname.endsWith(".css") ? undefined : "bytes=0-1023");
  }
});

test("accepts HTTP 200 media only when the entire file matches", async t => {
  const f = await fixture(t, { fullMedia: true });
  const result = await f.verify();
  assert(result.checks.every(check => check.status === 200));
  assert.equal(result.checks.find(check => check.path === moviePath).bytes, 4096);
});

test("rejects partial media incorrectly served as HTTP 200", async t => {
  const f = await fixture(t, { override: ({ pathname, body }) => pathname === moviePath ? new Response(body.subarray(0, 1024), { status: 200 }) : null });
  await assert.rejects(f.verify(), /sonovade-pr\.mp4: published bytes differ.*1024 received, 4096 expected/);
});

test("rejects stale public HTML before checking its assets", async t => {
  const f = await fixture(t, { override: ({ pathname }) => pathname === "/" ? new Response("Old deployment", { status: 200 }) : null });
  await assert.rejects(f.verify(), /\/: published bytes differ from the built artifact/);
  assert.deepEqual(f.requests.map(request => request.pathname), ["/"]);
});

test("rejects missing public assets", async t => {
  const f = await fixture(t, { override: ({ pathname }) => pathname === heroPath ? new Response("Missing", { status: 404 }) : null });
  await assert.rejects(f.verify(), /hero-cinematic\.webp: expected HTTP 206 or 200, received 404/);
});

test("rejects a range with an incorrect total file size", async t => {
  const f = await fixture(t, { override: ({ pathname, body }) => pathname === moviePath ? new Response(body.subarray(0, 1024), { status: 206, headers: { "Content-Range": "bytes 0-1023/9999" } }) : null });
  await assert.rejects(f.verify(), /sonovade-pr\.mp4: expected Content-Range "bytes 0-1023\/4096", received "bytes 0-1023\/9999"/);
});

test("rejects a range with corrupted bytes or a short payload", async t => {
  for (const length of [1024, 128]) {
    const f = await fixture(t, { override: ({ pathname }) => pathname === moviePath ? new Response(Buffer.alloc(length, 99), { status: 206, headers: { "Content-Range": "bytes 0-1023/4096" } }) : null });
    await assert.rejects(f.verify(), /sonovade-pr\.mp4: range bytes differ from the built artifact/);
  }
});

test("rejects redirects instead of silently following them", async t => {
  const f = await fixture(t, { override: ({ pathname }) => pathname === "/" ? new Response(null, { status: 302, headers: { Location: "https://codell.jp/" } }) : null });
  await assert.rejects(f.verify(), /\/: expected HTTP 200, received 302/);
});
