import assert from "node:assert/strict";
import { mkdir, mkdtemp, open, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { MAX_ASSET_BYTES, prepareVideoSite } from "../scripts/prepare-video-site.mjs";

async function fixture(t, html) {
  const root = await mkdtemp(path.join(os.tmpdir(), "codell-video-deployment-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, "docs");
  const output = path.join(root, "video");
  async function put(relative, contents = "asset bytes") {
    const target = path.join(input, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
    return target;
  }
  await put("video-production/index.html", html);
  return { root, input, output, put };
}

async function fileList(root, prefix = "") {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await fileList(root, relative));
    else result.push(relative);
  }
  return result.sort();
}

test("packages the exact root LP and its local HTML/CSS asset dependency closure", async t => {
  const html = `<!doctype html><html><head>
<link rel="canonical" href="https://video.codell.jp/">
<meta property="og:url" content="https://video.codell.jp/">
<link rel="stylesheet" href="/styles/main.css?v=1&amp;x=2">
<link rel="icon" href="/favicon.png">
<style>.hero { background: url('/assets/texture.webp') }</style>
</head><body><a href="https://codell.jp/">Codell</a>
<img src="/assets/logo.svg" srcset="/assets/small.webp 1x, /assets/large.webp 2x">
<video poster="/video-production/assets/poster.jpg"><source src="/video-production/assets/movie.mp4"></video>
<a href="/video-production/assets/movie.mp4">Download</a>
<a href="#works">Works</a><script src="https://example.com/analytics.js"></script>
</body></html>`;
  const f = await fixture(t, html);
  await f.put("styles/main.css", `@import "./theme.css"; .image { background: url('../assets/back.webp#image') } @font-face { src: url('/fonts/body.woff2') } /* url('/missing-comment.png') */`);
  await f.put("styles/theme.css", `@import url("./main.css"); .icon { background: url('nested/icon.svg') } .external { background: url('https://example.com/image.jpg') } .inline { background: url(data:image/png;base64,aGVsbG8=) }`);
  const assets = ["favicon.png", "assets/logo.svg", "assets/small.webp", "assets/large.webp", "assets/texture.webp", "assets/back.webp", "fonts/body.woff2", "styles/nested/icon.svg", "video-production/assets/poster.jpg"];
  for (const asset of assets) await f.put(asset);
  const movie = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
  await f.put("video-production/assets/movie.mp4", movie);
  for (const unused of ["index.html", "CNAME", "contact.html", "sonovade/index.html", "video-production/assets/SOURCES.md", "video-production/assets/unused.webp"]) await f.put(unused, "unrelated company content");

  const result = await prepareVideoSite({ inputDir: pathToFileURL(`${f.input}/`), outputDir: pathToFileURL(`${f.output}/`) });
  assert.equal(await readFile(path.join(f.output, "index.html"), "utf8"), html);
  assert.match(await readFile(path.join(f.output, "index.html"), "utf8"), /rel="canonical" href="https:\/\/video\.codell\.jp\/"/);
  assert.deepEqual(await readFile(path.join(f.output, "video-production/assets/movie.mp4")), movie);
  const expectedAssets = [...assets, "styles/main.css", "styles/theme.css", "video-production/assets/movie.mp4"];
  assert.deepEqual(await fileList(f.output), [...expectedAssets, "index.html", "robots.txt", "sitemap.xml", "_redirects", "404.html"].sort());
  assert.equal(result.assetCount, expectedAssets.length + 1);
  assert.equal(await readFile(path.join(f.output, "robots.txt"), "utf8"), "User-agent: *\nAllow: /\nSitemap: https://video.codell.jp/sitemap.xml\n");
  assert.equal((await readFile(path.join(f.output, "sitemap.xml"), "utf8")).match(/<loc>[^<]+<\/loc>/g).join(""), "<loc>https://video.codell.jp/</loc>");
  // A wildcard redirect would also intercept the required /video-production/assets URLs.
  assert.equal(await readFile(path.join(f.output, "_redirects"), "utf8"), "/video-production / 301\n/video-production/ / 301\n");
});

test("rebuilding removes stale output without bringing unrelated files back", async t => {
  const f = await fixture(t, '<img src="/assets/current.png">');
  await f.put("assets/current.png");
  await prepareVideoSite({ inputDir: f.input, outputDir: f.output });
  await writeFile(path.join(f.output, "stale.txt"), "old output");
  await f.put("video-production/index.html", "<p>New page</p>");
  await prepareVideoSite({ inputDir: f.input, outputDir: f.output });
  assert.deepEqual(await fileList(f.output), ["404.html", "_redirects", "index.html", "robots.txt", "sitemap.xml"]);
});

test("missing CSS dependencies fail with the asset and referring file", async t => {
  const f = await fixture(t, '<link href="/styles/main.css" rel="stylesheet">');
  await f.put("styles/main.css", ".hero { background: url('../assets/missing.webp') }");
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Missing asset "\/assets\/missing\.webp" referenced from \/styles\/main\.css/);
});

test("files over 25 MiB fail with their exact byte size", async t => {
  const f = await fixture(t, '<video src="/video-production/assets/oversize.mp4"></video>');
  const movie = await f.put("video-production/assets/oversize.mp4", "");
  const handle = await open(movie, "r+");
  await handle.truncate(MAX_ASSET_BYTES + 1);
  await handle.close();
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /oversize\.mp4: 26214401 bytes exceeds.*26214400 bytes \(25 MiB\)/);
});

test("path traversal and file URLs cannot read outside the build", async t => {
  const f = await fixture(t, '<img src="/../../outside.png">');
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Asset path escapes the build directory/);
  await f.put("video-production/index.html", '<img src="/%2e%2e/outside.png">');
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Asset path escapes the build directory/);
  await f.put("video-production/index.html", '<img src="file:///tmp/outside.png">');
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Nonlocal file reference/);
});

test("symlinks outside the build and directory references are rejected", async t => {
  const f = await fixture(t, '<img src="/outside.png">');
  await writeFile(path.join(f.root, "outside.png"), "outside");
  await symlink(path.join(f.root, "outside.png"), path.join(f.input, "outside.png"));
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Nonlocal file "\/outside\.png"/);
  await f.put("video-production/index.html", '<img src="/video-production/">');
  await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir: f.output }), /Asset is not a regular file/);
});

test("output cannot erase or live inside the input build", async t => {
  const f = await fixture(t, "<p>LP</p>");
  for (const outputDir of [f.input, f.root, path.join(f.input, "video-output")]) {
    await assert.rejects(prepareVideoSite({ inputDir: f.input, outputDir }), /must be separate from the input build directory/);
  }
  assert.equal(await readFile(path.join(f.input, "video-production/index.html"), "utf8"), "<p>LP</p>");
});
