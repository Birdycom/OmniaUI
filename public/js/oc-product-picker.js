// File: packages/pro/src/product-picker.js
// Map: text of an option -> filter (search field) -> pick (Add button / double click / Enter) -> chosen list (rows, quantity,
//      remove, total) -> bind -> boot
// OmniaUI Pro product picker: a <dialog class="oc-block-shop-picker"> with a search field, products as radio options
// and a quantity. Without this script every product shows and the radios still work (submit the form yourself).
// A pick fires oc-product-pick { key, quantity } on the dialog and closes it. With a list [data-oc-picker-list="<dialog id>"]
// (or one next to the dialog) the pick also shows there as a row under the button: photo, name, quantity, amount, remove,
// and a hidden input lines[key] = quantity for the form. Picking the same product again adds to its quantity.

/** Does an option match the search text? Every word must appear (name, article number, category). */
export function optionMatches(text, query) {
  const haystack = String(text).toLowerCase();
  return String(query).toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}

const STEP = { "-1": "M19 13H5v-2h14z", "1": "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" };
const CLOSE = "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z";
const svg = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;

/** Format an amount (data-oc-currency / data-oc-locale on the list, default EUR / nl-BE). */
const money = (amount, list) => new Intl.NumberFormat(list.dataset.ocLocale || "nl-BE", { style: "currency", currency: list.dataset.ocCurrency || "EUR" }).format(amount);

/** Recount the amounts, the total ([data-oc-picker-total]) and the empty text of a chosen list. */
function refreshList(list) {
  let total = 0;
  for (const row of list.querySelectorAll("[data-oc-picked]")) {
    const quantity = Math.max(1, Number(row.querySelector(".oc-quantity__input").value) || 1);
    const amount = Number(row.dataset.price || 0) * quantity;
    total += amount;
    row.querySelector(".oc-block-shop-amount").textContent = money(amount, list);
    row.querySelector('input[type="hidden"]').value = String(quantity);
    row.querySelector('[data-oc-step="-1"]').disabled = quantity <= 1;
  }
  const box = list.closest(".oc-block-shop-picked") || list.parentElement;
  const sum = box?.querySelector("[data-oc-picker-total]");
  if (sum) sum.textContent = money(total, list);
  const empty = box?.querySelector(".oc-block-shop-picked-empty");
  const rows = list.querySelectorAll("[data-oc-picked]").length;
  if (empty) empty.hidden = rows > 0;
  box?.querySelectorAll("[data-oc-picker-full]").forEach((el) => { el.hidden = rows === 0; });
}

/** Add a picked option to a chosen list (or raise its quantity). */
export function addPicked(list, option, quantity) {
  const input = option.querySelector("input");
  const key = input.value;
  const existing = [...list.querySelectorAll("[data-oc-picked]")].find((row) => row.dataset.ocPicked === key);
  if (existing) {
    const field = existing.querySelector(".oc-quantity__input");
    field.value = String((Number(field.value) || 0) + quantity);
    refreshList(list);
    return existing;
  }
  const name = option.querySelector(".oc-block-shop-option-text strong")?.textContent || key;
  const sub = option.querySelector(".oc-block-shop-option-text > span")?.textContent.split(" · ")[0] || "";
  const row = document.createElement("li");
  row.className = "oc-block-shop-picked-row";
  row.dataset.ocPicked = key;
  row.dataset.price = input.dataset.price || "0";
  const thumb = option.querySelector(".oc-block-shop-thumb, .oc-avatar")?.cloneNode(true);
  const text = document.createElement("span");
  text.className = "oc-block-shop-option-text";
  text.innerHTML = "<strong></strong><span></span>";
  text.firstChild.textContent = name;
  text.lastChild.textContent = sub;
  const qty = document.createElement("div");
  qty.className = "oc-quantity oc-quantity--sm";
  qty.dataset.ocBound = ""; // stepped here, not by form-extras.js
  qty.innerHTML = `<button class="oc-quantity__step" type="button" data-oc-step="-1">${svg(STEP["-1"])}</button><input class="oc-quantity__input" type="number" inputmode="numeric" min="1" max="999" step="1"><button class="oc-quantity__step" type="button" data-oc-step="1">${svg(STEP["1"])}</button>`;
  const [down, field, up] = qty.children;
  field.value = String(quantity);
  field.setAttribute("aria-label", `Quantity of ${name}`);
  down.setAttribute("aria-label", `Decrease quantity of ${name}`);
  up.setAttribute("aria-label", `Increase quantity of ${name}`);
  const amount = document.createElement("span");
  amount.className = "oc-block-shop-amount";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "oc-btn oc-btn--plain";
  remove.dataset.ocPickerRemove = "";
  remove.setAttribute("aria-label", `Remove ${name}`);
  remove.innerHTML = svg(CLOSE);
  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = `lines[${key}]`;
  row.append(...[thumb, text, qty, amount, remove, hidden].filter(Boolean));
  list.append(row);
  refreshList(list);
  return row;
}

/** Wire the rows of a chosen list: quantity steps, typing, remove. */
function bindList(list) {
  if (list.dataset.ocBound) return;
  list.dataset.ocBound = "";
  list.addEventListener("click", (event) => {
    const step = event.target.closest("[data-oc-step]");
    if (step) {
      const field = step.parentElement.querySelector(".oc-quantity__input");
      field.value = String(Math.min(999, Math.max(1, (Number(field.value) || 1) + Number(step.dataset.ocStep))));
      refreshList(list);
    }
    const remove = event.target.closest("[data-oc-picker-remove]");
    if (remove) {
      const row = remove.closest("[data-oc-picked]");
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      refreshList(list);
      (next?.querySelector("[data-oc-picker-remove]") || list.closest(".oc-block-shop-picked")?.querySelector("[command='show-modal']"))?.focus();
    }
  });
  list.addEventListener("input", (event) => { if (event.target.matches(".oc-quantity__input")) refreshList(list); });
  refreshList(list);
}

/** Wire one picker dialog. */
export function bindProductPicker(dialog) {
  if (!dialog || dialog.dataset.ocBound) return;
  dialog.dataset.ocBound = "";
  const search = dialog.querySelector("[data-oc-picker-search]");
  const options = () => [...dialog.querySelectorAll(".oc-block-shop-option")];
  const empty = dialog.querySelector(".oc-block-shop-picker-empty");
  const quantity = dialog.querySelector(".oc-block-shop-picker-foot .oc-quantity__input");
  const addButton = dialog.querySelector("[data-oc-picker-add]");
  const list = (dialog.id && document.querySelector(`[data-oc-picker-list="${dialog.id}"]`)) || dialog.parentElement?.querySelector("[data-oc-picker-list]");
  if (list) bindList(list);

  const filter = () => {
    const query = search?.value || "";
    let shown = 0;
    for (const option of options()) {
      const visible = optionMatches(option.textContent, query);
      option.hidden = !visible;
      if (visible) shown++;
    }
    if (empty) empty.hidden = shown > 0;
    const checked = dialog.querySelector(".oc-block-shop-option input:checked");
    if (addButton) addButton.disabled = !checked || checked.closest(".oc-block-shop-option").hidden;
  };

  const pick = () => {
    const checked = dialog.querySelector(".oc-block-shop-option input:checked");
    if (!checked || checked.disabled || checked.closest(".oc-block-shop-option").hidden) return;
    const detail = { key: checked.value, quantity: Math.max(1, Number(quantity?.value) || 1) };
    if (list) addPicked(list, checked.closest(".oc-block-shop-option"), detail.quantity);
    dialog.dispatchEvent(new CustomEvent("oc-product-pick", { bubbles: true, detail }));
    dialog.close?.(checked.value);
    if (quantity) quantity.value = "1";
  };

  search?.addEventListener("input", filter);
  dialog.addEventListener("change", (event) => { if (event.target.matches?.(".oc-block-shop-option input")) filter(); });
  dialog.addEventListener("click", (event) => { if (event.target.closest("[data-oc-picker-add]")) { event.preventDefault(); pick(); } });
  dialog.addEventListener("dblclick", (event) => { if (event.target.closest(".oc-block-shop-option")) pick(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    // Enter in the search field picks the only match, or the checked one.
    if (event.target === search) {
      event.preventDefault();
      const visible = options().filter((option) => !option.hidden && !option.querySelector("input").disabled);
      if (visible.length === 1) visible[0].querySelector("input").checked = true;
      pick();
    } else if (event.target.matches?.(".oc-block-shop-option input")) {
      event.preventDefault();
      pick();
    }
  });
  dialog.addEventListener("close", () => { if (search) { search.value = ""; filter(); } });
  filter();
}

/** Wire every picker under scope. */
export function initProductPickers(scope = document) {
  scope.querySelectorAll(".oc-block-shop-picker").forEach(bindProductPicker);
}

// Starts on its own as /js/oc-product-picker.js (`npx omniaui copy-js`), with ?auto or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-product-picker") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initProductPickers(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
