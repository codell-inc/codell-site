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

function setup({ play = async () => {}, withVideo = true, withObserver = true } = {}) {
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
  let observer;
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }
  const window = Object.assign(element(), { scrollY: 0, matchMedia: () => media }, withObserver ? { IntersectionObserver } : {});
  vm.runInNewContext(compiled, { exports: {}, document, window, IntersectionObserver });
  return { header, nav, toggle, body, video, playButton, document, window, media, observer };
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

test("video starts muted on entering the viewport, without stealing focus", async () => {
  let plays = 0;
  const f = setup({ play: async () => { plays++; } });
  assert.equal(plays, 0);
  assert.equal(f.playButton.hidden, true);
  assert.equal(f.video.controls, true);
  assert.equal(f.video.muted, true);
  f.observer.callback([{ isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(plays, 0);
  f.observer.callback([{ isIntersecting: true, intersectionRatio: 0.25 }]);
  await Promise.resolve();
  assert.equal(plays, 1);
  assert.equal(f.observer.disconnected, true);
  assert.equal(f.video.focused, false);
  assert.equal(f.playButton.hidden, true);
  assert.equal(f.video.controls, true);
});

test("rejected playback remains retryable with native controls", async () => {
  let attempts = 0;
  const f = setup({ play: async () => { if (++attempts === 1) throw new Error("Playback blocked"); } });
  f.observer.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
  await new Promise(setImmediate);
  assert.equal(f.playButton.hidden, false);
  assert.equal(f.video.controls, true);
  await f.playButton.handlers.click();
  assert.equal(attempts, 2);
  assert.equal(f.playButton.hidden, true);
  assert.equal(f.video.focused, true);
});

test("autoplay falls back without IntersectionObserver", async () => {
  let plays = 0;
  const f = setup({ withObserver: false, play: async () => { plays++; } });
  await Promise.resolve();
  assert.equal(plays, 1);
  assert.equal(f.video.muted, true);
});
