import { stat } from "node:fs/promises";
import { expect, it, vi } from "vitest";
import { observeHeroVisibility } from "../src/lib/features/landing/hero-visibility";

it("keeps the header transparent until the hero leaves, restores it on return, and disconnects", () => {
  let notify: IntersectionObserverCallback = () => undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const observer = { observe, disconnect };
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        notify = callback;
        expect(options.threshold).toBe(0);
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  try {
    const node = {} as HTMLElement;
    const setVisible = vi.fn();
    const cleanup = observeHeroVisibility(node, setVisible);
    expect(observe).toHaveBeenCalledWith(node);
    for (const visible of [true, false, true]) {
      notify(
        [{ isIntersecting: visible } as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver,
      );
      expect(setVisible).toHaveBeenLastCalledWith(visible);
    }
    cleanup();
    expect(disconnect).toHaveBeenCalledOnce();
  } finally {
    vi.unstubAllGlobals();
  }
});

it("ships the hero video as a nonempty public asset", async () => {
  const video = await stat(new URL("../static/videos/hero.mp4", import.meta.url));
  expect(video.size).toBeGreaterThan(0);
});
