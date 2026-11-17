// File: packages/ui/src/theme.js
// Map: read / write the stored choice -> apply (data-theme, .dark, color-scheme) -> sync switches and toggle buttons
//      -> listen (radios, toggle buttons, other tabs) -> head snippet against a flash -> boot
// Theme helper: remembers the choice of a .oc-theme-switch (system / light / dark) and puts it on <html> as
// data-theme, so CSS and scripts have one place to look. The switch itself keeps working without this script.
//   <html data-theme="dark" class="dark">   chosen dark     (no attribute = follow the operating system)
//   <fieldset class="oc-theme-switch"> … radios name="oc-theme" value="system | light | dark"
//   <button data-oc-theme-toggle>           one button: light <-> dark (aria-pressed = dark)
//   <button data-oc-theme-set="dark">       a button for one value (cards on a settings page; aria-pressed)
// Switches inside .oc-theme-scope theme only their own element and are left alone.
// Against a flash of the wrong theme on load: put THEME_HEAD_SCRIPT inline in <head>, before the stylesheets.

const VALUES = ["system", "light", "dark"];

/** "light", "dark" or "system" (also for an unknown or missing value). */
export function normalizeTheme(value) {
  return VALUES.includes(value) ? value : "system";
}

/** The stored choice, "system" when nothing is stored or storage is blocked. */
export function readTheme(storage, key = "oc-theme") {
  try { return normalizeTheme(storage?.getItem(key)); } catch { return "system"; }
}

/** Store the choice; "system" removes the key. Returns false when storage is blocked. */
export function writeTheme(storage, value, key = "oc-theme") {
  try {
    if (normalizeTheme(value) === "system") storage?.removeItem(key);
    else storage?.setItem(key, value);
    return true;
  } catch { return false; }
}

/** The theme that is shown: the choice, or the operating system for "system". */
export function effectiveTheme(choice, prefersDark) {
  const value = normalizeTheme(choice);
  return value === "system" ? (prefersDark ? "dark" : "light") : value;
}

/**
 * Put the choice on the root element: data-theme="light|dark" (removed for "system") and, with darkClass, the class
 * .dark for code that looks at a class. Returns the theme that is shown.
 */
export function applyTheme(root, choice, { darkClass = true, prefersDark = false } = {}) {
  const value = normalizeTheme(choice);
  const shown = effectiveTheme(value, prefersDark);
  if (value === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", value);
  if (darkClass) root.classList.toggle("dark", value === "dark");
  return shown;
}

/** Inline script for <head>: sets data-theme (and .dark) before the first paint. The key must match initTheme. */
export const THEME_HEAD_SCRIPT = '(function(){try{var t=localStorage.getItem("oc-theme"),d=document.documentElement;if(t==="light"||t==="dark"){d.setAttribute("data-theme",t);if(t==="dark")d.classList.add("dark")}}catch(e){}})();';

/**
 * Remember the theme and keep every switch and button on the page in step.
 * @param {Document} doc
 * @param {{ storageKey?: string, darkClass?: boolean, name?: string }} options
 *   storageKey: localStorage key ("oc-theme"); darkClass: also toggle .dark on <html> (true);
 *   name: only radios with this name (default: every .oc-theme-switch outside a .oc-theme-scope).
 * @returns {{ get: () => string, set: (value: string) => void, stop: () => void }}
 */
export function initTheme(doc = document, { storageKey = "oc-theme", darkClass = true, name } = {}) {
  const win = doc.defaultView;
  const root = doc.documentElement;
  const media = win?.matchMedia?.("(prefers-color-scheme: dark)");
  let storage = null;
  try { storage = win?.localStorage ?? null; } catch { storage = null; }
  let choice = readTheme(storage, storageKey);

  const radios = () => [...doc.querySelectorAll(".oc-theme-switch input[type=radio]")]
    .filter((input) => !input.closest(".oc-theme-scope") && (!name || input.name === name));
  const sync = () => {
    const shown = applyTheme(root, choice, { darkClass, prefersDark: !!media?.matches });
    for (const input of radios()) input.checked = input.value === choice;
    for (const button of doc.querySelectorAll("[data-oc-theme-toggle]")) button.setAttribute("aria-pressed", shown === "dark" ? "true" : "false");
    for (const button of doc.querySelectorAll("[data-oc-theme-set]")) button.setAttribute("aria-pressed", button.getAttribute("data-oc-theme-set") === choice ? "true" : "false");
    root.dispatchEvent(new win.CustomEvent("oc-theme-change", { detail: { choice, theme: shown } }));
  };
  const set = (value) => {
    choice = normalizeTheme(value);
    writeTheme(storage, choice, storageKey);
    sync();
  };

  const onChange = (event) => {
    const input = event.target;
    if (input?.matches?.(".oc-theme-switch input[type=radio]") && radios().includes(input) && input.checked) set(input.value);
  };
  const onClick = (event) => {
    const toggle = event.target.closest?.("[data-oc-theme-toggle]");
    if (toggle) return set(effectiveTheme(choice, !!media?.matches) === "dark" ? "light" : "dark");
    const one = event.target.closest?.("[data-oc-theme-set]");
    if (one) set(one.getAttribute("data-oc-theme-set"));
  };
  // Another tab changed the choice, or the operating system switched while the choice is "system".
  const onStorage = (event) => { if (event.key === storageKey) { choice = readTheme(storage, storageKey); sync(); } };
  const onSystem = () => { if (choice === "system") sync(); };

  doc.addEventListener("change", onChange);
  doc.addEventListener("click", onClick);
  win?.addEventListener("storage", onStorage);
  media?.addEventListener?.("change", onSystem);
  sync();
  return {
    get: () => choice,
    set,
    stop() {
      doc.removeEventListener("change", onChange);
      doc.removeEventListener("click", onClick);
      win?.removeEventListener("storage", onStorage);
      media?.removeEventListener?.("change", onSystem);
    },
  };
}

// Starts on its own as /js/oc-theme.js (`npx omniaui copy-js theme`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-theme") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initTheme(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
