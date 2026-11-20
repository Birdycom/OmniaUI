// Same markup as packages/ui/snippets/button-group.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Stack the buttons (`oc-btn-group--vertical`). */
  vertical?: boolean;
  /** Accessible name of the group (aria-label). */
  label?: string;
}

/** Joined buttons with shared borders (`.oc-btn-group`). Put `<Button variant="outline">` and `<ButtonGroupText>` inside. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({ vertical, label, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-btn-group", vertical && "oc-btn-group--vertical", className)} role="group" aria-label={label} {...rest} />;
});

/** Static text cell inside a ButtonGroup (a count, a unit): `.oc-btn-group-text`. */
export const ButtonGroupText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function ButtonGroupText({ className, ...rest }, ref) {
  return <span ref={ref} className={cx("oc-btn-group-text", className)} {...rest} />;
});
