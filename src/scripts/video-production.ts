document.querySelectorAll<HTMLElement>("[data-video-card]").forEach((card) => {
  const video = card.querySelector<HTMLVideoElement>("video");
  const cover = card.querySelector<HTMLButtonElement>(".vp-video-cover");
  const buttons = card.querySelectorAll<HTMLButtonElement>("[data-video-play]");
  if (!video || !cover) return;

  // Keep the native player available when JavaScript is unavailable.
  video.controls = false;
  cover.hidden = false;
  const showPlayer = () => {
    cover.hidden = true;
    video.controls = true;
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    showPlayer();
    video.focus();
    void video.play().catch(() => {
      // Native controls let the visitor retry if playback is unavailable.
    });
  }));
  video.addEventListener("play", () => {
    showPlayer();
    document.querySelectorAll<HTMLVideoElement>(".vp-player video").forEach((other) => {
      if (other !== video) other.pause();
    });
  });
  video.addEventListener("ended", () => {
    video.controls = false;
    cover.hidden = false;
  });
  video.addEventListener("error", showPlayer);
});

// The hero loop is decorative, so visitors who prefer reduced motion see its poster frame instead.
const heroVideo = document.querySelector<HTMLVideoElement>("[data-hero-video]");
if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
}
