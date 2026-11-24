// File: packages/ui/src/form-extras.js
// Map: ISO week -> date field (week label) -> name card (rename) -> avatar picker (preview, drop, remove) -> quantity
//      (step buttons) -> language code (the closed code select) -> one-time code (active cell, 0.17.1) -> init -> boot
// 0.18.0: time picker (slots in a popover fill the field). 0.18.0: phone input (grouping per country, also on a country
// change) and select-on-focus (input[data-oc-select-on-focus]).
// Small behaviour for six CSS components; each works without it (native date input, <details>, file input, number input,
// native select, one text input).
// Events on the component root: oc-namecard-rename { name }, oc-avatar-change { file } (null when removed),
// oc-avatar-invalid { file, reason } (wrong type or too large).

/** ISO 8601 week of a date: { week, year } (the week with the year's first Thursday is week 1). */
export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil(((d - yearStart) / 86400000 + 1) / 7), year: d.getUTCFullYear() };
}

/** .oc-date-field: write "Week 45" (or the template in data-oc-week, e.g. "W{week} · {year}") into its __week. */
export function bindDateField(root) {
  const input = root.querySelector(".oc-date-field__input");
  const out = root.querySelector(".oc-date-field__week");
  if (!input || !out || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const template = out.dataset.ocWeek || "Week {week}";
  const show = () => {
    const [y, m, d] = (input.value || "").split("-").map(Number);
    if (!y) { out.textContent = ""; return; }
    const { week, year } = isoWeek(new Date(y, m - 1, d));
    out.textContent = template.replace("{week}", String(week)).replace("{year}", String(year));
  };
  input.addEventListener("input", show);
  input.addEventListener("change", show);
  show();
}

/** .oc-name-card: the [data-oc-rename] button swaps the title for an input; Enter or blur saves, Escape cancels. */
export function bindNameCard(root) {
  const head = root.querySelector(":scope > .oc-name-card__head");
  const title = head?.querySelector(".oc-name-card__title");
  const button = head?.querySelector("[data-oc-rename]");
  if (!title || !button || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const input = document.createElement("input");
  input.className = "oc-name-card__input";
  input.hidden = true;
  input.setAttribute("aria-label", button.getAttribute("aria-label") || "Name");
  title.after(input);
  const finish = (save) => {
    if (input.hidden) return;
    const name = input.value.trim();
    if (save && name && name !== title.textContent) {
      title.textContent = name;
      root.dispatchEvent(new CustomEvent("oc-namecard-rename", { bubbles: true, detail: { name } }));
    }
    input.hidden = true;
    title.hidden = false;
    button.focus();
  };
  button.addEventListener("click", (event) => {
    event.preventDefault(); // a button in <summary> would also toggle the card
    input.value = title.textContent.trim();
    title.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  });
  // Typing in the input must not toggle the card (Space and Enter in a <summary>).
  input.addEventListener("click", (event) => event.preventDefault());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); finish(true); }
    if (event.key === "Escape") { event.preventDefault(); finish(false); }
    if (event.key === " ") event.stopPropagation();
  });
  input.addEventListener("keyup", (event) => { if (event.key === " ") event.preventDefault(); });
  input.addEventListener("blur", () => finish(true));
}

/** Does file match an accept list ("image/*", "image/png,.svg")? An empty list accepts images only. */
export function acceptsFile(file, accept = "image/*") {
  if (!file) return false;
  const rules = (accept || "image/*").split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return rules.some((r) => (r.startsWith(".") ? name.endsWith(r) : r.endsWith("/*") ? type.startsWith(r.slice(0, -1)) : type === r));
}

/** .oc-avatar-picker: preview the chosen or dropped image; [data-oc-avatar-remove] goes back to the initials.
 *  A file that does not match the input's accept (a PDF picked through "All files") or is larger than
 *  data-oc-max-kb is refused: the input is cleared and .oc-avatar-picker__error says why (oc-avatar-invalid). */
export function bindAvatarPicker(root) {
  const preview = root.querySelector(".oc-avatar-picker__preview");
  const file = root.querySelector(".oc-avatar-picker__file");
  if (!preview || !file || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const initials = preview.querySelector("[data-oc-initials]") || null;
  let url = "";
  const error = (text) => {
    let box = root.querySelector(".oc-avatar-picker__error");
    if (!box && text) {
      box = document.createElement("span");
      box.className = "oc-avatar-picker__error";
      box.setAttribute("role", "alert");
      (root.querySelector(".oc-avatar-picker__text") || root).append(box);
    }
    if (box) { box.textContent = text; box.hidden = !text; }
    root.classList.toggle("is-invalid", Boolean(text));
  };
  const show = (picked) => {
    if (url) URL.revokeObjectURL(url);
    url = "";
    preview.querySelector("img")?.remove();
    if (initials) initials.hidden = Boolean(picked);
    if (picked) {
      url = URL.createObjectURL(picked);
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      preview.prepend(img);
    }
    root.dispatchEvent(new CustomEvent("oc-avatar-change", { bubbles: true, detail: { file: picked || null } }));
  };
  const take = (picked) => {
    if (!picked) return show(null);
    const maxKb = Number(root.dataset.ocMaxKb || 0);
    const reason = !acceptsFile(picked, file.accept) ? (root.dataset.ocTypeError || "This file is not an image. Choose a PNG, JPG, WebP or SVG.")
      : maxKb && picked.size > maxKb * 1024 ? (root.dataset.ocSizeError || `This image is larger than ${maxKb >= 1024 ? `${Math.round(maxKb / 102.4) / 10} MB` : `${maxKb} KB`}.`) : "";
    if (reason) {
      file.value = "";
      error(reason);
      root.dispatchEvent(new CustomEvent("oc-avatar-invalid", { bubbles: true, detail: { file: picked, reason } }));
      return;
    }
    error("");
    show(picked);
  };
  file.addEventListener("change", () => take(file.files?.[0] || null));
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-oc-avatar-upload]")) file.click();
    if (event.target.closest("[data-oc-avatar-remove]")) { file.value = ""; error(""); show(null); }
  });
  root.addEventListener("dragover", (event) => { event.preventDefault(); root.classList.add("is-dragover"); });
  root.addEventListener("dragleave", () => root.classList.remove("is-dragover"));
  root.addEventListener("drop", (event) => {
    event.preventDefault();
    root.classList.remove("is-dragover");
    const picked = event.dataTransfer?.files?.[0];
    if (!picked) return;
    // A dropped file never reaches the input, so put it there for the form (where the browser allows it).
    if (acceptsFile(picked, file.accept)) try { const dt = new DataTransfer(); dt.items.add(picked); file.files = dt.files; } catch { /* old browsers */ }
    take(picked);
  });
}

/** Next value of a quantity: one step (data-oc-step = -1 or 1) within min and max, on the step grid. */
export function stepQuantity(value, direction, { min = -Infinity, max = Infinity, step = 1 } = {}) {
  const size = step > 0 ? step : 1;
  const base = Number.isFinite(min) ? min : 0;
  const current = Number.isFinite(value) ? value : base;
  // Off the step grid (2.5 with step 1), the first step lands on the grid: 3 up, 2 down.
  const k = (current - base) / size;
  const onGrid = Math.abs(k - Math.round(k)) < 1e-9;
  const next = onGrid ? current + direction * size : base + (direction > 0 ? Math.ceil(k) : Math.floor(k)) * size;
  return Math.min(max, Math.max(min, Number(next.toFixed(6))));
}

/** .oc-quantity: the [data-oc-step] buttons change the number input and disable themselves at min / max. */
export function bindQuantity(root) {
  const input = root.querySelector(".oc-quantity__input");
  if (!input || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const num = (attr, fallback) => (input.getAttribute(attr) === null || input.getAttribute(attr) === "" ? fallback : Number(input.getAttribute(attr)));
  const limits = () => ({ min: num("min", -Infinity), max: num("max", Infinity), step: num("step", 1) });
  const sync = () => {
    const { min, max } = limits();
    const value = Number(input.value);
    root.querySelectorAll("[data-oc-step]").forEach((button) => {
      const down = Number(button.dataset.ocStep) < 0;
      button.disabled = input.disabled || (down ? value <= min : value >= max);
    });
  };
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-oc-step]");
    if (!button || !root.contains(button) || input.disabled || input.readOnly) return;
    const next = stepQuantity(Number(input.value), Number(button.dataset.ocStep) < 0 ? -1 : 1, limits());
    if (String(next) === input.value) return;
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  sync();
}

/** The code shown by a closed .oc-language-select--code: the chosen option's data-code, else its value, upper case. */
export function languageCode(select) {
  const option = select.selectedOptions?.[0] ?? select.options?.[select.selectedIndex];
  return String(option?.dataset.code || select.value || "").toUpperCase();
}

/** .oc-language-select--code: keep data-code on the wrapper in step with the select. */
export function bindLanguageCode(root) {
  const select = root.querySelector("select");
  if (!select || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const sync = () => { root.dataset.code = languageCode(select); };
  select.addEventListener("change", sync);
  sync();
}

/** The cell the caret is in (0-based) for a one-time code of `length` cells: the next empty cell, the last one when full. */
export function otpActiveCell(selectionStart, valueLength, length) {
  const at = Math.min(selectionStart ?? valueLength, valueLength);
  return Math.max(0, Math.min(at, length - 1));
}

/** .oc-otp (0.17.1): marks the cell the caret is in (data-otp-active + --oc-otp-active) while the field has focus,
 *  so a visitor sees which cell the next character goes to. The whole field still shows its own focus ring. */
export function bindOtp(input) {
  if (!input || input.dataset.ocOtpBound != null) return () => {};
  input.dataset.ocOtpBound = "";
  const update = () => {
    if (document.activeElement !== input) { input.removeAttribute("data-otp-active"); return; }
    const length = Number(input.maxLength > 0 ? input.maxLength : 6);
    const cell = otpActiveCell(input.selectionStart, input.value.length, length);
    input.style.setProperty("--oc-otp-active", String(cell));
    input.setAttribute("data-otp-active", String(cell));
  };
  // The caret moves after keydown and click: read it on the next frame.
  const later = () => requestAnimationFrame(update);
  const events = ["focus", "blur", "input", "select", "keyup", "keydown", "click", "pointerup"];
  events.forEach((type) => input.addEventListener(type, type === "keydown" || type === "click" ? later : update));
  if (document.activeElement === input) update();
  return () => {
    events.forEach((type) => input.removeEventListener(type, type === "keydown" || type === "click" ? later : update));
    delete input.dataset.ocOtpBound;
    input.removeAttribute("data-otp-active");
  };
}

/**
 * 0.18.0: .oc-time-picker (a time field with its slots in a native popover): a picked slot goes into the field (with
 * input and change events, so frameworks and wire:model see it) and closes the popover; on opening, the slot of the
 * current value is checked. Typing in the field keeps working as before.
 */
export function bindTimePicker(root) {
  const input = root.querySelector(".oc-time-input");
  const panel = root.querySelector("[popover]");
  if (!input || !panel || root.dataset.ocBound !== undefined) return;
  root.dataset.ocBound = "";
  panel.addEventListener("change", (event) => {
    const radio = event.target;
    if (!radio || radio.tagName !== "INPUT" || radio.type !== "radio") return;
    const Ev = input.ownerDocument.defaultView?.Event ?? Event;
    input.value = radio.value;
    input.dispatchEvent(new Ev("input", { bubbles: true }));
    input.dispatchEvent(new Ev("change", { bubbles: true }));
    if (typeof panel.hidePopover === "function" && panel.matches(":popover-open")) panel.hidePopover();
    input.focus();
  });
  panel.addEventListener("toggle", (event) => {
    if (event.newState !== "open") return;
    panel.querySelectorAll('input[type="radio"]').forEach((radio) => { radio.checked = radio.value === input.value; });
  });
}

/**
 * 0.18.0: input[data-oc-select-on-focus] (Blade time-input select-on-focus, on by default with slots-popover): the whole
 * value is selected when the field gets focus (a click or Tab), so the first key types over it. A click focuses on
 * mousedown and would drop the selection at mouseup; that first mouseup is cancelled.
 */
export function bindSelectOnFocus(input) {
  if (!input || input.dataset.ocSelectBound !== undefined) return;
  input.dataset.ocSelectBound = "";
  let justFocused = false;
  input.addEventListener("focus", () => { input.select(); justFocused = true; });
  input.addEventListener("mouseup", (event) => { if (justFocused) { justFocused = false; event.preventDefault(); } });
  input.addEventListener("blur", () => { justFocused = false; });
}

/** 0.18.0: national grouping per dial code, the same defaults as the React, Vue and Blade phone inputs. */
export const PHONE_FORMATS = { "+32": "### ## ## ##", "+31": "# ## ## ## ##", "+33": "# ## ## ## ##", "+49": "### #### ####" };

/**
 * "470123456" in "### ## ## ##" -> "470 12 34 56". The format is one # per digit or a list of group sizes ([3, 2, 2, 2]);
 * without one: a group of 3, then pairs. Digits beyond the pattern follow in pairs (as the wrappers do).
 */
export function formatPhoneDigits(digits, format) {
  const d = String(digits ?? "").replace(/\D/g, "");
  const sizes = Array.isArray(format) ? format.map(Number).filter((n) => n > 0) : (String(format ?? "").match(/#+/g) ?? []).map((run) => run.length);
  const parts = [];
  let at = 0;
  for (const size of sizes.length ? sizes : [3]) {
    if (at >= d.length) break;
    parts.push(d.slice(at, at + size));
    at += size;
  }
  parts.push(...(d.slice(at).match(/.{1,2}/g) ?? []));
  return parts.filter(Boolean).join(" ");
}

/**
 * 0.18.0: .oc-phone-input (dial select + tel field): the number is grouped the way the selected country writes it, while
 * you type (the caret stays behind the same digit) and again as soon as you pick another country. Formats of your own:
 * data-oc-formats='{"+352": "### ### ###"}' on the frame or data-oc-format on an option (Blade: :formats).
 */
export function bindPhoneInput(root) {
  const select = root.querySelector(".oc-phone-input-dial");
  const input = root.querySelector(".oc-phone-input-number");
  if (!select || !input || root.dataset.ocBound !== undefined) return;
  root.dataset.ocBound = "";
  let own = {};
  try { own = JSON.parse(root.dataset.ocFormats || "{}") ?? {}; } catch { own = {}; }
  const formatOf = (dial) => [...select.options].find((o) => o.value === dial)?.dataset.ocFormat || own[dial] || PHONE_FORMATS[dial];
  const digitsIn = (text) => text.replace(/\D/g, "").length;
  // Position just after the n-th digit of the grouped text (0: in front of the first digit).
  const caretAfter = (text, n) => {
    if (n <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < text.length; i++) if (/\d/.test(text[i]) && ++seen === n) return i + 1;
    return text.length;
  };
  let last = input.value;
  const apply = (digits, caretDigits) => {
    const next = formatPhoneDigits(digits, formatOf(select.value));
    last = next;
    if (next === input.value) return false;
    input.value = next;
    if (caretDigits != null && input.ownerDocument.activeElement === input) {
      const at = caretAfter(next, caretDigits);
      try { input.setSelectionRange(at, at); } catch { /* type without selection */ }
    }
    return true;
  };
  let sending = false; // the input/change events this script sends after a country change
  input.addEventListener("input", (event) => {
    if (sending) { last = input.value; return; }
    let digits = input.value.replace(/\D/g, "");
    let caret = digitsIn(input.value.slice(0, input.selectionStart ?? input.value.length));
    // Backspace on a space: remove the digit in front of it instead (otherwise the grouping puts the space back).
    if (event.inputType === "deleteContentBackward" && digits === last.replace(/\D/g, "") && caret > 0) {
      digits = digits.slice(0, caret - 1) + digits.slice(caret);
      caret -= 1;
    }
    apply(digits, caret);
  });
  select.addEventListener("change", () => {
    const focused = input.ownerDocument.activeElement === input;
    const caret = focused ? digitsIn(input.value.slice(0, input.selectionStart ?? input.value.length)) : null;
    if (!apply(input.value, caret)) return;
    const Ev = input.ownerDocument.defaultView?.Event ?? Event;
    sending = true;
    try {
      input.dispatchEvent(new Ev("input", { bubbles: true }));
      input.dispatchEvent(new Ev("change", { bubbles: true }));
    } finally { sending = false; }
  });
}

/** Wire every date field, name card, avatar picker, quantity field, code language select, one-time code, time picker
 *  and phone input under scope. */
export function initFormExtras(scope = document) {
  scope.querySelectorAll(".oc-phone-input").forEach(bindPhoneInput);
  scope.querySelectorAll("input[data-oc-select-on-focus]").forEach(bindSelectOnFocus);
  scope.querySelectorAll(".oc-time-picker").forEach(bindTimePicker);
  scope.querySelectorAll("input.oc-otp").forEach((input) => { bindOtp(input); });
  scope.querySelectorAll(".oc-date-field").forEach(bindDateField);
  scope.querySelectorAll(".oc-name-card").forEach(bindNameCard);
  scope.querySelectorAll(".oc-avatar-picker").forEach(bindAvatarPicker);
  scope.querySelectorAll(".oc-quantity").forEach(bindQuantity);
  scope.querySelectorAll(".oc-language-select--code").forEach(bindLanguageCode);
}

// Starts on its own as /js/oc-form-extras.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-form-extras") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initFormExtras(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
