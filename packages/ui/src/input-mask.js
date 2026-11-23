// File: packages/ui/src/input-mask.js
// Map: named masks (iban, bic, vat, phone) + pattern masks (9 = digit, A = letter, * = any) -> applyMask -> caret position
//      after formatting -> validate (iban mod-97 + country length, bic, BE/NL vat, email, phone) -> bind one input
//      -> init every input[data-oc-mask] / input[data-oc-validate] -> boot
// Live formatting and blur validation for a plain .oc-input, shared by the React and Vue wrappers (pure functions) and by
// Blade/HTML (data attributes + this script, `npx omniaui copy-js input-mask`).
// Markup: <input class="oc-input" data-oc-mask="iban" data-oc-validate="iban" data-oc-validation-message="Not a valid IBAN">
// On blur an invalid value gets aria-invalid="true" + .oc-input--error; inside an .oc-field the message is written into a
// .oc-field-error[data-oc-validation] (made when missing, removed again when the value is valid). A server error that is
// already in the field is left alone.
// Event on the input: oc-input-validate { valid, value, type }.

/** Length of an IBAN per country (ISO 3166 code). */
export const IBAN_LENGTHS = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29, CH: 21, CR: 22, CY: 28, CZ: 24,
  DE: 22, DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27,
  GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LI: 21, LT: 20, LU: 20,
  LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25,
  QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26, UA: 29, VG: 24, XK: 20,
};

const NAMED = new Set(["iban", "bic", "vat", "phone"]);
const alnum = (s) => String(s ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");

/** True for the characters a mask keeps and counts (letters and digits; for a pattern mask also its * slots). */
function significant(ch) {
  return /[0-9A-Za-z]/.test(ch);
}

/** Formats `value` with a pattern: 9 = digit, A = letter, * = any character; other pattern characters are literals. */
export function applyPattern(pattern, value) {
  const raw = String(value ?? "");
  const literals = new Set([...pattern].filter((c) => c !== "9" && c !== "A" && c !== "*"));
  const chars = [...raw].filter((c) => !literals.has(c));
  let out = "";
  let i = 0;
  for (const slot of pattern) {
    if (i >= chars.length) break;
    if (slot === "9" || slot === "A" || slot === "*") {
      // Skip characters that do not fit this slot.
      while (i < chars.length) {
        const c = chars[i++];
        if (slot === "*" || (slot === "9" && /\d/.test(c)) || (slot === "A" && /[A-Za-z]/.test(c))) { out += slot === "A" ? c.toUpperCase() : c; break; }
      }
    } else {
      out += slot;
    }
  }
  return out;
}

/**
 * Formats a value while typing. Named masks: "iban" (capitals, groups of four), "bic" (capitals, 11 at most), "vat"
 * (capitals; BE0123.456.789, NL123456789B01, other countries compact), "phone" (+, digits and single spaces). Any other
 * string is a pattern (9 = digit, A = letter, * = any).
 */
export function applyMask(type, value) {
  const v = String(value ?? "");
  if (!type) return v;
  if (type === "iban") return alnum(v).slice(0, 34).replace(/(.{4})(?=.)/g, "$1 ");
  if (type === "bic") return alnum(v).slice(0, 11);
  if (type === "vat") {
    const c = alnum(v);
    if (/^BE\d/.test(c)) {
      const d = c.slice(2).replace(/\D/g, "").slice(0, 10);
      return `BE${d.slice(0, 4)}${d.length > 4 ? "." + d.slice(4, 7) : ""}${d.length > 7 ? "." + d.slice(7, 10) : ""}`;
    }
    return c.slice(0, 14);
  }
  if (type === "phone") {
    const plus = v.trimStart().startsWith("+") ? "+" : "";
    return plus + v.replace(/[^\d ]/g, "").replace(/ {2,}/g, " ").replace(/^ /, "").slice(0, 20);
  }
  return applyPattern(type, v);
}

/** Caret position in `formatted` after `count` significant characters (letters/digits) of the raw value. */
export function caretFor(formatted, count) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (significant(formatted[i])) seen++;
    if (seen >= count) return i + 1;
  }
  return formatted.length;
}

/** Number of significant characters (letters/digits) before `caret` in `value`. */
export function countBefore(value, caret) {
  return [...String(value).slice(0, caret)].filter(significant).length;
}

/** IBAN check: country length + mod-97. */
export function validIban(value) {
  const c = alnum(value);
  if (!/^[A-Z]{2}\d{2}[0-9A-Z]+$/.test(c)) return false;
  const len = IBAN_LENGTHS[c.slice(0, 2)];
  if (len && c.length !== len) return false;
  if (!len && (c.length < 15 || c.length > 34)) return false;
  const moved = (c.slice(4) + c.slice(0, 4)).replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let rest = 0;
  for (const digit of moved) rest = (rest * 10 + Number(digit)) % 97;
  return rest === 1;
}

/** VAT number: BE (10 digits, mod-97 check), NL (9 digits + B + 2 digits), other EU countries by format only. */
export function validVat(value) {
  const c = alnum(value);
  if (c.startsWith("BE")) {
    const d = c.slice(2);
    if (!/^[01]\d{9}$/.test(d)) return false;
    return 97 - (Number(d.slice(0, 8)) % 97) === Number(d.slice(8));
  }
  if (c.startsWith("NL")) return /^NL\d{9}B\d{2}$/.test(c);
  return /^(AT|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|PL|PT|RO|SE|SI|SK|XI)[0-9A-Z]{2,13}$/.test(c);
}

/**
 * True when `value` is valid for `type` ("iban" | "bic" | "vat" | "email" | "phone"). An empty value is valid: whether a
 * field may be empty is `required`, not this check. An unknown type is valid.
 */
export function validate(type, value) {
  const v = String(value ?? "").trim();
  if (!v || !type) return true;
  if (type === "iban") return validIban(v);
  if (type === "bic") return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(alnum(v));
  if (type === "vat") return validVat(v);
  if (type === "email") return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v);
  if (type === "phone") return /^\+?[\d ()./-]+$/.test(v) && v.replace(/\D/g, "").length >= 6 && v.replace(/\D/g, "").length <= 15;
  return true;
}

/** Formats an input in place and keeps the caret behind the same character. Returns the new value. */
export function maskInput(input, type) {
  const before = input.value;
  const caret = input.selectionStart ?? before.length;
  const count = countBefore(before, caret);
  const next = applyMask(type, before);
  if (next !== before) {
    input.value = next;
    const at = caret >= before.length ? next.length : caretFor(next, count);
    try { input.setSelectionRange(at, at); } catch { /* type=email has no selection API */ }
  }
  return next;
}

/** Writes or removes the validation message of an input inside its .oc-field. */
function showMessage(input, valid, message) {
  const field = input.closest(".oc-field");
  if (!field) return;
  const own = field.querySelector(":scope > .oc-field-error[data-oc-validation]");
  const server = field.querySelector(":scope > .oc-field-error:not([data-oc-validation])");
  const ids = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
  if (valid || server) {
    if (own) {
      input.setAttribute("aria-describedby", ids.filter((id) => id !== own.id).join(" "));
      if (!input.getAttribute("aria-describedby")) input.removeAttribute("aria-describedby");
      own.remove();
    }
    return;
  }
  const p = own ?? field.ownerDocument.createElement("p");
  if (!own) {
    p.className = "oc-field-error";
    p.dataset.ocValidation = "";
    p.setAttribute("role", "alert");
    p.id = `${input.id || "oc-input"}-validation`;
    field.append(p);
  }
  p.textContent = message || "Invalid value";
  if (!ids.includes(p.id)) input.setAttribute("aria-describedby", [...ids, p.id].join(" "));
}

/** Starts one input: data-oc-mask formats while typing, data-oc-validate checks on blur. Returns a stop function. */
export function bindInputMask(input) {
  if (!input || input.dataset.ocMaskBound != null) return () => {};
  input.dataset.ocMaskBound = "";
  const mask = input.dataset.ocMask;
  const type = input.dataset.ocValidate;
  let checked = false;
  const check = () => {
    const valid = validate(type, input.value);
    checked = true;
    input.toggleAttribute("aria-invalid", !valid);
    if (!valid) input.setAttribute("aria-invalid", "true");
    input.classList.toggle("oc-input--error", !valid);
    showMessage(input, valid, input.dataset.ocValidationMessage);
    input.dispatchEvent(new (input.ownerDocument.defaultView ?? globalThis).CustomEvent("oc-input-validate", { bubbles: true, detail: { valid, value: input.value, type } }));
    return valid;
  };
  const onInput = () => {
    if (mask) maskInput(input, mask);
    // Once a value was found wrong, the message goes away as soon as it is right.
    if (type && checked && input.getAttribute("aria-invalid") === "true" && validate(type, input.value)) check();
  };
  const onBlur = () => { if (type) check(); };
  input.addEventListener("input", onInput);
  input.addEventListener("blur", onBlur);
  if (mask && input.value) input.value = applyMask(mask, input.value);
  return () => {
    input.removeEventListener("input", onInput);
    input.removeEventListener("blur", onBlur);
    delete input.dataset.ocMaskBound;
  };
}

/** Starts every input[data-oc-mask] and input[data-oc-validate] in scope. Returns a function that stops them. */
export function initInputMask(scope = document) {
  const stops = [...scope.querySelectorAll("input[data-oc-mask], input[data-oc-validate]")].map(bindInputMask);
  return () => stops.forEach((stop) => stop());
}

export const NAMED_MASKS = [...NAMED];

// Starts on its own as /js/oc-input-mask.js (`npx omniaui copy-js input-mask`), with ?auto in the URL or data-oc-auto on
// the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-input-mask") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initInputMask(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
