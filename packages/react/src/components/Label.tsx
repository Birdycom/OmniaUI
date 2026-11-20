// Same markup as packages/ui/snippets/label.html.
import { forwardRef } from "react";
import type { LabelHTMLAttributes } from "react";
import { cx } from "../utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Asterisk after the text (`oc-label--required`). */
  required?: boolean;
  /** Wraps a checkbox or radio on one line (`oc-label--inline`). */
  inline?: boolean;
  /** Muted text (`oc-label--muted`). */
  muted?: boolean;
}

/** Form label (`.oc-label`); `htmlFor` links it to a control. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ required, inline, muted, className, ...rest }, ref) {
  return <label ref={ref} className={cx("oc-label", required && "oc-label--required", inline && "oc-label--inline", muted && "oc-label--muted", className)} {...rest} />;
});
