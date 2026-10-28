import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { verifyCompanyPublication } from "../scripts/verify-company-publication.mjs";

async function fixture(t, { fullAssets = false, override, canonicalOrigin = "https://codell.jp" } = {}) {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "codell-company-publication-"));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  const html = (canonical, content) => Buffer.from(`<link href="${canonicalOrigin}${canonical}" rel="canonical">${content}`);
  const contact = html("/contact.html", "お問い合わせ");
  const files = new Map([
    ["/", html("/", '社会の違和感を、前進する力に。<link rel="stylesheet" href="https://fonts.googleapis.com/example"><link rel="stylesheet" href="/_astro/company.css"><img src="/assets/codell-logo.svg"><style>--main-visual:url("/assets/main-visual-1920.webp")</style>')],
    ["/contact.html", contact], ["/contact/", contact],
    ["/privacy/", html("/privacy/", "プライバシーポリシー")],
    ["/sonovade/", html("/sonovade/", "ソノバデ")],
    ["/_astro/company.css", Buffer.from("body { color: black; }")],
    ["/assets/codell-logo.svg", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
    ["/assets/main-visual-1920.webp", Buffer.alloc(2048, 47)],
  ]);
  for (const [pathname, body] of files) {
    const file = path.join(outputDir, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
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
    if (options.headers.Range && !fullAssets) {
      const part = body.subarray(0, 1024);
      return new Response(part, { status: 206, headers: { "Content-Range": `bytes 0-${part.length - 1}/${body.length}` } });
    }
    return new Response(body);
  }
  return { requests, verify: () => verifyCompanyPublication({ outputDir, baseUrl: "http://localhost:4321/", fetcher }) };
}

test("verifies five current pages, production canonicals and three ranged assets using only GET", async t => {
  const f = await fixture(t);
  const result = await f.verify();
  assert.deepEqual(result.checks.map(check => check.status), [200, 200, 200, 200, 200, 206, 206, 206]);
  assert(f.requests.every(({ url, options }) => new URL(url).origin === "http://localhost:4321" && options.method === "GET" && options.redirect === "manual" && options.cache === "no-store"));
  assert(f.requests.slice(5).every(({ options }) => options.headers.Range === "bytes=0-1023"));
});

test("accepts HTTP 200 assets only when their entire bytes match", async t => {
  const f = await fixture(t, { fullAssets: true });
  assert((await f.verify()).checks.every(check => check.status === 200));
});

test("rejects missing home and stale HTML", async t => {
  for (const status of [404, 200]) {
    const f = await fixture(t, { override: ({ pathname }) => pathname === "/" ? new Response("Old site", { status }) : null });
    await assert.rejects(f.verify(), status === 404 ? /\/: expected HTTP 200, received 404/ : /\/: published bytes differ/);
    assert.equal(f.requests.length, 1);
  }
});

test("rejects missing CSS or homepage images", async t => {
  for (const missing of ["/_astro/company.css", "/assets/codell-logo.svg", "/assets/main-visual-1920.webp"]) {
    const f = await fixture(t, { override: ({ pathname }) => pathname === missing ? new Response("Missing", { status: 404 }) : null });
    await assert.rejects(f.verify(), /expected HTTP 206 or 200, received 404/);
  }
});

test("rejects wrong canonicals, redirects and invalid asset ranges", async t => {
  await assert.rejects((await fixture(t, { canonicalOrigin: "https://video.codell.jp" })).verify(), /incorrect canonical URL/);
  const redirect = await fixture(t, { override: ({ pathname }) => pathname === "/contact.html" ? new Response(null, { status: 301, headers: { Location: "/contact/" } }) : null });
  await assert.rejects(redirect.verify(), /contact.html: expected HTTP 200, received 301/);
  const range = await fixture(t, { override: ({ pathname, body }) => pathname === "/assets/main-visual-1920.webp" ? new Response(body.subarray(0, 1024), { status: 206, headers: { "Content-Range": "bytes 0-1023/9999" } }) : null });
  await assert.rejects(range.verify(), /expected Content-Range bytes 0-1023\/2048/);
});

test("rejects corrupted ranges and partial files incorrectly served as HTTP 200", async t => {
  for (const status of [206, 200]) {
    const f = await fixture(t, { override: ({ pathname }) => pathname === "/assets/main-visual-1920.webp" ? new Response(Buffer.alloc(1024, 99), { status, headers: { "Content-Range": "bytes 0-1023/2048" } }) : null });
    await assert.rejects(f.verify(), /main-visual-1920.webp: published bytes differ/);
  }
});
