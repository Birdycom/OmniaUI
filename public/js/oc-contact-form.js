// File: packages/ui/src/contact-form.js
// Map: messages -> field errors -> busy -> send (fetch, JSON) -> result / errors -> "send another" -> boot
// Contact form without a page reload. The form keeps working without this script (POST + redirect); with it, it sends
// with fetch and shows the result or the errors in place.
// Protocol: POST the FormData to form.action with "Accept: application/json"; the server answers
// { sent: true } (200) or { sent: false, errors: { field: "message", form?: "message" } } (422); a list per field
// (Laravel: { errors: { email: ["…"] } }) shows its first message.
// Markup (data attributes, all inside [data-contact-root] or the document):
//   form[data-contact-form]        the form (novalidate); [data-contact-submit] its button, [data-contact-label] the text
//   [data-contact-body]            what hides after sending (title, intro, alert, form)
//   [data-contact-success]         the .oc-result that shows after sending (hidden, role="status", tabindex="-1")
//   [data-contact-alert]           the .oc-alert above the form (hidden), for errors.form or the general message
//   [data-contact-again]           the "Send another message" link or button in the result
// Field errors: aria-invalid="true" + aria-describedby on the field and <p class="oc-field-error" id="err-<name>">.
// Texts: data-busy-label, data-error-fields, data-error-network on the form (English by default).

const TEXT = {
  busy: "Sending…",
  fields: "Please check the fields in red.",
  network: "Sending failed. Check your connection, or mail or call us directly.",
};

function clearFieldError(field) {
  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");
  field.ownerDocument.getElementById(`err-${field.name}`)?.remove();
}

function setFieldError(field, message) {
  const error = field.ownerDocument.createElement("p");
  error.className = "oc-field-error";
  error.id = `err-${field.name}`;
  error.textContent = message;
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", error.id);
  field.insertAdjacentElement("afterend", error);
}

/** Send one form[data-contact-form] with fetch and show the result or the errors in place. */
export function initContactForm(form) {
  if (!form || form.dataset.ocBound !== undefined || typeof fetch === "undefined") return;
  form.dataset.ocBound = "";
  const root = form.closest("[data-contact-root]") || form.ownerDocument;
  const body = root.querySelector("[data-contact-body]");
  const success = root.querySelector("[data-contact-success]");
  const alertBox = root.querySelector("[data-contact-alert]");
  const button = form.querySelector("[data-contact-submit]") || form.querySelector('[type="submit"]');
  const label = form.querySelector("[data-contact-label]");
  const idleLabel = label?.textContent ?? "";
  const text = {
    busy: form.dataset.busyLabel || TEXT.busy,
    fields: form.dataset.errorFields || TEXT.fields,
    network: form.dataset.errorNetwork || TEXT.network,
  };

  const showAlert = (message) => {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.hidden = message === "";
  };

  const setBusy = (busy) => {
    if (button) button.disabled = busy;
    form.setAttribute("aria-busy", String(busy));
    if (label) label.textContent = busy ? text.busy : idleLabel;
  };

  // A field you change loses its error at once.
  form.addEventListener("input", (event) => {
    if (event.target.name) clearFieldError(event.target);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.querySelectorAll("[aria-invalid]").forEach(clearFieldError);
    showAlert("");
    setBusy(true);
    try {
      const response = await fetch(form.action, {
        method: (form.getAttribute("method") || "POST").toUpperCase(),
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (result.sent) {
        form.reset();
        if (body) body.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus({ preventScroll: true });
          success.scrollIntoView?.({ behavior: "smooth", block: "center" });
        }
        form.dispatchEvent(new CustomEvent("oc-contact-sent", { bubbles: true }));
        return;
      }
      // Laravel sends a list per field ({ email: ["…"] }): the first message is shown.
      const first = (message) => (Array.isArray(message) ? message[0] : message);
      const errors = result.errors || {};
      for (const [name, message] of Object.entries(errors)) {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLElement && "name" in field) setFieldError(field, first(message));
      }
      showAlert(first(errors.form) || text.fields);
      (form.querySelector('[aria-invalid="true"]') || alertBox)?.focus?.();
    } catch {
      showAlert(text.network);
    } finally {
      setBusy(false);
    }
  });

  // "Send another message": the form comes back without a reload.
  root.querySelector("[data-contact-again]")?.addEventListener("click", (event) => {
    event.preventDefault();
    if (success) success.hidden = true;
    if (body) body.hidden = false;
    form.querySelector("input:not([type=hidden]):not([tabindex='-1']), textarea, select")?.focus();
  });
}

/** Bind every contact form under scope. */
export function initContactForms(scope = document) {
  scope.querySelectorAll("form[data-contact-form]").forEach(initContactForm);
}

// Starts on its own as /js/oc-contact-form.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-contact-form") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initContactForms(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
