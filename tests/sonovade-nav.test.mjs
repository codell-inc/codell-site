import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/scripts/sonovade-nav.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function element() {
  const classes = new Set();
  return {
    handlers: {}, attributes: {}, focused: false,
    classList: {
      contains: (name) => classes.has(name),
      remove: (name) => classes.delete(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
    },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus() { this.focused = true; },
  };
}

function setup({ play = async () => {}, withVideo = true } = {}) {
  const header = element(), nav = element(), toggle = element(), body = element();
  const video = Object.assign(element(), { controls: true, play });
  const playButton = Object.assign(element(), { hidden: true });
  const document = {
    handlers: {}, body,
    addEventListener(name, handler) { this.handlers[name] = handler; },
    querySelector: (selector) => ({
      "[data-header]": header, "[data-nav]": nav, "[data-nav-toggle]": toggle,
      "[data-movie] video": withVideo ? video : null,
      "[data-play]": withVideo ? playButton : null,
    })[selector] ?? null,
  };
  const media = element();
  const window = Object.assign(element(), { scrollY: 0, matchMedia: () => media });
  vm.runInNewContext(compiled, { exports: {}, document, window });
  return { header, nav, toggle, body, video, playButton, document, window, media };
}

test("header is transparent at top and switches back after scrolling", () => {
  const f = setup({ withVideo: false });
  assert.equal(f.header.classList.contains("is-scrolled"), false);
  f.window.scrollY = 25;
  f.window.handlers.scroll();
  assert.equal(f.header.classList.contains("is-scrolled"), true);
  f.window.scrollY = 0;
  f.window.handlers.scroll();
  assert.equal(f.header.classList.contains("is-scrolled"), false);
});

test("mobile menu closes on Escape and when crossing the breakpoint", () => {
  const f = setup();
  f.toggle.handlers.click();
  assert.equal(f.toggle.attributes["aria-expanded"], "true");
  assert(f.body.classList.contains("nav-open"));
  f.document.handlers.keydown({ key: "Escape" });
  assert.equal(f.toggle.attributes["aria-expanded"], "false");
  assert.equal(f.body.classList.contains("nav-open"), false);
  assert(f.toggle.focused);
  f.toggle.handlers.click();
  f.media.handlers.change();
  assert.equal(f.nav.classList.contains("is-open"), false);
  assert.equal(f.body.classList.contains("nav-open"), false);
});

test("video only starts on explicit click, then exposes native controls", async () => {
  let plays = 0;
  const f = setup({ play: async () => { plays++; } });
  assert.equal(plays, 0);
  assert.equal(f.playButton.hidden, false);
  assert.equal(f.video.controls, false);
  await f.playButton.handlers.click();
  assert.equal(plays, 1);
  assert.equal(f.playButton.hidden, true);
  assert.equal(f.video.controls, true);
});

test("rejected playback remains retryable with native controls", async () => {
  const f = setup({ play: async () => { throw new Error("Playback blocked"); } });
  await f.playButton.handlers.click();
  assert.equal(f.playButton.hidden, false);
  assert.equal(f.video.controls, true);
});
