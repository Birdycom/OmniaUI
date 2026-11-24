// File: packages/ui/src/tabs.js
// Map: next enabled tab for a key -> select (aria-selected, tabindex, .is-active panel, event) -> bind one
//      [data-oc-tabs] tab list (click, arrow keys) -> init every one -> boot
// Behaviour for class-toggle tabs (the CSS tabs with buttons, <x-oc::tabs mode="buttons">): a tab list with
// data-oc-tabs holds button[role=tab] elements whose aria-controls names their panel (.oc-tab-panel). A click or
// Enter selects a tab: aria-selected="true" on it, .is-active on its panel, the others off. Arrow keys move between
// the enabled tabs (Left/Right, Up/Down in a .oc-tab-list--vertical list), Home and End go to the first and last.
// Event on the tab list: oc-tabs-change, detail { index, tab, panel }.
// 0.18.0: a tab list that scrolls sideways (narrow screen) scrolls the selected tab into view, also on start.

const TAB = '[role="tab"]';

/** Scroll a tab into view inside its scrolling tab list only (never the page up or down). */
export function revealTab(tab, smooth = true) {
  const list = tab?.parentElement;
  if (!list || list.scrollWidth <= list.clientWidth) return;
  const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const left = tab.offsetLeft - list.offsetLeft;
  const right = left + tab.offsetWidth;
  let to = null;
  if (left < list.scrollLeft) to = left - 8;
  else if (right > list.scrollLeft + list.clientWidth) to = right - list.clientWidth + 8;
  if (to == null) return;
  if (typeof list.scrollTo === "function") list.scrollTo({ left: Math.max(0, to), behavior: smooth && !reduce ? "smooth" : "auto" });
  else list.scrollLeft = Math.max(0, to);
}

/**
 * The index of the tab a key moves to, skipping disabled tabs and wrapping at both ends; -1 for another key.
 * `disabled` holds one boolean per tab.
 */
export function nextTab(index, disabled, key, vertical = false) {
  const n = disabled.length;
  const prev = vertical ? "ArrowUp" : "ArrowLeft";
  const next = vertical ? "ArrowDown" : "ArrowRight";
  let step;
  let from = index;
  if (key === next) step = 1;
  else if (key === prev) step = -1;
  else if (key === "Home") { step = 1; from = -1; }
  else if (key === "End") { step = -1; from = n; }
  else return -1;
  for (let i = 1; i <= n; i++) {
    const at = (((from + step * i) % n) + n) % n;
    if (!disabled[at]) return at;
  }
  return -1;
}

/** Starts one [data-oc-tabs] tab list. Returns a function that stops it. */
export function bindTabs(list) {
  if (list.dataset.ocBound) return () => {};
  list.dataset.ocBound = "1";
  const doc = list.ownerDocument;
  const tabs = () => [...list.querySelectorAll(TAB)].filter((t) => t.closest("[data-oc-tabs]") === list);
  const panelOf = (tab) => doc.getElementById(tab.getAttribute("aria-controls") ?? "");

  const select = (tab, focus = false) => {
    const all = tabs();
    for (const other of all) {
      const on = other === tab;
      other.setAttribute("aria-selected", String(on));
      other.tabIndex = on ? 0 : -1;
      panelOf(other)?.classList.toggle("is-active", on);
    }
    if (focus) tab.focus({ preventScroll: true });
    revealTab(tab);
    list.dispatchEvent(new CustomEvent("oc-tabs-change", { bubbles: true, detail: { index: all.indexOf(tab), tab, panel: panelOf(tab) } }));
  };

  const onClick = (e) => {
    const tab = e.target.closest(TAB);
    if (!tab || !tabs().includes(tab) || tab.disabled) return;
    select(tab);
  };
  const onKey = (e) => {
    const tab = e.target.closest(TAB);
    const all = tabs();
    if (!tab || !all.includes(tab)) return;
    const vertical = list.classList.contains("oc-tab-list--vertical") || list.getAttribute("aria-orientation") === "vertical";
    const at = nextTab(all.indexOf(tab), all.map((t) => t.disabled), e.key, vertical);
    if (at < 0) return;
    e.preventDefault();
    select(all[at], true);
  };

  // One tab in the tab order: the selected one (else the first enabled one); its panel shown.
  const all = tabs();
  const current = all.find((t) => t.getAttribute("aria-selected") === "true" && !t.disabled) ?? all.find((t) => !t.disabled);
  for (const t of all) t.tabIndex = t === current ? 0 : -1;
  if (current && !panelOf(current)?.classList.contains("is-active")) {
    for (const t of all) panelOf(t)?.classList.toggle("is-active", t === current);
  }
  if (current) revealTab(current, false);

  list.addEventListener("click", onClick);
  list.addEventListener("keydown", onKey);
  return () => {
    list.removeEventListener("click", onClick);
    list.removeEventListener("keydown", onKey);
    delete list.dataset.ocBound;
  };
}

/** Starts every [data-oc-tabs] tab list under `scope`. */
export function initTabs(scope = document) {
  return [...scope.querySelectorAll("[data-oc-tabs]")].map(bindTabs);
}

// Starts on its own as /js/oc-tabs.js (`npx omniaui copy-js tabs`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-tabs") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initTabs(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
