/** Tracks the actual hero bounds, including after viewport resizes. */
export function observeHeroVisibility(node: HTMLElement, setVisible: (visible: boolean) => void) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) setVisible(entry.isIntersecting);
    },
    { threshold: 0 },
  );
  observer.observe(node);
  return () => observer.disconnect();
}
