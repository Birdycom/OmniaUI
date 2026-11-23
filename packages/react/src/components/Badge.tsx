import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" | "module";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Leading icon: a webicon name (`"mdi:check"`) or any node. Decorative; the text (or `title`) names the badge. */
  icon?: ReactNode;
  /** Tooltip; on a badge without text it is also the accessible name (`role="img"` + `aria-label`). */
  title?: string;
  /**
   * 0.17.0: module colour (`data-module`): blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name.
   * A default badge then takes the solid module colour; `variant="module"` is the soft tint (also from a module on an ancestor).
   */
  module?: string;
}

/** `<span class="oc-badge oc-badge--{variant}">` */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant = "default", icon, title, module, className, children, ...rest }, ref) {
  const iconOnly = icon != null && (children == null || children === false || children === "");
  const a11y = iconOnly && title ? { role: "img", "aria-label": title } : {};
  return (
    <span ref={ref} className={cx("oc-badge", variant !== "default" && `oc-badge--${variant}`, className)} title={title} data-module={module || undefined} {...a11y} {...rest}>
      {icon != null && (typeof icon === "string" ? <Webicon name={icon} bare fallback="iconify" /> : icon)}
      {children}
    </span>
  );
});
