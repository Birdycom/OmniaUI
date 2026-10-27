"use client";

import { forwardRef } from "react";
import type { CSSProperties, InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface OtpInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "maxLength"> {
  /** Code length (default 6). */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called once when `length` characters have been entered. */
  onComplete?: (value: string) => void;
  /** Error state (`aria-invalid`). */
  invalid?: boolean;
  /** Allow letters as well as digits. */
  alphanumeric?: boolean;
}

/** `<input class="oc-otp">`: separate cells drawn on a single real input. */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  { length = 6, value, defaultValue = "", onChange, onComplete, invalid, alphanumeric, className, style, ...rest },
  ref,
) {
  const [code, setCode] = useControllable<string>(value, defaultValue, onChange);
  return (
    <input
      ref={ref}
      className={cx("oc-otp", className)}
      type="text"
      inputMode={alphanumeric ? "text" : "numeric"}
      autoComplete="one-time-code"
      maxLength={length}
      pattern={alphanumeric ? undefined : "[0-9]*"}
      style={{ "--oc-otp-length": length, ...style } as CSSProperties}
      aria-invalid={invalid ? true : undefined}
      value={code}
      onChange={(e) => {
        const next = alphanumeric ? e.target.value : e.target.value.replace(/\D/g, "");
        setCode(next);
        if (next.length === length) onComplete?.(next);
      }}
      {...rest}
    />
  );
});
