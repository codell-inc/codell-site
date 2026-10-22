import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../../docs/", import.meta.url);
const html = await readFile(new URL("products/index.html", output), "utf8");

test("product directory links to both existing marketing pages and resolves its assets", async () => {
  assert.match(html, /rel="canonical" href="https:\/\/codell.jp\/products\/"/);
  for (const href of ["/sonovade/", "https://kiduki.codell.jp/", "/contact.html"]) {
    assert(html.includes(`href="${href}"`), `missing destination: ${href}`);
  }
  for (const [, src] of html.matchAll(/<img\b[^>]*src="(\/[^"]+)"/g)) {
    await access(new URL(`.${src}`, output));
  }
  const home = await readFile(new URL("index.html", output), "utf8");
  assert.match(home, /href="\/products\/"/);
  assert.match(home, /href="\/sonovade\/"/);
  assert.match(home, /href="https:\/\/kiduki.codell.jp\/"/);
});
