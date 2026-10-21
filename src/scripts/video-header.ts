// The header scrolls away with the hero, then slides back in as a fixed bar once the hero is behind the visitor.
const header = document.querySelector<HTMLElement>(".vp-header");
const hero = document.querySelector<HTMLElement>(".vp-hero");

if (header && hero) {
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-fixed", !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }).observe(hero);
}
