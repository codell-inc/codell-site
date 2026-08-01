const showcase = document.querySelector<HTMLElement>("[data-product-showcase]");

if (showcase) {
  const features = [...showcase.querySelectorAll<HTMLButtonElement>("[data-product-feature]")];
  const media = [...showcase.querySelectorAll<HTMLVideoElement>("[data-product-media]")];
  const captionIndex = showcase.querySelector<HTMLElement>("[data-product-caption-index]");
  const caption = showcase.querySelector<HTMLElement>("[data-product-caption]");

  if (features.length && media.length && captionIndex && caption) {
    const showFeature = (key: string, moveFocus = false) => {
      const activeIndex = features.findIndex((feature) => feature.dataset.productFeature === key);
      if (activeIndex < 0) return;

      features.forEach((feature, index) => {
        const isActive = index === activeIndex;
        feature.classList.toggle("is-active", isActive);
        feature.setAttribute("aria-selected", String(isActive));
        feature.tabIndex = isActive ? 0 : -1;
      });
      media.forEach((item) => {
        const isActive = item.dataset.productMedia === key;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-hidden", String(!isActive));
        if (isActive) item.play().catch(() => undefined);
        else item.pause();
      });

      const activeFeature = features[activeIndex];
      captionIndex.textContent = activeFeature.dataset.featureIndex ?? "";
      caption.textContent = activeFeature.querySelector("strong")?.textContent ?? "";
      if (moveFocus) activeFeature.focus();
    };

    features.forEach((feature, index) => {
      feature.addEventListener("click", () => showFeature(feature.dataset.productFeature ?? ""));
      feature.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (index + direction + features.length) % features.length;
        showFeature(features[nextIndex].dataset.productFeature ?? "", true);
      });
    });
    showFeature(features[0].dataset.productFeature ?? "");
  }
}

export {};
