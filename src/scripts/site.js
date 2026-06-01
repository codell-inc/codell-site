const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

if (header && nav && navToggle) {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    header.classList.toggle("is-open", isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.matches("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      header.classList.remove("is-open");
    }
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

const EMAILJS_CONFIG = {
  publicKey: "zW5BfPsT1UBqvxMTr",
  serviceId: "codell_contact",
  templateId: "codell_template",
};

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!(form instanceof HTMLFormElement)) return;

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
      setStatus("送信設定が未完了です。管理者にお問い合わせください。", "error");
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

    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
    setStatus("送信中...", "loading");

    try {
      await window.emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        params,
      );
      setStatus("送信が完了しました。担当者よりご連絡いたします。", "success");
      form.reset();
    } catch (err) {
      console.error("EmailJS send failed", err);
      setStatus("送信に失敗しました。お手数ですがメールで直接ご連絡ください。", "error");
    } finally {
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
    }
  });
}

initContactForm();
