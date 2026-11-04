// File: packages/ui/src/toc.js
// Map: links and their headings per .oc-toc -> current heading (the last one above the reading line) -> aria-current on
//      its link (only without :target-current) -> keep the current link in view in a long table of contents
//      -> on scroll and resize (one frame) -> boot
// Table of contents helper (.oc-toc). Browsers with :target-current (scroll-target-group) highlight the link of the
// heading you are reading in CSS alone; elsewhere this script puts aria-current="true" on the link of the last heading
// above the reading line (35% of the window height; your own with data-oc-toc-line="0.25" on the .oc-toc).
// In every browser it scrolls a table of contents that is taller than its column, so the current link stays in view.

/** Index of the current heading: the last one whose top is above the line (px from the top of the window), else -1. */
export function currentIndex(tops, line) {
  let current = -1;
  tops.forEach((top, i) => { if (top <= line) current = i; });
  return current;
}

/** New scrollTop for a scroller so a link (top/bottom relative to the scroller's content) is in view, with a margin. */
export function keepInView(scrollTop, viewHeight, top, bottom, margin = 24) {
  if (top - margin < scrollTop) return Math.max(0, top - margin);
  if (bottom + margin > scrollTop + viewHeight) return bottom + margin - viewHeight;
  return scrollTop;
}

/** The element that scrolls the table of contents: the .oc-toc itself or a column around it (overflow auto/scroll). */
function scrollerOf(toc, win) {
  for (let el = toc; el && el !== toc.ownerDocument.body; el = el.parentElement) {
    if (/(auto|scroll)/.test(win.getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
  }
  return null;
}

/** Starts the helper for every .oc-toc in scope. Returns a function that stops it.
 *  force: set aria-current also where :target-current works (tests, or your own styling on aria-current). */
export function initToc(scope = document, { force = false } = {}) {
  const doc = scope.ownerDocument || scope;
  const win = doc.defaultView;
  if (!win) return () => {};
  const native = !force && Boolean(win.CSS?.supports?.("selector(:target-current)"));
  const tocs = [...scope.querySelectorAll(".oc-toc")].map((toc) => {
    const links = [...toc.querySelectorAll('a.oc-toc-link[href^="#"]')]
      .map((a) => ({ a, target: doc.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))) }))
      .filter((l) => l.target);
    return { toc, links, line: parseFloat(toc.dataset.ocTocLine) || 0.35, last: null };
  }).filter((t) => t.links.length);
  if (!tocs.length) return () => {};

  let frame = 0;
  const update = () => {
    frame = 0;
    for (const t of tocs) {
      // The heading positions decide, also where :target-current highlights (it can lag behind a jump).
      const i = currentIndex(t.links.map((l) => l.target.getBoundingClientRect().top), win.innerHeight * t.line);
      if (!native) {
        t.links.forEach((l, j) => {
          if (j === i) l.a.setAttribute("aria-current", "true");
          else l.a.removeAttribute("aria-current");
        });
      }
      const link = t.links[i]?.a;
      if (!link || link === t.last) continue;
      t.last = link;
      const scroller = scrollerOf(t.toc, win);
      if (!scroller) continue;
      const box = scroller.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      const top = r.top - box.top + scroller.scrollTop;
      scroller.scrollTop = keepInView(scroller.scrollTop, scroller.clientHeight, top, top + r.height);
    }
  };
  const schedule = () => { if (!frame) frame = win.requestAnimationFrame(update); };
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule, { passive: true });
  // :target-current can change after the last scroll event of a jump: check once more when the scroll ends.
  win.addEventListener("scrollend", schedule, { passive: true });
  update();
  return () => {
    win.removeEventListener("scroll", schedule);
    win.removeEventListener("resize", schedule);
    win.removeEventListener("scrollend", schedule);
    if (frame) win.cancelAnimationFrame(frame);
  };
}

// Starts on its own as /js/oc-toc.js (`npx omniaui copy-js toc`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-toc") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initToc(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
