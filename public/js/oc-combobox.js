// File: packages/ui/src/combobox.js
// Map: label/value of an option -> filter -> active option (arrows, Home/End) -> choose (Enter, click) -> open/close
//      -> bind one .oc-combobox -> init every [data-oc-combobox] -> boot
// Behaviour for the CSS combobox (.oc-combobox) in plain HTML and Blade: typing filters the list, the arrow keys move
// the active option (aria-activedescendant), Enter or a click chooses, Escape closes. The chosen option gets
// aria-selected, its label goes into the field and its icon (.oc-combobox-option-icon) into the field's .oc-combobox-icon.
// A hidden input in the wrapper (input[type=hidden]) gets the option's data-value, for forms.
// Event on the wrapper: oc-combobox-change { value, label }.

const OPTION = ".oc-combobox-option";

/** Text label of an option (without the icon). */
export function optionLabel(option) {
  const icon = option.querySelector(".oc-combobox-option-icon");
  return [...option.childNodes].filter((n) => n !== icon).map((n) => n.textContent).join("").trim();
}

/** Value of an option: data-value, else its label. */
export function optionValue(option) {
  return option.dataset.value ?? optionLabel(option);
}

/** True when the label contains the query (case and accents ignored). */
export function matches(label, query) {
  const fold = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return fold(label).includes(fold(query).trim());
}

let uid = 0;

/** Starts one .oc-combobox. Returns a function that stops it. */
export function bindCombobox(root) {
  const input = root.querySelector(".oc-combobox-input");
  const list = root.querySelector(".oc-combobox-list");
  if (!input || !list || root.dataset.ocBound != null) return () => {};
  root.dataset.ocBound = "";
  const slot = root.querySelector(":scope > .oc-combobox-icon");
  const placeholderIcon = slot ? slot.innerHTML : "";
  const hidden = root.querySelector(':scope > input[type="hidden"]');
  const empty = list.querySelector(".oc-combobox-empty");
  const options = () => [...list.querySelectorAll(OPTION)];
  const enabled = () => options().filter((o) => !o.hidden && o.getAttribute("aria-disabled") !== "true");
  options().forEach((o) => { if (!o.id) o.id = `oc-combobox-option-${++uid}`; });

  const setOpen = (open) => {
    if (open) root.removeAttribute("data-open");
    else root.dataset.open = "false";
    input.setAttribute("aria-expanded", String(open && root.contains(root.ownerDocument.activeElement)));
  };
  const setActive = (option) => {
    options().forEach((o) => o.toggleAttribute("data-active", o === option));
    if (option) {
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView?.({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  };
  const filter = () => {
    const q = input.value;
    let shown = 0;
    options().forEach((o) => { o.hidden = !matches(optionLabel(o), q); if (!o.hidden) shown++; });
    if (empty) empty.hidden = shown > 0;
    if (slot && !q) slot.innerHTML = placeholderIcon;
    setActive(enabled()[0] ?? null);
  };
  const choose = (option) => {
    if (!option || option.getAttribute("aria-disabled") === "true") return;
    options().forEach((o) => o.setAttribute("aria-selected", String(o === option)));
    const label = optionLabel(option);
    const value = optionValue(option);
    input.value = label;
    if (hidden) hidden.value = value;
    if (slot) slot.innerHTML = option.querySelector(".oc-combobox-option-icon")?.innerHTML ?? placeholderIcon;
    options().forEach((o) => { o.hidden = false; });
    if (empty) empty.hidden = true;
    setOpen(false);
    root.dispatchEvent(new CustomEvent("oc-combobox-change", { bubbles: true, detail: { value, label } }));
  };

  const onInput = () => { setOpen(true); filter(); };
  const onKey = (e) => {
    const items = enabled();
    const at = items.findIndex((o) => o.hasAttribute("data-active"));
    const move = (i) => { setOpen(true); setActive(items[(i + items.length) % items.length] ?? null); e.preventDefault(); };
    if (e.key === "ArrowDown") move(root.dataset.open === "false" ? Math.max(at, 0) : at + 1);
    else if (e.key === "ArrowUp") move(at <= 0 ? items.length - 1 : at - 1);
    else if (e.key === "Home" && root.dataset.open !== "false") move(0);
    else if (e.key === "End" && root.dataset.open !== "false") move(items.length - 1);
    else if (e.key === "Enter" && at >= 0 && root.dataset.open !== "false") { e.preventDefault(); choose(items[at]); }
    else if (e.key === "Escape" && root.dataset.open !== "false") { e.preventDefault(); setOpen(false); }
  };
  const onClickInput = () => { if (root.dataset.open === "false") setOpen(true); };
  // A click on an option keeps the focus in the field (tabindex="-1" on the options does the rest).
  const onDown = (e) => { if (e.target.closest(OPTION)) e.preventDefault(); };
  const onClick = (e) => choose(e.target.closest(OPTION));
  const onFocus = () => input.setAttribute("aria-expanded", String(root.dataset.open !== "false"));
  const onBlur = (e) => {
    if (root.contains(e.relatedTarget)) return;
    input.setAttribute("aria-expanded", "false");
    root.removeAttribute("data-open");
    setActive(null);
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKey);
  input.addEventListener("click", onClickInput);
  list.addEventListener("mousedown", onDown);
  list.addEventListener("click", onClick);
  root.addEventListener("focusin", onFocus);
  root.addEventListener("focusout", onBlur);
  const chosen = options().find((o) => o.getAttribute("aria-selected") === "true");
  if (chosen && slot) slot.innerHTML = chosen.querySelector(".oc-combobox-option-icon")?.innerHTML ?? placeholderIcon;
  return () => {
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", onKey);
    input.removeEventListener("click", onClickInput);
    list.removeEventListener("mousedown", onDown);
    list.removeEventListener("click", onClick);
    root.removeEventListener("focusin", onFocus);
    root.removeEventListener("focusout", onBlur);
    delete root.dataset.ocBound;
  };
}

/** Starts every .oc-combobox[data-oc-combobox] in scope. Returns a function that stops them. */
export function initCombobox(scope = document) {
  const stops = [...scope.querySelectorAll(".oc-combobox[data-oc-combobox]")].map(bindCombobox);
  return () => stops.forEach((stop) => stop());
}

// Starts on its own as /js/oc-combobox.js (`npx omniaui copy-js combobox`), with ?auto in the URL or data-oc-auto on
// the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-combobox") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initCombobox(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
