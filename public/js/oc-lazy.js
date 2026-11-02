// File: packages/ui/src/lazy.js
// Map: mark one image (loaded / error) -> bind every .oc-lazy -> boot
// Lazy images: <figure class="oc-lazy"><img loading="lazy" …></figure>. The browser loads the image when it comes near
// the screen; this script only adds .is-loaded (the photo fades in over the placeholder) or .is-error. Without it the
// image simply shows when it is there.

/** Mark the .oc-lazy box of one image as loaded or failed, now or when the image finishes. */
export function watchLazy(img) {
  const box = img.closest(".oc-lazy");
  if (!box || box.dataset.ocBound) return;
  box.dataset.ocBound = "";
  const done = () => box.classList.add(img.naturalWidth ? "is-loaded" : "is-error");
  if (img.complete) done();
  else {
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", () => box.classList.add("is-error"), { once: true });
  }
}

/** Watch every lazy image under scope. */
export function initLazy(scope = document) {
  scope.querySelectorAll(".oc-lazy img").forEach(watchLazy);
}

// Starts on its own as /js/oc-lazy.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-lazy") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initLazy(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
