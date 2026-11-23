import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cx } from "../utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  /** Compact bookkeeping look (`oc-textarea--ledger`). */
  variant?: "ledger";
  /** Module colour name: sets `data-module` (the focus colour follows `--oc-module`). */
  module?: string;
}

/** `<textarea class="oc-input">` */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ error, variant, module, className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx("oc-input", error && "oc-input--error", variant === "ledger" && "oc-textarea--ledger", className)}
      aria-invalid={error ? true : rest["aria-invalid"]}
      data-module={module}
      {...rest}
    />
  );
});
