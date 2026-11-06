import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/scripts/contact-form.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source.replaceAll("import.meta.env.", "TEST_ENV."), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const destination = "AW-18448674355/test-success-label";

function setup({ valid = true, send = async () => {}, tag = "present", sendTo = destination, search = "", dedicated = false, values = {} } = {}) {
  const conversions = [];
  const sends = [];
  const errors = [];
  const listeners = {};
  const status = { textContent: "", dataset: {} };
  const button = { disabled: false };
  const form = {
    dataset: { product: dedicated ? "sonovade" : undefined },
    resets: 0,
    reports: 0,
    checkValidity: () => valid,
    reportValidity() { this.reports++; },
    reset() { this.resets++; },
    addEventListener(name, listener) { listeners[name] = listener; },
  };
  const options = ["", "ソノバデについて", "ソノバデの見積もり依頼", "ソノバデの資料請求", "KiDUKiについて", "プロダクト開発相談", "その他"].map((value) => ({ value, selected: value === "", defaultSelected: value === "" }));
  const typeSelect = { options };
  const radios = ["ソノバデの無料相談", "ソノバデの見積もり依頼", "ソノバデの資料請求", "ソノバデについて"].map(value => ({value, checked: false, defaultChecked: false}));
  const elements = { "#contact-form": form, "#contact-status": status, "#contact-submit": button, "#contact-type": dedicated ? null : typeSelect };
  const emailjs = {
    init() {},
    send(...args) { sends.push(args); return send(...args); },
  };
  const window = { location: { search } };
  if (tag === "present") window.gtag = (...args) => conversions.push(JSON.parse(JSON.stringify(args)));
  if (tag === "throws") window.gtag = () => { throw new Error("Tracking unavailable"); };
  vm.runInNewContext(compiled, {
    exports: {},
    require: (name) => { assert.equal(name, "@emailjs/browser"); return emailjs; },
    TEST_ENV: { PUBLIC_GOOGLE_ADS_CONTACT_SEND_TO: sendTo },
    document: { querySelector: (selector) => elements[selector] ?? null, querySelectorAll: () => dedicated ? radios : [] },
    FormData: class { get(name) { return Object.hasOwn(values, name) ? values[name] : name === "type" ? (dedicated ? radios.find(radio => radio.checked)?.value : options.find((option) => option.defaultSelected)?.value) : `${name}:private-input`; } },
    window,
    URLSearchParams,
    console: { error: (...args) => errors.push(args) },
  });
  return { typeSelect, radios, form, status, button, conversions, sends, errors, submit: () => listeners.submit({ preventDefault() {} }) };
}

test("conversion occurs once after email resolves, with only the destination", async () => {
  let resolve;
  const fixture = setup({ send: () => new Promise((done) => { resolve = done; }) });
  assert.deepEqual(fixture.conversions, []);
  const pending = fixture.submit();
  assert.equal(fixture.sends.length, 1);
  assert.equal(fixture.status.dataset.state, "loading");
  assert.equal(fixture.button.disabled, true);
  assert.deepEqual(fixture.conversions, []);
  await fixture.submit();
  assert.equal(fixture.sends.length, 1, "concurrent submits must not send a second email");
  resolve();
  await pending;
  assert.deepEqual(fixture.conversions, [["event", "conversion", { send_to: destination }]]);
  assert.equal(fixture.status.dataset.state, "success");
  assert.equal(fixture.form.resets, 1);
  assert.equal(fixture.button.disabled, false);
});

test("invalid form does not send or convert", async () => {
  const fixture = setup({ valid: false });
  await fixture.submit();
  assert.equal(fixture.form.reports, 1);
  assert.equal(fixture.sends.length, 0);
  assert.deepEqual(fixture.conversions, []);
  assert.equal(fixture.button.disabled, false);
});

test("failed email does not convert, preserves form, and permits retry", async () => {
  let attempts = 0;
  const fixture = setup({ send: async () => { if (++attempts === 1) throw new Error("Email rejected"); } });
  await fixture.submit();
  assert.equal(fixture.status.dataset.state, "error");
  assert.equal(fixture.errors.length, 1);
  assert.equal(fixture.form.resets, 0);
  assert.equal(fixture.button.disabled, false);
  assert.deepEqual(fixture.conversions, []);
  await fixture.submit();
  assert.equal(fixture.status.dataset.state, "success");
  assert.equal(fixture.sends.length, 2);
  assert.equal(fixture.conversions.length, 1);
});

for (const tag of ["missing", "throws"]) {
  test(`${tag} Google tag does not change successful email result`, async () => {
    const fixture = setup({ tag });
    await fixture.submit();
    assert.equal(fixture.status.dataset.state, "success");
    assert.equal(fixture.form.resets, 1);
    assert.equal(fixture.button.disabled, false);
    assert.equal(fixture.errors.length, 0);
  });
}

test("unconfigured conversion destination does not emit an event", async () => {
  const fixture = setup({ sendTo: "" });
  await fixture.submit();
  assert.equal(fixture.status.dataset.state, "success");
  assert.deepEqual(fixture.conversions, []);
});

test("default destination matches the configured Google Ads action", async () => {
  const fixture = setup({ sendTo: null });
  await fixture.submit();
  assert.deepEqual(fixture.conversions, [["event", "conversion", {
    send_to: "AW-18448674355/3cp0COiC5ZAdELPcgd1E",
  }]]);
});

// Product context must survive the form reset after a successful submission.
test("Sonovade landing-page context preselects the product and its reset default", () => {
  const fixture = setup({ search: "?product=sonovade" });
  const product = fixture.typeSelect.options.find((option) => option.value === "ソノバデについて");
  assert.equal(product.selected, true);
  assert.equal(product.defaultSelected, true);
  assert.equal(fixture.typeSelect.options.filter((option) => option.defaultSelected).length, 1);
});

test("generic contact and unknown product keep the initial product prompt", () => {
  for (const search of ["", "?product=unknown", "?request=quote", "?product=unknown&request=brochure"]) {
    const fixture = setup({ search });
    assert.equal(fixture.typeSelect.options[0].selected, true);
    assert.equal(fixture.typeSelect.options[1].selected, false);
  }
});

for (const [request, type] of [["quote", "ソノバデの見積もり依頼"], ["brochure", "ソノバデの資料請求"]]) {
  test(`${request} preselects its inquiry type and sends it through EmailJS`, async () => {
    const fixture = setup({ search: `?product=sonovade&request=${request}` });
    const selected = fixture.typeSelect.options.find((option) => option.value === type);
    assert.equal(selected.selected, true);
    assert.equal(selected.defaultSelected, true);
    assert.equal(fixture.typeSelect.options.filter((option) => option.defaultSelected).length, 1);
    await fixture.submit();
    assert.equal(fixture.sends[0][2].type, type);
    assert.equal(selected.defaultSelected, true);
  });
}

test("unknown inquiry requests fall back to the Sonovade inquiry", () => {
  for (const request of ["unknown", "__proto__", "constructor"]) {
    const fixture = setup({ search: `?product=sonovade&request=${request}` });
    assert.equal(fixture.typeSelect.options.find((option) => option.defaultSelected).value, "ソノバデについて");
  }
});

for (const [request, type] of [["consultation", "ソノバデの無料相談"], ["quote", "ソノバデの見積もり依頼"], ["brochure", "ソノバデの資料請求"], ["", "ソノバデの無料相談"], ["__proto__", "ソノバデの無料相談"]]) {
  test(`dedicated Sonovade form selects ${request || "default"} and passes it to EmailJS`, async () => {
    const fixture = setup({ dedicated: true, search: `?request=${request}` });
    assert.equal(fixture.radios.filter(radio => radio.checked).length, 1);
    assert.equal(fixture.radios.find(radio => radio.checked).value, type);
    assert.equal(fixture.radios.find(radio => radio.defaultChecked).value, type);
    await fixture.submit();
    assert.equal(fixture.sends[0][2].type, type);
    assert.equal(fixture.sends[0][2].company_name, "company_name:private-input");
  });
}

test("dedicated form sends a changed selection instead of its URL default", async () => {
  const fixture = setup({ dedicated: true, search: "?request=brochure" });
  for (const radio of fixture.radios) radio.checked = radio.value === "ソノバデについて";
  await fixture.submit();
  assert.equal(fixture.sends[0][2].type, "ソノバデについて");
});

test("Sonovade business details reach EmailJS parameters and the existing message template", async () => {
  const fixture = setup({ dedicated: true });
  await fixture.submit();
  const payload = fixture.sends[0][2];
  for (const field of ["employee_count", "department", "job_title"]) {
    assert.equal(payload[field], `${field}:private-input`);
    assert.ok(payload.message.includes(`${field}:private-input`));
  }
  assert.ok(payload.message.endsWith("message:private-input"));
});

test("corporate email retains its original message and fields", async () => {
  const fixture = setup();
  await fixture.submit();
  const payload = fixture.sends[0][2];
  assert.equal(payload.message, "message:private-input");
  assert.equal(Object.hasOwn(payload, "department"), false);
  assert.match(payload.form_summary, /Codellを知ったきっかけ: discovery_source:private-input/);
  assert.doesNotMatch(payload.form_summary, /従業員数|部署|役職/);
  for (const field of ["company_name", "name", "email", "discovery_source", "discovery_other", "message"]) {
    assert.ok(payload.form_summary.includes(`${field}:private-input`));
  }
});

test("Sonovade email body includes all form fields, including multiline inquiry text", async () => {
  const fixture = setup({ dedicated: true, search: "?request=quote", values: { message: "1行目\n2行目" } });
  await fixture.submit();
  const [service, template, payload] = fixture.sends[0];
  assert.equal(service, "codell_contact");
  assert.equal(template, "codell_template");
  assert.match(payload.message, /お問い合わせの種類: ソノバデの見積もり依頼/);
  for (const field of ["company_name", "employee_count", "department", "job_title", "name", "email", "discovery_source", "discovery_other"]) {
    assert.ok(payload.message.includes(`${field}:private-input`), `${field} missing from body`);
    assert.equal(payload[field], `${field}:private-input`);
  }
  assert.ok(payload.message.endsWith("問い合わせ内容: 1行目\n2行目"));
  assert.equal(payload.reply_to, payload.email);
  assert.equal(payload.form_summary, payload.message);
});

test("optional blank Sonovade fields are explicit in the email body", async () => {
  const fixture = setup({ dedicated: true, values: { department: "  ", discovery_other: null, message: "" } });
  await fixture.submit();
  const body = fixture.sends[0][2].message;
  for (const label of ["部署", "その他のきっかけ", "問い合わせ内容"]) {
    assert.ok(body.includes(`${label}: 未入力`));
  }
  assert.doesNotMatch(body, /null|undefined/);
});
