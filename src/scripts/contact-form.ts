import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY ?? "zW5BfPsT1UBqvxMTr",
  serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID ?? "codell_contact",
  templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID ?? "codell_template",
};

const GOOGLE_ADS_CONTACT_SEND_TO =
  import.meta.env.PUBLIC_GOOGLE_ADS_CONTACT_SEND_TO ?? "AW-18448674355/3cp0COiC5ZAdELPcgd1E";

const trackContactConversion = () => {
  if (!GOOGLE_ADS_CONTACT_SEND_TO) return;
  try {
    const gtag = (window as Window & {
      gtag?: (command: "event", event: "conversion", parameters: { send_to: string }) => void;
    }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "conversion", { send_to: GOOGLE_ADS_CONTACT_SEND_TO });
    }
  } catch {
    // Tracking must not change the result of a completed email submission.
  }
};

const form = document.querySelector<HTMLFormElement>("#contact-form");
const status = document.querySelector<HTMLElement>("#contact-status");
const submitButton = document.querySelector<HTMLButtonElement>("#contact-submit");
const typeSelect = document.querySelector<HTMLSelectElement>("#contact-type");
const discoverySelect = document.querySelector<HTMLSelectElement>("#contact-discovery");
const discoveryOtherField = document.querySelector<HTMLElement>("#contact-discovery-other-field");
const discoveryOtherInput = document.querySelector<HTMLInputElement>("#contact-discovery-other");

if (form && status && submitButton) {
  if (typeSelect && new URLSearchParams(window.location.search).get("product") === "sonovade") {
    const option = Array.from(typeSelect.options).find((option) => option.value === "ソノバデについて");
    if (option) {
      for (const candidate of Array.from(typeSelect.options)) candidate.defaultSelected = candidate === option;
      option.selected = true;
    }
  }

  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  let isSubmitting = false;

  const setStatus = (message: string, state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const updateDiscoveryOther = () => {
    if (!discoverySelect || !discoveryOtherField || !discoveryOtherInput) return;
    const isOther = discoverySelect.value === "その他";
    discoveryOtherField.hidden = !isOther;
    discoveryOtherInput.required = isOther;
    if (!isOther) discoveryOtherInput.value = "";
  };

  discoverySelect?.addEventListener("change", updateDiscoveryOther);
  updateDiscoveryOther();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    isSubmitting = true;
    submitButton.disabled = true;
    setStatus("送信中…", "loading");

    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        company_name: formData.get("company_name"),
        name: formData.get("name"),
        email: formData.get("email"),
        type: formData.get("type"),
        discovery_source: formData.get("discovery_source"),
        discovery_other: formData.get("discovery_other"),
        message: formData.get("message"),
        reply_to: formData.get("email"),
      });
      setStatus("送信が完了しました。担当者よりご連絡いたします。", "success");
      form.reset();
      updateDiscoveryOther();
      trackContactConversion();
    } catch (error) {
      console.error("EmailJS send failed", error);
      setStatus("送信に失敗しました。時間をおいて再度お試しください。", "error");
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });
}
