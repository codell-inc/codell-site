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
    id: "dcon2026-awards",
    title: "ARを用いた介護DXサービスがトヨタ自動車および文部科学大臣より評価され、表彰されました。",
    date: "2026/05/09",
    onClick: () => window.open("https://dcon.ai/teams/kamiyama2026/", "_blank"),
  }),
  new FeatureContents({
    id: "dcon2026",
    title: "介護現場特化のARシステム開発で事業評価額2億4000万円を認定されました。",
    date: "2026/05/09",
    onClick: () => window.open("https://dcon.ai/teams/kamiyama2026/", "_blank"),
  }),
  new FeatureContents({
    id: "kencho2026",
    title: "県庁に表敬訪問しました",
    date: "2026/05/22",
    onClick: () => window.open("https://x.com/preftokushima/status/2057692326873739371?s=20", "_blank"),
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

// ── Contact form (EmailJS) ────────────────────────────
const EMAILJS_CONFIG = {
  publicKey: "zW5BfPsT1UBqvxMTr",
  serviceId: "codell_contact",
  templateId: "codell_template",
};

(function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-status");
  const submitBtn = document.getElementById("contact-submit");

  if (window.emailjs && typeof window.emailjs.init === "function") {
    try {
      window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    } catch (e) {
      console.error("EmailJS init failed", e);
    }
  }

  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!window.emailjs) {
      setStatus(
        "送信設定が未完了です。管理者にお問い合わせください。",
        "error"
      );
      return;
    }

    const formData = new FormData(form);
    const params = {
      name: formData.get("name"),
      email: formData.get("email"),
      type: formData.get("type"),
      message: formData.get("message"),
      reply_to: formData.get("email"),
    };

    submitBtn.disabled = true;
    setStatus("送信中…", "loading");

    try {
      await window.emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        params
      );
      setStatus("送信が完了しました。担当者よりご連絡いたします。", "success");
      form.reset();
    } catch (err) {
      console.error("EmailJS send failed", err);
      setStatus(
        "送信に失敗しました。お手数ですがメールで直接ご連絡ください。",
        "error"
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

