import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BreadcrumbItemData {
  label: ReactNode;
  /** Omit (or put last) to mark the current page. */
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemData[];
}

/** `<nav class="oc-breadcrumb">` with links and a final `aria-current="page"` item. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, children, className, "aria-label": ariaLabel = "Breadcrumb", ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx("oc-breadcrumb", className)} aria-label={ariaLabel} {...rest}>
      {items?.map((item, i) =>
        item.href && i < items.length - 1 ? (
          <a key={i} className="oc-breadcrumb-item" href={item.href}>{item.label}</a>
        ) : (
          <span key={i} className="oc-breadcrumb-item" aria-current="page">{item.label}</span>
        ),
      )}
      {children}
    </nav>
  );
});
