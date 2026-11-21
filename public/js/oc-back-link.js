// File: packages/ui/src/back-link.js
// Map: same-site history? -> bind one .oc-back-link[data-oc-back] (label, click) -> bind every one -> boot
// Back link with a fallback: <a class="oc-back-link" href="/products" data-oc-back data-oc-fallback-label="Back to Products">Back</a>.
// When the visitor came from a page of the same site (document.referrer on this origin, or more than one entry in the
// tab's history), a click goes back (history.back()) so filters and scroll position stay. Otherwise the link simply
// follows its href (the fallback) and, with data-oc-fallback-label, shows that label. Without the script it is a plain link.

/** True when going back stays on this site: the referrer has this origin, or the tab has more than one history entry. */
export function canGoBack(win = typeof window === "undefined" ? undefined : window) {
  if (!win) return false;
  try {
    const ref = win.document.referrer;
    if (ref && new URL(ref).origin === win.location.origin) return true;
  } catch {
    // An unparsable referrer counts as none.
  }
  return win.history.length > 1;
}

/** Bind one back link: fallback label now, history.back() on a plain click when there is somewhere to go back to. */
export function bindBackLink(link) {
  if (!link || link.dataset.ocBound !== undefined) return;
  link.dataset.ocBound = "";
  const win = link.ownerDocument.defaultView;
  const back = canGoBack(win);
  const label = link.dataset.ocFallbackLabel;
  if (!back && label) link.textContent = label;
  link.addEventListener("click", (event) => {
    // Ctrl/Cmd/Shift/middle click: let the browser open the fallback href in a new tab or window.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!canGoBack(win)) return;
    event.preventDefault();
    win.history.back();
  });
}

/** Bind every .oc-back-link[data-oc-back] under scope. */
export function initBackLinks(scope = document) {
  scope.querySelectorAll(".oc-back-link[data-oc-back], a[data-oc-back]").forEach(bindBackLink);
}

// Starts on its own as /js/oc-back-link.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-back-link") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initBackLinks(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
