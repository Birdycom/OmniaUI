// File: packages/react/src/components/LinkArrow.tsx | Map: types -> LinkArrow (a.oc-link-arrow + modifiers)
import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cx } from "../utils";

export type LinkArrowDirection = "forward" | "back" | "external";

export interface LinkArrowProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  direction?: LinkArrowDirection;
  tone?: "default" | "accent" | "muted";
  size?: "sm" | "default" | "lg";
}

/** `<a class="oc-link-arrow">`: text link with an arrow that moves on hover and focus. */
export const LinkArrow = forwardRef<HTMLAnchorElement, LinkArrowProps>(function LinkArrow(
  { direction = "forward", tone = "default", size = "default", className, ...rest },
  ref,
) {
  const classes = cx(
    "oc-link-arrow",
    direction !== "forward" && `oc-link-arrow--${direction}`,
    tone !== "default" && `oc-link-arrow--${tone}`,
    size !== "default" && `oc-link-arrow--${size}`,
    className,
  );
  return <a ref={ref} className={classes} {...rest} />;
});
