// File: packages/pro/src/product-picker.js
// Map: text of an option -> filter (search field) -> pick (Add button / double click / Enter) -> bind -> boot
// OmniaUI Pro product picker: a <dialog class="oc-block-shop-picker"> with a search field, products as radio options
// and a quantity. Without this script every product shows and the radios still work (submit the form yourself).
// A pick fires oc-product-pick { key, quantity } on the dialog and closes it.

/** Does an option match the search text? Every word must appear (name, article number, category). */
export function optionMatches(text, query) {
  const haystack = String(text).toLowerCase();
  return String(query).toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
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
    dialog.dispatchEvent(new CustomEvent("oc-product-pick", { bubbles: true, detail }));
    dialog.close?.(checked.value);
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
