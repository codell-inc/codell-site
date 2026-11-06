import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../../docs/", import.meta.url);
const contact = await readFile(new URL("sonovade/contact/index.html", output), "utf8");

test("dedicated contact has only Sonovade inquiry types and existing EmailJS fields", () => {
  assert.match(contact, /rel="canonical" href="https:\/\/codell.jp\/sonovade\/contact\/"/);
  assert.match(contact, /data-product="sonovade"/);
  assert.equal([...contact.matchAll(/type="radio"/g)].length, 4);
  for (const field of ["company_name", "employee_count", "department", "job_title", "name", "email", "type", "discovery_source", "discovery_other", "message"]) {
    assert.match(contact, new RegExp(`name="${field}"`));
  }
  assert.doesNotMatch(contact, /KiDUKiについて|プロダクト開発相談|Codellを知ったきっかけ/);
  assert.match(contact, /ソノバデを知ったきっかけ/);
  assert.doesNotMatch(contact.match(/<textarea[^>]+>/)[0], /required/);
  for (const field of ["company_name", "employee_count", "job_title", "name"]) {
    assert.match(contact.match(new RegExp(`<(?:input|select)[^>]*name="${field}"[^>]*>`))[0], /required/);
  }
  assert.match(contact, /姓名/);
  assert.doesNotMatch(contact.match(/<input[^>]*name="department"[^>]*>/)[0], /required/);
  assert.doesNotMatch(contact, /お名前|任意|field-required/);
});

test("LP and pricing link to the dedicated inquiry page", async () => {
  for (const page of ["sonovade/index.html", "sonovade/pricing/index.html"]) {
    const html = await readFile(new URL(page, output), "utf8");
    assert.doesNotMatch(html, /contact\.html\?product=sonovade/);
    assert.match(html, /href="\/sonovade\/contact\/\?request=consultation"/);
    assert.match(html, /href="\/sonovade\/contact\/\?request=brochure"/);
    if (page.includes("pricing")) assert.match(html, /href="\/sonovade\/contact\/\?request=quote"/);
  }
});

test("corporate contact retains its product options and required message", async () => {
  const html = await readFile(new URL("contact/index.html", output), "utf8");
  assert.match(html, /KiDUKiについて/);
  assert.match(html, /Codellを知ったきっかけ/);
  assert.match(html.match(/<textarea[^>]+>/)[0], /required/);
  assert.doesNotMatch(html, /type="radio"/);
  assert.doesNotMatch(html, /name="employee_count"|name="department"|name="job_title"/);
  assert.doesNotMatch(html.match(/<input[^>]*name="company_name"[^>]*>/)[0], /required/);
});
