// Same markup as packages/ui/snippets/scroll-area.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll sideways (`oc-scroll-area--x`). */
  horizontal?: boolean;
  /** Shadows at the edges that can still scroll (`oc-scroll-area--shadows`). */
  shadows?: boolean;
  /** 0.18.0: only the scrolling and the themed scrollbar, no padding, frame or height cap (`oc-scroll-area--bare`). */
  bare?: boolean;
  /** Accessible name (aria-label). */
  label?: string;
}

/** Bounded scroll region with a themed scrollbar: focusable, role="region" (`.oc-scroll-area`). */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({ horizontal, shadows, bare, label, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cx("oc-scroll-area", horizontal && "oc-scroll-area--x", shadows && "oc-scroll-area--shadows", bare && "oc-scroll-area--bare", className)}
      tabIndex={0}
      role="region"
      aria-label={label}
      {...rest}
    />
  );
});
