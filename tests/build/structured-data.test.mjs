import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../../docs/", import.meta.url);
const companyPages = ["index.html", "products/index.html", "contact.html", "privacy/index.html", "sonovade/index.html"];

async function graph(page) {
  const html = await readFile(new URL(page, output), "utf8");
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.equal(scripts.length, 1, `${page}: expected exactly one JSON-LD block`);
  const data = JSON.parse(scripts[0][1]);
  assert.equal(data["@context"], "https://schema.org", page);
  return { html, nodes: data["@graph"] };
}

const byType = (nodes, type) => nodes.filter((node) => node["@type"] === type);

test("every company page describes Codell once, as one organization and one website", async () => {
  for (const page of companyPages) {
    const { nodes } = await graph(page);
    const [organization, ...duplicates] = byType(nodes, "Organization");
    assert.equal(duplicates.length, 0, page);
    assert.equal(organization["@id"], "https://codell.jp/#organization", page);
    assert.equal(organization.name, "株式会社Codell", page);
    assert.equal(organization.address.addressRegion, "徳島県", page);
    assert.equal(byType(nodes, "WebSite").length, 1, page);
    assert.doesNotMatch(JSON.stringify(nodes), /info@|\[at\]/, `${page}: the contact address must stay out of JSON-LD`);
  }
});

test("Sonovade is published as a software application by Codell", async () => {
  const { nodes } = await graph("sonovade/index.html");
  const [software] = byType(nodes, "SoftwareApplication");
  assert.equal(software.name, "ソノバデ");
  assert.equal(software.url, "https://codell.jp/sonovade/");
  assert.deepEqual(software.publisher, { "@id": "https://codell.jp/#organization" });
  assert.deepEqual(byType(nodes, "WebPage")[0].about, { "@id": software["@id"] });
});

test("the product directory lists every product and service with absolute URLs", async () => {
  const { nodes } = await graph("products/index.html");
  const items = byType(nodes, "CollectionPage")[0].mainEntity.itemListElement;
  assert.deepEqual(items.map((item) => [item.position, item.name, item.url]), [
    [1, "KiDUKi", "https://kiduki.codell.jp/"],
    [2, "ソノバデ", "https://codell.jp/sonovade/"],
    [3, "動画制作", "https://video.codell.jp/"],
    [4, "開発受託", "https://codell.jp/#work"],
  ]);
});

test("the video site names Codell but not codell.jp as its website", async () => {
  const { nodes } = await graph("video-production/index.html");
  assert.equal(byType(nodes, "Organization").length, 1);
  assert.equal(byType(nodes, "WebSite").length, 0);
});

test("footers link the company site, Sonovade, and the video site to each other", async () => {
  const links = {
    "index.html": ["/products/", "https://kiduki.codell.jp/", "/sonovade/", "https://video.codell.jp/"],
    "sonovade/index.html": ["/products/"],
    "video-production/index.html": ["https://codell.jp/products/"],
  };
  for (const [page, hrefs] of Object.entries(links)) {
    const html = await readFile(new URL(page, output), "utf8");
    const footer = html.slice(html.lastIndexOf("<footer"));
    for (const href of hrefs) assert(footer.includes(`href="${href}"`), `${page}: footer is missing ${href}`);
  }
});
