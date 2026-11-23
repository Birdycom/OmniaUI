import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface InputGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "prefix"> {
  /** Addon before the input (currency sign...). */
  prefix?: ReactNode;
  /** Addon after the input (%, unit...). */
  suffix?: ReactNode;
  /** Compact bookkeeping look (`oc-input-group--ledger`); give the child Input `variant="ledger"` too. */
  variant?: "ledger";
  /** Module colour name: sets `data-module`. */
  module?: string;
}

/** `<div class="oc-input-group">` with `oc-input-addon` spans around the child `<Input>`. */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { prefix, suffix, variant, module, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-input-group", variant === "ledger" && "oc-input-group--ledger", className)} data-module={module} {...rest}>
      {prefix != null && <span className="oc-input-addon">{prefix}</span>}
      {children}
      {suffix != null && <span className="oc-input-addon">{suffix}</span>}
    </div>
  );
});
