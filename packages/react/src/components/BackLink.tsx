"use client";

import { createElement, forwardRef, useEffect, useState } from "react";
import type { AnchorHTMLAttributes, ComponentPropsWithRef, ElementType, MouseEvent, ReactElement, ReactNode, RefAttributes } from "react";
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

/** True for a click the browser should handle itself: Ctrl/Cmd/Shift/Alt or another button than the main one. */
function isModifiedClick(event: MouseEvent<HTMLElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export interface BackLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Where the link goes when there is no page of this site to go back to (opened from a bookmark, a mail, a new tab).
   * With it, a click goes back in the history (filters and scroll position stay) when the visitor came from this site.
   */
  fallbackHref?: string;
  /** Label shown when the link goes to `fallbackHref` (e.g. "Back to Products" where the history label is "Back"). */
  fallbackLabel?: ReactNode;
  /**
   * 0.18.0: your own back action (router navigate, close a panel). A plain click calls it instead of following the link
   * or going back in the history; Ctrl/Cmd/Shift and middle click keep the browser behaviour (open href in a new tab).
   */
  onBack?: () => void;
  /** 0.18.0: render this element or component instead of `<a>` (a router `Link`); other props such as `to` fall through. */
  as?: ElementType;
}

/** Props of `<BackLink as={Link} to="/products">`: the back link props plus any prop of that component. */
export type BackLinkAsProps<E extends ElementType> = BackLinkProps & { as: E } & Omit<ComponentPropsWithRef<E>, keyof BackLinkProps>;

export interface BackLinkComponent {
  (props: BackLinkProps & RefAttributes<HTMLAnchorElement>): ReactElement | null;
  <E extends ElementType>(props: BackLinkAsProps<E>): ReactElement | null;
  displayName?: string;
}

/**
 * `<a class="oc-back-link">Back to Products</a>`; with `fallbackHref` it goes back in the history when it can,
 * with `onBack` a plain click runs your own back action, with `as` it renders your router link.
 */
export const BackLink = forwardRef<HTMLAnchorElement, BackLinkProps>(function BackLink(
  { fallbackHref, fallbackLabel, onBack, as, href, onClick, className, children, ...rest },
  ref,
) {
  const smart = fallbackHref !== undefined;
  const [back, setBack] = useState(true);
  useEffect(() => {
    if (smart) setBack(canGoBack());
  }, [smart]);
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Ctrl/Cmd/Shift/middle click: let the browser open the href in a new tab or window.
    if (event.defaultPrevented || isModifiedClick(event)) return;
    if (onBack) {
      event.preventDefault();
      onBack();
      return;
    }
    if (!smart || !canGoBack()) return;
    event.preventDefault();
    window.history.back();
  };
  const target = smart ? fallbackHref : href;
  return createElement(
    as ?? "a",
    { ref, className: cx("oc-back-link", className), ...(target !== undefined ? { href: target } : {}), onClick: click, ...rest },
    smart && !back && fallbackLabel != null ? fallbackLabel : children,
  );
}) as unknown as BackLinkComponent;
