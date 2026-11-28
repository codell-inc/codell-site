import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../../docs/", import.meta.url);
const sonovadePages = ["sonovade/index.html", "sonovade/contact/index.html", "sonovade/pricing/index.html"];

test("Sonovade pages are configured for both the site-wide and Sonovade GA4 properties", async () => {
  for (const page of sonovadePages) {
    const html = await readFile(new URL(page, output), "utf8");
    assert.match(html, /gtag\('config', 'G-35VTG4Z2NT'\)/);
    assert.match(html, /G-G2KCPE6MTE/);
  }
});

test("corporate pages do not report to the Sonovade GA4 property", async () => {
  for (const page of ["index.html", "contact/index.html", "products/index.html"]) {
    const html = await readFile(new URL(page, output), "utf8");
    assert.match(html, /gtag\('config', 'G-35VTG4Z2NT'\)/);
    assert.doesNotMatch(html, /G-G2KCPE6MTE/);
  }
});
