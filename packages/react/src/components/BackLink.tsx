"use client";

import { forwardRef, useEffect, useState } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../utils";

/** True when going back stays on this site: the referrer has this origin, or the tab has more than one history entry. */
export function canGoBack(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ref = document.referrer;
    if (ref && new URL(ref).origin === window.location.origin) return true;
  } catch {
    // An unparsable referrer counts as none.
  }
  return window.history.length > 1;
}

export interface BackLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Where the link goes when there is no page of this site to go back to (opened from a bookmark, a mail, a new tab).
   * With it, a click goes back in the history (filters and scroll position stay) when the visitor came from this site.
   */
  fallbackHref?: string;
  /** Label shown when the link goes to `fallbackHref` (e.g. "Back to Products" where the history label is "Back"). */
  fallbackLabel?: ReactNode;
}

/** `<a class="oc-back-link">Back to Products</a>`; with `fallbackHref` it goes back in the history when it can. */
export const BackLink = forwardRef<HTMLAnchorElement, BackLinkProps>(function BackLink(
  { fallbackHref, fallbackLabel, href, onClick, className, children, ...rest },
  ref,
) {
  const smart = fallbackHref !== undefined;
  const [back, setBack] = useState(true);
  useEffect(() => {
    if (smart) setBack(canGoBack());
  }, [smart]);
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Ctrl/Cmd/Shift/middle click: let the browser open the fallback href in a new tab or window.
    if (!smart || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!canGoBack()) return;
    event.preventDefault();
    window.history.back();
  };
  return (
    <a ref={ref} className={cx("oc-back-link", className)} href={smart ? fallbackHref : href} onClick={click} {...rest}>
      {smart && !back && fallbackLabel != null ? fallbackLabel : children}
    </a>
  );
});
