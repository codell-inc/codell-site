const header = document.querySelector<HTMLElement>("[data-header]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 10);

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("nav-open", isOpen);
  });
  nav.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("a")) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("nav-open");
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

export {};
