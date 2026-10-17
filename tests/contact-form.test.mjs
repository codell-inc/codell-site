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

function setup({ valid = true, send = async () => {}, tag = "present", sendTo = destination, search = "" } = {}) {
  const conversions = [];
  const sends = [];
  const errors = [];
  const listeners = {};
  const status = { textContent: "", dataset: {} };
  const button = { disabled: false };
  const form = {
    resets: 0,
    reports: 0,
    checkValidity: () => valid,
    reportValidity() { this.reports++; },
    reset() { this.resets++; },
    addEventListener(name, listener) { listeners[name] = listener; },
  };
  const options = ["", "ソノバデについて", "KiDUKiについて", "プロダクト開発相談", "その他"].map((value) => ({ value, selected: value === "", defaultSelected: value === "" }));
  const typeSelect = { options };
  const elements = { "#contact-form": form, "#contact-status": status, "#contact-submit": button, "#contact-type": typeSelect };
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
    document: { querySelector: (selector) => elements[selector] ?? null },
    FormData: class { get(name) { return `${name}:private-input`; } },
    window,
    URLSearchParams,
    console: { error: (...args) => errors.push(args) },
  });
  return { typeSelect, form, status, button, conversions, sends, errors, submit: () => listeners.submit({ preventDefault() {} }) };
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
  for (const search of ["", "?product=unknown"]) {
    const fixture = setup({ search });
    assert.equal(fixture.typeSelect.options[0].selected, true);
    assert.equal(fixture.typeSelect.options[1].selected, false);
  }
});
