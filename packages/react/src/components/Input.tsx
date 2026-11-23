// File: packages/react/src/components/Input.tsx
// Map: props (error, variant, module, mask, validationType) -> live mask on change (caret kept) -> validation on blur
//      -> <input class="oc-input">
// Mask and validation are the pure helpers of packages/ui/src/input-mask.js (also used by Vue and Blade).
"use client";

import { forwardRef, useState } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { applyMask, caretFor, countBefore, validate } from "../../../ui/src/input-mask.js";

export type InputMask = "iban" | "bic" | "vat" | "phone" | (string & {});
export type InputValidationType = "iban" | "bic" | "vat" | "email" | "phone";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state: adds `oc-input--error` and `aria-invalid`. */
  error?: boolean;
  /** Compact bookkeeping look (`oc-input--ledger`). */
  variant?: "ledger";
  /** Module colour name: sets `data-module` (the focus colour follows `--oc-module`). */
  module?: string;
  /** Live formatting: "iban", "bic", "vat", "phone" or a pattern (9 = digit, A = letter, * = any; "9999 AA"). */
  mask?: InputMask;
  /** Checked on blur: an invalid value gets `aria-invalid` + `oc-input--error`. An empty value is valid (use `required`). */
  validationType?: InputValidationType;
  /** Message for an invalid value; a surrounding FormField shows it when it has no `error` of its own. */
  validationMessage?: string;
  /** Called after every blur check (and when a wrong value becomes right while typing). */
  onValidate?: (valid: boolean, value: string) => void;
}

/** `<input class="oc-input">` */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, variant, module, mask, validationType, validationMessage: _message, onValidate, className, type = "text", onChange, onBlur, ...rest },
  ref,
) {
  const [invalid, setInvalid] = useState(false);
  const failed = error || invalid;

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (mask) {
      const before = input.value;
      const caret = input.selectionStart ?? before.length;
      const next = applyMask(mask, before);
      if (next !== before) {
        input.value = next;
        const at = caret >= before.length ? next.length : caretFor(next, countBefore(before, caret));
        try { input.setSelectionRange(at, at); } catch { /* no selection API for this input type */ }
      }
    }
    // Once a value was found wrong, the error goes away as soon as it is right.
    if (validationType && invalid && validate(validationType, input.value)) {
      setInvalid(false);
      onValidate?.(true, input.value);
    }
    onChange?.(e);
  };
  const blur = (e: FocusEvent<HTMLInputElement>) => {
    if (validationType) {
      const valid = validate(validationType, e.target.value);
      setInvalid(!valid);
      onValidate?.(valid, e.target.value);
    }
    onBlur?.(e);
  };

  return (
    <input
      ref={ref}
      type={type}
      className={cx("oc-input", failed && "oc-input--error", variant === "ledger" && "oc-input--ledger", className)}
      data-module={module}
      {...rest}
      {...(failed ? { "aria-invalid": true } : {})}
      onChange={mask || validationType || onChange ? change : undefined}
      onBlur={validationType || onBlur ? blur : undefined}
    />
  );
});
