import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/** `<span class="oc-badge oc-badge--{variant}">` */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant = "default", className, ...rest }, ref) {
  return <span ref={ref} className={cx("oc-badge", variant !== "default" && `oc-badge--${variant}`, className)} {...rest} />;
});
