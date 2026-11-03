// Same markup as packages/ui/snippets/callout.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /** The button (or buttons) on the right. */
  action?: ReactNode;
}

/** Small card with a text (children) on the left and an action on the right (`.oc-callout`). */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout({ action, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("oc-callout", className)} {...rest}>
      <div className="oc-callout__text">{children}</div>
      {action != null && <div className="oc-callout__action">{action}</div>}
    </div>
  );
});
