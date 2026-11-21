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
  /** Compact bookkeeping look (`oc-select--ledger`). */
  variant?: "ledger";
  /** Module colour name: sets `data-module` (the focus colour follows `--oc-module`). */
  module?: string;
}

/** `<select class="oc-select">` */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, variant, module, className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cx("oc-select", variant === "ledger" && "oc-select--ledger", className)} data-module={module} {...rest}>
      {options?.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>;
      })}
      {children}
    </select>
  );
});
