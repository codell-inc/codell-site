const carousel = document.querySelector<HTMLElement>("[data-process-carousel]");

if (carousel) {
  const slides = [...carousel.querySelectorAll<HTMLElement>("[data-process-slide]")];
  const images = [...carousel.querySelectorAll<HTMLImageElement>("[data-process-image]")];
  const tabs = [...carousel.querySelectorAll<HTMLButtonElement>("[data-process-tab]")];
  const previous = carousel.querySelector<HTMLButtonElement>("[data-process-prev]");
  const next = carousel.querySelector<HTMLButtonElement>("[data-process-next]");
  const status = carousel.querySelector<HTMLElement>("[data-process-status]");

  if (slides.length && images.length === slides.length && tabs.length === slides.length && previous && next && status) {
    const titles = slides.map((slide) => slide.querySelector("h4")?.textContent ?? "");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autoplayDelay = 3200;
    let activeIndex = 0;
    let autoplayTimer: number | undefined;

    const showProcess = (index: number, moveFocus = false) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      carousel.style.setProperty("--process-index", String(activeIndex));

      slides.forEach((slide, slideIndex) => slide.setAttribute("aria-hidden", String(slideIndex !== activeIndex)));
      images.forEach((image, imageIndex) => {
        const isActive = imageIndex === activeIndex;
        image.classList.toggle("is-active", isActive);
        image.setAttribute("aria-hidden", String(!isActive));
      });
      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === activeIndex;
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === slides.length - 1;
      status.textContent = `プロセス ${activeIndex + 1} / ${slides.length}：${titles[activeIndex]}`;
      if (moveFocus) tabs[activeIndex].focus();
    };

    const stopAutoplay = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = undefined;
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (prefersReducedMotion.matches || carousel.matches(":hover") || carousel.contains(document.activeElement)) return;
      autoplayTimer = window.setInterval(() => showProcess((activeIndex + 1) % slides.length), autoplayDelay);
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        showProcess(Number(tab.dataset.processTab));
        startAutoplay();
      });
      tab.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          showProcess(activeIndex + (event.key === "ArrowRight" ? 1 : -1), true);
        }
      });
    });
    previous.addEventListener("click", () => { showProcess(activeIndex - 1); startAutoplay(); });
    next.addEventListener("click", () => { showProcess(activeIndex + 1); startAutoplay(); });
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", (event) => {
      if (!(event.relatedTarget instanceof Node) || !carousel.contains(event.relatedTarget)) startAutoplay();
    });
    document.addEventListener("visibilitychange", () => document.hidden ? stopAutoplay() : startAutoplay());
    prefersReducedMotion.addEventListener("change", startAutoplay);
    showProcess(0);
    startAutoplay();
  }
}

export {};
