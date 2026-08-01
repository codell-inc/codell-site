const header = document.querySelector<HTMLElement>("[data-header]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");

if (header && nav && navToggle) {
  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
    header.classList.remove("is-open");
    nav.querySelectorAll("details[open]").forEach((item) => item.removeAttribute("open"));
  };

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 16);

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    header.classList.toggle("is-open", isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeNav();
  });

  document.addEventListener("click", (event) => {
    nav.querySelectorAll<HTMLDetailsElement>("[data-nav-services][open]").forEach((item) => {
      if (!(event.target instanceof Node) || !item.contains(event.target)) item.removeAttribute("open");
    });
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

export {};
