// File: packages/ui/src/fly.js
// Map: row of a card (index, count) -> start offset -> delay -> observe (once or both ways) -> boot
// Cards that fly in (.oc-reveal--fly): each card starts from the middle of its row (--oc-fly-x) and flies to its place
// when it scrolls into view (.is-visible). Adds .oc-fly-ready on <html> first, so without this script, or with
// "reduce motion", nothing is hidden.
// Options (CSS custom properties on a card or a parent, and attributes):
//   --oc-fly-step: 45px     start offset per column from the middle of the row (instead of the full distance)
//   --oc-fly-stagger: 90ms  delay per column, so a row lands from left to right
//   data-oc-fly-repeat      the cards fly out again when they leave the view (both scroll directions)
//   data-oc-fly-random      each card comes (and goes) on its own: a new random delay and start offset every time,
//                           instead of row by row. The value is the longest delay in ms (default 700).
//   data-oc-fly-trigger     how far the card must scroll into view before it flies in: % of the view from the bottom
//                           (default 10; 25 = a quarter of the screen higher, so you scroll a bit further first).
//   Timing in CSS (parts/site-fly.css): --oc-fly-duration, --oc-fly-fade, --oc-fly-ease, --oc-fly-rise, --oc-fly-blur.

/** Index of the card in its row (cards with the same top in the same parent) and the number of cards in that row. */
function rowOf(card) {
  const top = card.offsetTop;
  const row = [...(card.parentElement?.children ?? [])].filter((el) => el.classList.contains("oc-reveal--fly") && el.offsetTop === top);
  return { index: Math.max(0, row.indexOf(card)), count: row.length || 1 };
}

/** Horizontal distance from the card to the middle of its parent, so the row opens from the center. */
function flyOffset(card, step, index, count) {
  if (step) return Math.round(((count - 1) / 2 - index) * step);
  const box = card.getBoundingClientRect();
  const parent = card.parentElement?.getBoundingClientRect();
  if (!parent || !box.width) return 0;
  return Math.round(parent.left + parent.width / 2 - (box.left + box.width / 2));
}

/** "90ms", "0.09s" or "45px" -> number (ms or px); 0 when empty. */
function num(value, unitS = false) {
  const v = String(value).trim();
  const n = parseFloat(v);
  if (!v || Number.isNaN(n)) return 0;
  return unitS && /\ds$/.test(v) ? n * 1000 : n;
}

/**
 * data-oc-fly-random: a new random delay (0 to the value of the attribute, default 700ms) and a random start offset
 * (left or right, up to two steps or 90px), so the cards of one row do not move together.
 */
function shuffle(card, holder, step) {
  const max = num(holder.getAttribute("data-oc-fly-random")) || 700;
  const reach = Math.max(step * 2, 90);
  card.style.setProperty("--oc-fly-delay", `${Math.round(Math.random() * max)}ms`);
  card.style.setProperty("--oc-fly-x", `${Math.round((Math.random() * 2 - 1) * reach)}px`);
}

/** Let every .oc-reveal--fly under scope fly in once it comes into view. Returns a function that stops watching. */
export function initFly(scope = document) {
  const doc = scope.ownerDocument || scope;
  const win = doc.defaultView;
  const cards = [...scope.querySelectorAll(".oc-reveal--fly:not(.is-visible)")];
  if (!cards.length || !win) return () => {};
  if (!("IntersectionObserver" in win) || win.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((c) => c.classList.add("is-visible"));
    return () => {};
  }
  for (const card of cards) {
    const style = win.getComputedStyle(card);
    const { index, count } = rowOf(card);
    card.style.setProperty("--oc-fly-x", `${flyOffset(card, num(style.getPropertyValue("--oc-fly-step")), index, count)}px`);
    const stagger = num(style.getPropertyValue("--oc-fly-stagger"), true);
    if (stagger) card.style.setProperty("--oc-fly-delay", `${index * stagger}ms`);
    const random = card.closest("[data-oc-fly-random]");
    if (random) shuffle(card, random, num(style.getPropertyValue("--oc-fly-step")));
  }
  doc.documentElement.classList.add("oc-fly-ready");
  const timers = new WeakMap();
  const onEntries = (entries, io) => {
    for (const entry of entries) {
      const repeat = entry.target.closest("[data-oc-fly-repeat]");
      const random = entry.target.closest("[data-oc-fly-random]");
      // Random: a new delay and offset on every turn, also when the card flies out again.
      if (random && (entry.isIntersecting || repeat)) {
        shuffle(entry.target, random, num(win.getComputedStyle(entry.target).getPropertyValue("--oc-fly-step")));
      }
      const card = entry.target;
      win.clearTimeout(timers.get(card));
      if (entry.isIntersecting) {
        // .is-flying keeps the fly timing until the card stands still; then its own transition (hover) is back.
        card.classList.add("is-visible", "is-flying");
        const style = win.getComputedStyle(card);
        const time = num(style.getPropertyValue("--oc-fly-delay"), true)
          + Math.max(num(style.getPropertyValue("--oc-fly-duration"), true) || 900, num(style.getPropertyValue("--oc-fly-fade"), true) || 600);
        timers.set(card, win.setTimeout(() => card.classList.remove("is-flying"), time + 80));
        if (!repeat) io.unobserve(card);
      } else if (repeat) {
        card.classList.remove("is-visible", "is-flying");
      }
    }
  };
  // One observer per trigger line (data-oc-fly-trigger = % of the view from the bottom, default 10).
  const observers = new Map();
  for (const card of cards) {
    const trigger = Math.min(90, Math.max(0, num(card.closest("[data-oc-fly-trigger]")?.getAttribute("data-oc-fly-trigger") ?? "10")));
    if (!observers.has(trigger)) {
      observers.set(trigger, new win.IntersectionObserver(onEntries, { rootMargin: `0px 0px -${trigger}% 0px`, threshold: 0.12 }));
    }
    observers.get(trigger).observe(card);
  }
  return () => observers.forEach((io) => io.disconnect());
}

// Starts on its own as /js/oc-fly.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-fly") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initFly(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
