// Same markup as packages/ui/snippets/separator.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface SeparatorProps extends HTMLAttributes<HTMLElement> {
  /** Inline separator for flex rows (`oc-separator--vertical`). */
  vertical?: boolean;
  /** Stronger line (`oc-separator--strong`). */
  strong?: boolean;
  /** Text between two lines (`.oc-separator-text`); children do the same. */
  label?: ReactNode;
}

/**
 * Divider. Default `<hr class="oc-separator">`; `vertical` an inline separator; `label` (or children) the
 * line-text-line form (`.oc-separator-text`).
 */
export const Separator = forwardRef<HTMLElement, SeparatorProps>(function Separator({ vertical, strong, label, className, children, ...rest }, ref) {
  const text = children ?? label;
  if (text != null && text !== false) {
    return <div ref={ref as React.Ref<HTMLDivElement>} className={cx("oc-separator-text", className)} role="separator" {...rest}><span>{text}</span></div>;
  }
  if (vertical) {
    return <span ref={ref as React.Ref<HTMLSpanElement>} className={cx("oc-separator", "oc-separator--vertical", strong && "oc-separator--strong", className)} role="separator" aria-orientation="vertical" {...rest} />;
  }
  return <hr ref={ref as React.Ref<HTMLHRElement>} className={cx("oc-separator", strong && "oc-separator--strong", className)} {...rest} />;
});
