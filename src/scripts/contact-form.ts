import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY ?? "zW5BfPsT1UBqvxMTr",
  serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID ?? "codell_contact",
  templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID ?? "codell_template",
};

const form = document.querySelector<HTMLFormElement>("#contact-form");
const status = document.querySelector<HTMLElement>("#contact-status");
const submitButton = document.querySelector<HTMLButtonElement>("#contact-submit");
const discoverySelect = document.querySelector<HTMLSelectElement>("#contact-discovery");
const discoveryOtherField = document.querySelector<HTMLElement>("#contact-discovery-other-field");
const discoveryOtherInput = document.querySelector<HTMLInputElement>("#contact-discovery-other");

if (form && status && submitButton) {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

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
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
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
    } catch (error) {
      console.error("EmailJS send failed", error);
      setStatus("送信に失敗しました。時間をおいて再度お試しください。", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
