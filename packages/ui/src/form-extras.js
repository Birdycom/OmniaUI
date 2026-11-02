// File: packages/ui/src/form-extras.js
// Map: ISO week -> date field (week label) -> name card (rename) -> avatar picker (preview, drop, remove) -> quantity
//      (step buttons) -> init -> boot
// Small behaviour for four CSS components; each works without it (native date input, <details>, file input, number input).
// Events on the component root: oc-namecard-rename { name }, oc-avatar-change { file } (null when removed).

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

/** .oc-avatar-picker: preview the chosen or dropped image; [data-oc-avatar-remove] goes back to the initials. */
export function bindAvatarPicker(root) {
  const preview = root.querySelector(".oc-avatar-picker__preview");
  const file = root.querySelector(".oc-avatar-picker__file");
  if (!preview || !file || root.dataset.ocBound) return;
  root.dataset.ocBound = "";
  const initials = preview.querySelector("[data-oc-initials]") || null;
  let url = "";
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
  file.addEventListener("change", () => show(file.files?.[0] || null));
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-oc-avatar-upload]")) file.click();
    if (event.target.closest("[data-oc-avatar-remove]")) { file.value = ""; show(null); }
  });
  root.addEventListener("dragover", (event) => { event.preventDefault(); root.classList.add("is-dragover"); });
  root.addEventListener("dragleave", () => root.classList.remove("is-dragover"));
  root.addEventListener("drop", (event) => {
    event.preventDefault();
    root.classList.remove("is-dragover");
    const picked = [...(event.dataTransfer?.files || [])].find((f) => f.type.startsWith("image/"));
    if (picked) show(picked);
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

/** Wire every date field, name card, avatar picker and quantity field under scope. */
export function initFormExtras(scope = document) {
  scope.querySelectorAll(".oc-date-field").forEach(bindDateField);
  scope.querySelectorAll(".oc-name-card").forEach(bindNameCard);
  scope.querySelectorAll(".oc-avatar-picker").forEach(bindAvatarPicker);
  scope.querySelectorAll(".oc-quantity").forEach(bindQuantity);
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
