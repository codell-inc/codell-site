import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { collectCharacters, fonts } from "../../scripts/build-fonts.mjs";

const output = new URL("../../docs/", import.meta.url);
const pages = ["index.html", "products/index.html", "contact.html", "privacy/index.html", "sonovade/index.html"];

test("company pages load the self-hosted subset fonts instead of Google Fonts", async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, output), "utf8");
    assert.match(html, /<link href="\/fonts\/fonts.css" rel="stylesheet"/, page);
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, page);
  }
  const css = await readFile(new URL("fonts/fonts.css", output), "utf8");
  for (const font of fonts) {
    assert(css.includes(`font-family:"${font.family}"`), font.family);
    assert(css.includes(`url("/fonts/${font.output}")`), font.output);
    assert((await stat(new URL(`fonts/${font.output}`, output))).size > 1024, font.output);
    await stat(new URL(`fonts/${font.license}`, output));
  }
});

test("the subset covers the text of every company page", async () => {
  const characters = await collectCharacters(new URL(".", output).pathname);
  for (const sample of ["社会の違和感を、前進する力に。", "プライバシーポリシー", "ソノバデ", "お問い合わせ"]) {
    for (const character of sample) assert(characters.includes(character), `${character} from ${sample}`);
  }
});
