import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

// Run after npm run build. Validate the actual production build, not source text.
const outputRoot = new URL("../../docs/", import.meta.url);
const html = await readFile(new URL("video-production/index.html", outputRoot), "utf8");

test("the built LP resolves every local asset, route and anchor", async () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, "duplicate HTML ids");
  const targets = [...html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)].map(match => match[1]);
  for (const target of targets) {
    if (target.startsWith("#")) {
      assert(ids.includes(target.slice(1)), `unresolved anchor: ${target}`);
    } else if (target.startsWith("/")) {
      const pathname = new URL(target, "https://codell.jp").pathname;
      const file = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
      await access(new URL(`.${file}`, outputRoot));
    }
  }
  for (const route of ["index.html", "contact.html", "contact/index.html", "privacy/index.html", "sonovade/index.html", "CNAME", ".nojekyll"]) {
    await access(new URL(route, outputRoot));
  }
});

test("both portfolio players have real MP4 bytes and remain opt-in", async () => {
  const players = [...html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
  assert.equal(players.length, 2);
  for (const [, attributes, contents] of players) {
    assert.match(attributes, /\bcontrols\b/);
    assert.match(attributes, /\bplaysinline\b/);
    assert.match(attributes, /\baria-label="[^"]+"/);
    assert.match(attributes, /\baria-describedby="[^"]+"/);
    assert.doesNotMatch(attributes, /\bautoplay\b/);
    const source = contents.match(/<source\b[^>]*\bsrc="([^"]+\.mp4)"/)[1];
    const file = new URL(`.${source}`, outputRoot);
    assert((await stat(file)).size > 1_000_000, `missing video data: ${source}`);
    assert.equal((await readFile(file)).subarray(4, 8).toString(), "ftyp");
  }
});

test("consultation uses the existing inquiry route and FAQs work without scripts", () => {
  const ctas = [...html.matchAll(/<a\b[^>]*class="[^"]*vp-button[^>]*href="([^"]+)"/g)];
  assert(ctas.length >= 4);
  assert(ctas.every(([,href]) => href === "#works" || href === "https://codell.jp/contact.html"));
  assert.doesNotMatch(html, /<form\b/);
  const details = [...html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)]
    .filter(([, attributes]) => !attributes.includes("vp-plan-details"));
  assert.equal(details.length, 8);
  for (const [,attributes,content] of details) {
    assert.doesNotMatch(attributes, /\bopen\b/);
    assert.match(content, /<summary>.+<\/summary>/);
    assert.match(content, /class="vp-faq-answer"/);
  }
  assert.match(html, /rel="canonical" href="https:\/\/video.codell.jp\/"/);
});
