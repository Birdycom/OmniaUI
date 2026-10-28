// File: packages/pro/src/infinite-carousel.js
// Map: copy the slides before and after the real ones -> start on the first real slide -> prev/next one slide
//      -> when scrolling stops on a copy, jump (without animation) to the same real slide -> boot
// Continuous loop for .oc-block-carousel: after the last slide the first one slides in from the right (and the other
// way round), there is no rewind. Swipe, wheel and the arrow keys loop too. Copies are aria-hidden and inert.

/** Slide index after a jump: back into the real middle set when `index` is on a copy (n real slides). */
export function wrapIndex(index, n) {
  if (index < n) return index + n;
  if (index >= 2 * n) return index - n;
  return index;
}

/** Make one .oc-block-carousel loop (once). Returns a cleanup function. */
export function bindInfiniteCarousel(root) {
  if (root.hasAttribute("data-oc-infinite")) return () => {};
  const viewport = root.querySelector(".oc-carousel-viewport");
  const real = viewport ? [...viewport.querySelectorAll(":scope > .oc-carousel-item")] : [];
  if (real.length < 2) return () => {};
  const n = real.length;

  // One full set of copies on each side: enough for any number of slides per view.
  const copy = (item) => {
    const clone = item.cloneNode(true);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    clone.classList.add("oc-carousel-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    return clone;
  };
  viewport.prepend(...real.map(copy));
  viewport.append(...real.map(copy));
  const items = [...viewport.querySelectorAll(":scope > .oc-carousel-item")];

  const rtl = getComputedStyle(viewport).direction === "rtl";
  const offset = (i) => Math.abs(items[i].offsetLeft - items[0].offsetLeft);
  const step = () => offset(1);
  const current = () => Math.round(Math.abs(viewport.scrollLeft) / (step() || 1));
  const go = (i, behavior) => {
    const left = (rtl ? -1 : 1) * offset(i);
    if (viewport.scrollTo) viewport.scrollTo({ left, behavior });
    else viewport.scrollLeft = left;
  };

  go(n, "instant");
  const settle = () => {
    const i = current();
    const j = wrapIndex(i, n);
    if (j !== i) go(j, "instant");
  };
  // scrollend where supported, otherwise "no scroll event for 150 ms".
  let timer = 0;
  const onScroll = () => { clearTimeout(timer); timer = setTimeout(settle, 150); };
  const scrollEvent = typeof window !== "undefined" && "onscrollend" in window ? "scrollend" : "scroll";
  viewport.addEventListener(scrollEvent, scrollEvent === "scrollend" ? settle : onScroll);

  const prev = root.querySelector(".oc-carousel-prev");
  const next = root.querySelector(".oc-carousel-next");
  const onPrev = () => go(current() - 1);
  const onNext = () => go(current() + 1);
  prev?.addEventListener("click", onPrev);
  next?.addEventListener("click", onNext);
  // A new width changes the slide width: stay on the same slide.
  const resize = typeof ResizeObserver === "function" ? new ResizeObserver(() => go(wrapIndex(current(), n), "instant")) : null;
  resize?.observe(viewport);
  root.setAttribute("data-oc-infinite", "");

  return () => {
    viewport.removeEventListener(scrollEvent, scrollEvent === "scrollend" ? settle : onScroll);
    prev?.removeEventListener("click", onPrev);
    next?.removeEventListener("click", onNext);
    resize?.disconnect();
    viewport.querySelectorAll(":scope > .oc-carousel-clone").forEach((el) => el.remove());
    root.removeAttribute("data-oc-infinite");
  };
}

/** Make every .oc-block-carousel under scope loop. */
export function initInfiniteCarousels(scope = document) {
  scope.querySelectorAll(".oc-block-carousel").forEach((root) => bindInfiniteCarousel(root));
}

// Loaded as /js/oc-infinite-carousel.js (the docs site, or a copy in your project): start on its own.
if (typeof document !== "undefined" && String(import.meta.url).includes("oc-infinite-carousel")) {
  const boot = () => initInfiniteCarousels(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
