// Same markup as packages/ui/snippets/ribbon.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type RibbonCorner = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export interface RibbonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Corner of the parent box (default top-end). */
  corner?: RibbonCorner;
  tone?: "primary" | "success" | "warning" | "destructive" | "muted";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

/** Diagonal band across a corner of its parent (`.oc-ribbon`): Paid, New, Sale. */
export const Ribbon = forwardRef<HTMLSpanElement, RibbonProps>(function Ribbon(
  { corner = "top-end", tone = "primary", size = "md", className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("oc-ribbon", corner !== "top-end" && `oc-ribbon--${corner}`, tone !== "primary" && `oc-ribbon--${tone}`, size !== "md" && `oc-ribbon--${size}`, className)}
      {...rest}
    >
      {children}
    </span>
  );
});
