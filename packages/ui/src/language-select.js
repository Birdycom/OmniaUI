// File: packages/ui/src/language-select.js
// Map: target of an option (its value, + the current #hash) -> on change go there -> boot on [data-oc-language-select]
// Language select that switches the page: put data-oc-language-select on the .oc-language-select (or on the <select>)
// and give every <option> the address of the same page in that language as its value. On change the browser goes
// there, keeping the #section you were reading (data-oc-keep-hash="false" turns that off).
// Without JavaScript a select cannot switch pages: add the links in a <noscript>, or use the dropdown variant
// (button.oc-language-select + .oc-dropdown-menu with links), which needs no script at all.

/** Address to go to for a chosen option value: the value itself, plus the hash when it has none of its own. */
export function languageTarget(value, hash = "", keepHash = true) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (!keepHash || !hash || v.includes("#")) return v;
  return v + hash;
}

/** Starts every [data-oc-language-select] in scope. Returns a function that stops it. */
export function initLanguageSelect(scope = document) {
  const doc = scope.ownerDocument || scope;
  const win = doc.defaultView;
  const selects = [...scope.querySelectorAll("[data-oc-language-select]")]
    .map((el) => (el.matches("select") ? el : el.querySelector("select")))
    .filter(Boolean);
  const onChange = (e) => {
    const select = e.currentTarget;
    const host = select.closest("[data-oc-language-select]");
    const keep = (host?.dataset.ocKeepHash ?? select.dataset.ocKeepHash) !== "false";
    const target = languageTarget(select.value, win?.location.hash, keep);
    if (target && win) win.location.assign(target);
  };
  selects.forEach((s) => s.addEventListener("change", onChange));
  return () => selects.forEach((s) => s.removeEventListener("change", onChange));
}

// Starts on its own as /js/oc-language-select.js (`npx omniaui copy-js language-select`), with ?auto in the URL or
// data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-language-select") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initLanguageSelect(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
