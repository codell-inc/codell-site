const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

// ── Features ──────────────────────────────────────────
class FeatureContents {
  constructor({ id, title, date, onClick = null }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.onClick = onClick;
  }
}

const features = [
  new FeatureContents({
    id: "dcon2026",
    title: "介護現場特化のARシステム開発で事業評価額2億4000万円を認定されました。",
    date: "2026/05/09",
    onClick: () => window.open("https://dcon.ai/teams/kamiyama2026/", "_blank"),
  }),
];

function renderFeatures() {
  const list = document.querySelector("[data-features-list]");
  if (!list) return;
  list.innerHTML = features
    .map(
      (f) => `
    <li class="feature-item${f.onClick ? " feature-item--clickable" : ""}"${f.onClick ? ` data-feature-id="${f.id}"` : ""}>
      <time class="feature-date" datetime="${f.date}">${f.date}</time>
      <p class="feature-title">${f.title}</p>
    </li>`
    )
    .join("");
  list.querySelectorAll("[data-feature-id]").forEach((el) => {
    const feature = features.find((f) => f.id === el.dataset.featureId);
    if (feature?.onClick) el.addEventListener("click", feature.onClick);
  });
}

renderFeatures();
// ─────────────────────────────────────────────────────

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    header.classList.remove("is-open");
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
