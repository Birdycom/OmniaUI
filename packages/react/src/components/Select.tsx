import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cx } from "../utils";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Shortcut for `<option>` children. */
  options?: Array<SelectOption | string>;
}

/** `<select class="oc-select">` */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cx("oc-select", className)} {...rest}>
      {options?.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>;
      })}
      {children}
    </select>
  );
});
