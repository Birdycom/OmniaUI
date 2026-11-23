"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { CSSProperties, InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable, useMergedRef } from "../hooks";
import { bindOtp } from "../../../ui/src/form-extras.js";

export interface OtpInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "maxLength"> {
  /** Code length (default 6). */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called once when `length` characters have been entered. Runs AFTER the value update has rendered (an effect), so a
   *  controlled parent (`form.setData`) already holds the full code when it submits from here. 0.17.1: also when a controlled
   *  `value` arrives complete from outside (a code from a link or the server), on mount too; once per distinct code. */
  onComplete?: (value: string) => void;
  /** Error state (`aria-invalid`). */
  invalid?: boolean;
  /** Allow letters as well as digits. */
  alphanumeric?: boolean;
  /** The cells shrink with the room the parent gives (an 8-character code on a phone). */
  fit?: boolean;
  /** A divider after every n cells (4: "ABCD EFGH"). */
  group?: number;
}

/** `<input class="oc-otp">`: separate cells drawn on a single real input. */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  { length = 6, value, defaultValue = "", onChange, onComplete, invalid, alphanumeric, fit, group, className, style, ...rest },
  ref,
) {
  const [code, setCode] = useControllable<string>(value, defaultValue, onChange);
  // onComplete waits for the render with the new value: the latest callback (fresh parent closure) gets the code
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const fired = useRef<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    if (code.length !== length) { fired.current = null; return; }
    if (fired.current === code) return;
    fired.current = code;
    // An uncontrolled defaultValue that is already complete is not "entered": no call on mount.
    if (first && value === undefined) return;
    completeRef.current?.(code);
  }, [code, length, value]);
  // 0.17.1: mark the cell the caret is in (data-otp-active, forms-otp-active.css).
  const own = useRef<HTMLInputElement>(null);
  const setRef = useMergedRef(ref, own);
  useEffect(() => (own.current ? bindOtp(own.current) : undefined), []);
  return (
    <input
      ref={setRef}
      className={cx("oc-otp", fit && "oc-otp--fit", group ? "oc-otp--group" : undefined, className)}
      type="text"
      inputMode={alphanumeric ? "text" : "numeric"}
      autoComplete="one-time-code"
      maxLength={length}
      pattern={alphanumeric ? undefined : "[0-9]*"}
      style={{ "--oc-otp-length": length, ...(group ? { "--oc-otp-group": group } : {}), ...style } as CSSProperties}
      aria-invalid={invalid ? true : undefined}
      value={code}
      onChange={(e) => {
        const next = alphanumeric ? e.target.value : e.target.value.replace(/\D/g, "");
        setCode(next);
      }}
      {...rest}
    />
  );
});
