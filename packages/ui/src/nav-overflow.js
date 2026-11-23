// File: packages/ui/src/nav-overflow.js
// Map: fit rule (how many items fit next to a More button) -> More item (found or built) -> apply (data-oc-hidden, menu
//      copies, aria-current on More) -> bind one [data-oc-nav-overflow] nav (ResizeObserver) -> init every one -> boot
// Behaviour for the app header "More" overflow (<x-oc::block.app-header :overflow="true">, or any nav with
// data-oc-nav-overflow around a <ul>): the <li> items that do not fit get data-oc-hidden (they keep their width so they
// can be measured again) and a copy of their link goes into the More menu (.oc-dropdown-menu[popover]). When the current
// page (aria-current) is in that menu, the More button gets aria-current="page". The label of a built More button comes
// from data-more-label on the nav (default "More").
// Event on the nav: oc-nav-overflow, detail { visible, hidden }.

const DOTS =
  "M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2";
let counter = 0;

/**
 * How many items fit: all of them when their widths (plus gaps) fit in `available`, otherwise as many as fit next to
 * the More button (`moreWidth`).
 */
export function fitNavItems(widths, available, moreWidth, gap = 0) {
  const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
  if (total <= available) return widths.length;
  let used = moreWidth;
  let n = 0;
  for (const w of widths) {
    const next = used + gap + w;
    if (next > available) break;
    used = next;
    n++;
  }
  return n;
}

/** The More <li> of a list: the existing [data-oc-nav-more] item, or a new one at the end. */
function moreItem(nav, list) {
  const found = list.querySelector(":scope > [data-oc-nav-more]");
  if (found) return found;
  const doc = list.ownerDocument;
  const id = `oc-nav-more-${++counter}`;
  const li = doc.createElement("li");
  li.setAttribute("data-oc-nav-more", "");
  const button = doc.createElement("button");
  button.className = "oc-navmenu-link oc-block-appbar-more";
  button.type = "button";
  button.setAttribute("popovertarget", id);
  button.setAttribute("aria-haspopup", "menu");
  button.innerHTML = `<svg data-icon="mdi:dots-horizontal" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${DOTS}"/></svg>`;
  button.append(nav.dataset.moreLabel || "More");
  const menu = doc.createElement("div");
  menu.className = "oc-dropdown-menu";
  menu.id = id;
  menu.setAttribute("role", "menu");
  menu.setAttribute("popover", "");
  li.append(button, menu);
  list.append(li);
  return li;
}

const hide = (el, on) => {
  if (on) {
    el.setAttribute("data-oc-hidden", "");
    el.setAttribute("aria-hidden", "true");
  } else {
    el.removeAttribute("data-oc-hidden");
    el.removeAttribute("aria-hidden");
  }
};

/** Shows the first `visible` items, hides the rest and copies their links into the More menu. */
export function applyNavOverflow(list, more, visible) {
  const items = [...list.children].filter((el) => el !== more);
  const menu = more.querySelector(".oc-dropdown-menu");
  const button = more.querySelector("button");
  const hidden = items.slice(visible);
  items.forEach((li, i) => {
    hide(li, i >= visible);
    li.querySelectorAll("a, button").forEach((el) => (i >= visible ? el.setAttribute("tabindex", "-1") : el.removeAttribute("tabindex")));
  });
  hide(more, hidden.length === 0);
  if (button) {
    if (hidden.length === 0) button.setAttribute("tabindex", "-1");
    else button.removeAttribute("tabindex");
  }
  let current = false;
  if (menu) {
    menu.replaceChildren(
      ...hidden.map((li) => {
        const link = li.querySelector("a");
        const a = list.ownerDocument.createElement("a");
        a.className = "oc-dropdown-item";
        a.setAttribute("role", "menuitem");
        a.href = link?.getAttribute("href") ?? "#";
        a.textContent = (link ?? li).textContent.trim();
        if (link?.getAttribute("aria-current")) {
          a.setAttribute("aria-current", link.getAttribute("aria-current"));
          current = true;
        }
        return a;
      }),
    );
  }
  if (button) {
    if (current) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
  return hidden.length;
}

/** Starts one [data-oc-nav-overflow] nav. Returns a function that stops it. */
export function bindNavOverflow(nav) {
  if (nav.dataset.ocBound) return () => {};
  const list = nav.querySelector("ul");
  if (!list) return () => {};
  nav.dataset.ocBound = "1";
  const more = moreItem(nav, list);
  const view = nav.ownerDocument.defaultView;
  const measure = () => {
    const items = [...list.children].filter((el) => el !== more);
    const gap = parseFloat(view?.getComputedStyle(list).columnGap ?? "") || 0;
    const visible = fitNavItems(items.map((el) => el.offsetWidth), nav.clientWidth, more.offsetWidth, gap);
    const hidden = applyNavOverflow(list, more, visible);
    const Ev = view?.CustomEvent ?? CustomEvent;
    nav.dispatchEvent(new Ev("oc-nav-overflow", { bubbles: true, detail: { visible, hidden } }));
  };
  measure();
  const RO = view?.ResizeObserver ?? globalThis.ResizeObserver;
  const ro = RO ? new RO(measure) : null;
  ro?.observe(nav);
  return () => {
    ro?.disconnect();
    delete nav.dataset.ocBound;
  };
}

/** Starts every [data-oc-nav-overflow] nav under `scope`. */
export function initNavOverflow(scope = document) {
  return [...scope.querySelectorAll("[data-oc-nav-overflow]")].map(bindNavOverflow);
}

// Starts on its own as /js/oc-nav-overflow.js (`npx omniaui copy-js nav-overflow`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-nav-overflow") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initNavOverflow(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
