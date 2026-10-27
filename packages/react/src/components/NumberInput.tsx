// File: packages/react/src/components/NumberInput.tsx
// Map: props -> clamp helper -> component (minus button, number field, plus button)
// Same markup as packages/ui/snippets/number-input.html. The buttons are handled here (no page script needed).
"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type" | "min" | "max" | "step"> {
  /** Current number; null = empty field. */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "md";
  /** Full width. */
  block?: boolean;
  error?: boolean;
  decrementLabel?: string;
  incrementLabel?: string;
}

/** Keep a number inside min/max and drop float noise (0.1 + 0.2). */
function clamp(n: number, min?: number, max?: number) {
  const rounded = Math.round(n * 1e6) / 1e6;
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
}

/** `.oc-number-input`: number field with - / + buttons. Buttons disable themselves at min / max. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, defaultValue, onChange, min, max, step = 1, size = "md", block, error, decrementLabel = "Decrease", incrementLabel = "Increase", className, disabled, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllable<number | null>(value, defaultValue ?? null, onChange);
  const stepBy = (dir: 1 | -1) => setCurrent(clamp((current ?? min ?? 0) + dir * step, min, max));

  return (
    <div className={cx("oc-number-input", size === "sm" && "oc-number-input--sm", block && "oc-number-input--block", error && "oc-number-input--error", className)}>
      <button className="oc-number-input-step" type="button" aria-label={decrementLabel} disabled={disabled || (min != null && current != null && current <= min)} onClick={() => stepBy(-1)}>
        &minus;
      </button>
      <input
        ref={ref}
        className="oc-number-input-field"
        type="number"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        value={current ?? ""}
        onChange={(e) => setCurrent(e.target.value === "" ? null : Number(e.target.value))}
        {...rest}
      />
      <button className="oc-number-input-step" type="button" aria-label={incrementLabel} disabled={disabled || (max != null && current != null && current >= max)} onClick={() => stepBy(1)}>
        +
      </button>
    </div>
  );
});
