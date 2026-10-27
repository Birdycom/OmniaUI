import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** When set the input is wrapped in a <label> with this text. */
  label?: ReactNode;
}

/** `<input class="oc-checkbox" type="checkbox">`, wrapped in a label when `label` is given. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, ...rest }, ref) {
  const input = <input ref={ref} type="checkbox" className={cx("oc-checkbox", className)} {...rest} />;
  return label != null ? <label>{input} {label}</label> : input;
});
