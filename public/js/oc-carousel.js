// File: packages/ui/src/carousel.js
// Map: next scroll position (wraps at the ends) -> bind one .oc-carousel--loop (prev/next buttons) -> fallback dots
// -> boot
// Loop for the CSS carousel: the browser's ::scroll-button arrows stop at the first and last slide, so a looping
// carousel has two real buttons (.oc-carousel-prev / .oc-carousel-next) and this script moves it one slide, from the
// last slide back to the first and from the first to the last. Swipe, snap, dots and keyboard stay CSS.
// Where the browser has no ::scroll-marker (Firefox, Safari) the .oc-carousel-dot links are the dots: this script
// makes them scroll only the track (a plain #slide link also scrolls the page) and marks the current one.

/**
 * Where to scroll for one step. `position` and `max` are distances from the start edge (positive, also in RTL),
 * `step` is one slide plus the gap. At an end (within 2px, scroll snapping rounds) it wraps around.
 */
export function loopTarget(position, max, step, direction) {
  if (direction > 0) return position >= max - 2 ? 0 : Math.min(max, position + step);
  return position <= 2 ? max : Math.max(0, position - step);
}

/** Wire the prev/next buttons of one looping carousel (once). */
export function bindCarousel(root) {
  if (root.hasAttribute("data-oc-loop")) return;
  const viewport = root.querySelector(".oc-carousel-viewport");
  const items = viewport?.querySelectorAll(".oc-carousel-item");
  if (!viewport || !items?.length) return;
  const rtl = getComputedStyle(viewport).direction === "rtl";
  const move = (direction) => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    // One slide plus the gap: the distance between the first two slides (one slide wide when there is only one).
    const step = items.length > 1 ? Math.abs(items[1].offsetLeft - items[0].offsetLeft) : viewport.clientWidth;
    const position = Math.abs(viewport.scrollLeft);
    const target = loopTarget(position, max, step, direction);
    viewport.scrollTo({ left: rtl ? -target : target });
  };
  root.querySelector(".oc-carousel-prev")?.addEventListener("click", () => move(-1));
  root.querySelector(".oc-carousel-next")?.addEventListener("click", () => move(1));
  root.setAttribute("data-oc-loop", "");
}

/** Index of the slide whose centre is closest to the centre of the track. */
export function currentIndex(centres, viewportCentre) {
  let best = 0;
  centres.forEach((c, i) => { if (Math.abs(c - viewportCentre) < Math.abs(centres[best] - viewportCentre)) best = i; });
  return best;
}

/** Fallback dots (once): a click scrolls only the track to its slide, the dot of the slide in view gets aria-current. */
export function bindDots(root) {
  if (root.hasAttribute("data-oc-dots")) return;
  const viewport = root.querySelector(".oc-carousel-viewport");
  const dots = [...root.querySelectorAll(".oc-carousel-dot[href^='#']")];
  if (!viewport || !dots.length) return;
  const slides = dots.map((dot) => document.getElementById(decodeURIComponent(dot.getAttribute("href").slice(1))));
  dots.forEach((dot, i) => dot.addEventListener("click", (event) => {
    const slide = slides[i];
    if (!slide || !viewport.contains(slide)) return;
    event.preventDefault();
    slide.scrollIntoView({ block: "nearest", inline: "center" });
  }));
  const mark = () => {
    const box = viewport.getBoundingClientRect();
    const centres = slides.map((s) => (s ? s.getBoundingClientRect().left + s.offsetWidth / 2 : Infinity));
    const current = currentIndex(centres, box.left + box.width / 2);
    dots.forEach((dot, i) => (i === current ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current")));
  };
  let frame = 0;
  viewport.addEventListener("scroll", () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(mark); }, { passive: true });
  mark();
  root.setAttribute("data-oc-dots", "");
}

/** Wire every looping carousel and every set of fallback dots under scope that is not wired yet. */
export function initCarousels(scope = document) {
  scope.querySelectorAll(".oc-carousel--loop").forEach((root) => bindCarousel(root));
  scope.querySelectorAll(".oc-carousel").forEach((root) => bindDots(root));
}

// Starts on its own when loaded straight from a <script type="module"> tag: as /js/oc-carousel.js (the docs site,
// `npx omniaui copy-js`), with ?auto in the URL, or with data-oc-auto on the tag. An import from a bundler or a
// wrapper does not scan the page: call the init function yourself there.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-carousel") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initCarousels(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
