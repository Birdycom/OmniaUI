import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state: adds `oc-input--error` and `aria-invalid`. */
  error?: boolean;
}

/** `<input class="oc-input">` */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ error, className, type = "text", ...rest }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cx("oc-input", error && "oc-input--error", className)}
      aria-invalid={error ? true : rest["aria-invalid"]}
      {...rest}
    />
  );
});
