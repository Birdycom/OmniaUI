import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> {
  /** Class for the wrapping label (`className` goes to the input). */
  labelClassName?: string;
}

/** `<label class="oc-switch"><input type="checkbox" role="switch">`. Works controlled (`checked`) or uncontrolled. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ labelClassName, className, ...rest }, ref) {
  return (
    <label className={cx("oc-switch", labelClassName)}>
      <input ref={ref} type="checkbox" role="switch" className={className} {...rest} />
      <span className="oc-switch-track" />
    </label>
  );
});
