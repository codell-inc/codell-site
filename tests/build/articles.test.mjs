import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../../docs/", import.meta.url);
const slugs = ["riyusho-kakikata", "shikyu-gendogaku-20man", "zenji-shinsei-shorui"];

function jsonLdGraph(html) {
  const script = html.match(/type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(script, "JSON-LD block not found");
  return JSON.parse(script[1]);
}

test("every article page publishes with Article JSON-LD, canonical URL, and dates", async () => {
  for (const slug of slugs) {
    const html = await readFile(new URL(`sonovade/articles/${slug}/index.html`, output), "utf8");
    assert.match(html, new RegExp(`rel="canonical" href="https://codell.jp/sonovade/articles/${slug}/"`));
    const graph = jsonLdGraph(html);
    const types = graph["@graph"].map((node) => node["@type"]);
    assert.ok(types.includes("Article"), `${slug}: Article node missing`);
    const article = graph["@graph"].find((node) => node["@type"] === "Article");
    assert.match(article.datePublished, /^\d{4}-\d{2}-\d{2}T/);
    assert.match(article.dateModified, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(article.inLanguage, "ja");
    assert.ok(article.headline.length > 10);
  }
});

test("articles with FAQs publish a FAQPage node matching the visible questions", async () => {
  for (const slug of slugs) {
    const html = await readFile(new URL(`sonovade/articles/${slug}/index.html`, output), "utf8");
    const graph = jsonLdGraph(html);
    const faq = graph["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.ok(faq, `${slug}: FAQPage node missing`);
    for (const question of faq.mainEntity) {
      assert.match(question.name, /[か。]$/);
      assert.ok(question.acceptedAnswer.text.length > 20);
      // 表示側のFAQ節にも同じ質問があること（単一情報源の検証）
      assert.match(html, new RegExp(`<summary>${question.name}</summary>`));
    }
  }
});

test("every article closes with a Sonovade request path", async () => {
  for (const slug of slugs) {
    const html = await readFile(new URL(`sonovade/articles/${slug}/index.html`, output), "utf8");
    assert.match(html, /href="\/sonovade\/contact\/\?request=brochure"/);
    assert.match(html, /href="\/sonovade\/contact\/\?request=consultation"/);
  }
});

test("article cross-links point at published sibling articles", async () => {
  for (const slug of slugs) {
    const html = await readFile(new URL(`sonovade/articles/${slug}/index.html`, output), "utf8");
    for (const [, target] of html.matchAll(/href="\/sonovade\/articles\/([^/"]+)\/"/g)) {
      assert.ok(slugs.includes(target), `${slug}: links to unknown article ${target}`);
    }
  }
});

test("the article index lists every article and the header links to it", async () => {
  const index = await readFile(new URL("sonovade/articles/index.html", output), "utf8");
  for (const slug of slugs) assert.match(index, new RegExp(`href="/sonovade/articles/${slug}/"`));
  const lp = await readFile(new URL("sonovade/index.html", output), "utf8");
  assert.match(lp, /href="\/sonovade\/articles\/"/);
});

test("the generated sitemap includes every built page", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", output), "utf8");
  const listed = [...sitemap.matchAll(/<loc>https:\/\/codell\.jp\/([^<]*)<\/loc>/g)].map(([, path]) => path);
  for (const expected of ["", "products/", "contact.html", "privacy/", "sonovade/", "sonovade/pricing/", "sonovade/contact/", "sonovade/articles/", ...slugs.map((slug) => `sonovade/articles/${slug}/`)]) {
    assert.ok(listed.includes(expected), `sitemap missing ${expected || "/"}`);
  }
  assert.ok(!listed.some((path) => path.startsWith("video-production")), "video-production must stay excluded");
});
