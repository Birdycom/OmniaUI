// File: packages/pro/src/spotlight.js
// Map: one pointermove listener per [data-oc-spotlight] -> the card under the pointer -> --oc-spot-x / --oc-spot-y
//      (once per frame) -> boot
// Spotlight cards: the glow of .oc-product-card--spotlight follows the mouse instead of sitting at the top. The CSS
// (parts/site-spotlight-cards.css) reads the two custom properties; without them, or with touch, the glow stays at the
// top as on the free .oc-product-card. Only mouse and pen move it: a finger has no hover.

const CARD = ".oc-product-card--spotlight";

/** Pointer position inside a box, in px: what the CSS needs for `radial-gradient(… at x y)`. */
export function spotPosition(event, box) {
  return { x: Math.round(event.clientX - box.left), y: Math.round(event.clientY - box.top) };
}

/** Make the spotlight cards in (or being) one element follow the pointer (once). Returns a cleanup function. */
export function bindSpotlight(root) {
  if (root.hasAttribute("data-oc-spotlight-bound")) return () => {};
  let frame = 0;
  let last = null;
  const paint = () => {
    frame = 0;
    if (!last) return;
    const { card, event } = last;
    const { x, y } = spotPosition(event, card.getBoundingClientRect());
    card.style.setProperty("--oc-spot-x", `${x}px`);
    card.style.setProperty("--oc-spot-y", `${y}px`);
  };
  const onMove = (event) => {
    if (event.pointerType === "touch") return;
    const card = event.target instanceof Element ? event.target.closest(CARD) : null;
    if (!card || !root.contains(card)) return;
    last = { card, event };
    if (!frame) frame = requestAnimationFrame(paint);
  };
  root.addEventListener("pointermove", onMove, { passive: true });
  root.setAttribute("data-oc-spotlight-bound", "");

  return () => {
    root.removeEventListener("pointermove", onMove);
    if (frame) cancelAnimationFrame(frame);
    root.querySelectorAll(CARD).forEach((card) => { card.style.removeProperty("--oc-spot-x"); card.style.removeProperty("--oc-spot-y"); });
    root.removeAttribute("data-oc-spotlight-bound");
  };
}

/** Bind every [data-oc-spotlight] under scope (a grid of cards, or a single card). */
export function initSpotlights(scope = document) {
  scope.querySelectorAll("[data-oc-spotlight]").forEach((root) => bindSpotlight(root));
}

// Starts on its own when loaded straight from a <script type="module"> tag: as /js/oc-spotlight.js (the docs site,
// `npx omniaui copy-js`), with ?auto in the URL, or with data-oc-auto on the tag. An import from a bundler or a
// wrapper does not scan the page: call the init function yourself there.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-spotlight") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initSpotlights(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
