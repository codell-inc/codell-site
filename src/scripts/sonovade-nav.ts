const header = document.querySelector<HTMLElement>("[data-header]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);

const closeNav = () => {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "メニューを開く");
  document.body.classList.remove("nav-open");
};

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("nav-open", isOpen);
  });
  nav.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("a")) return;
    closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });
  window.matchMedia("(max-width: 760px)").addEventListener("change", closeNav);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const video = document.querySelector<HTMLVideoElement>("[data-movie] video");
const playButton = document.querySelector<HTMLButtonElement>("[data-play]");
if (video && playButton) {
  video.controls = true;
  video.muted = true;
  playButton.hidden = true;
  const startPlayback = async (focus = false) => {
    playButton.hidden = true;
    try {
      await video.play();
      if (focus) video.focus();
    } catch {
      playButton.hidden = false;
    }
  };
  playButton.addEventListener("click", () => startPlayback(true));
  // Attempt once on arrival, so scrolling cannot override a visitor's later pause.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) return;
      observer.disconnect();
      void startPlayback();
    }, { threshold: 0.25 });
    observer.observe(video);
  } else {
    void startPlayback();
  }
  video.addEventListener("playing", () => { playButton.hidden = true; });
  video.addEventListener("error", () => {
    video.controls = true;
    playButton.hidden = true;
  });
}

const dialog = document.querySelector<HTMLDialogElement>("[data-screen-dialog]");
const enlargedImage = dialog?.querySelector<HTMLImageElement>("[data-dialog-image]");
if (dialog && enlargedImage) {
  document.querySelectorAll<HTMLButtonElement>("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      const original = button.querySelector("img");
      if (!original) return;
      enlargedImage.src = original.dataset.full ?? original.currentSrc;
      enlargedImage.alt = original.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

export {};
