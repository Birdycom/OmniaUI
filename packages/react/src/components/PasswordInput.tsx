"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showLabel?: string;
  hideLabel?: string;
  /** Accessible name of the toggle button. */
  toggleLabel?: string;
  error?: boolean;
}

/** Password field with a show / hide button (`aria-pressed`), inside `.oc-input-reveal`. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { showLabel = "Show", hideLabel = "Hide", toggleLabel = "Toggle password visibility", error, className, ...rest },
  ref,
) {
  const [shown, setShown] = useState(false);
  return (
    <div className="oc-input-reveal">
      <input
        ref={ref}
        className={cx("oc-input", error && "oc-input--error", className)}
        type={shown ? "text" : "password"}
        autoComplete="current-password"
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <button className="oc-input-reveal-button" type="button" aria-pressed={shown} aria-label={toggleLabel} onClick={() => setShown((s) => !s)}>
        {shown ? hideLabel : showLabel}
      </button>
    </div>
  );
});
