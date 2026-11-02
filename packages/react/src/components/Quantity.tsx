"use client";

// Same markup as packages/ui/snippets/quantity.html.
import { forwardRef, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { stepQuantity } from "../../../ui/src/form-extras.js";
import { cx } from "../utils";
import { Icon } from "./Icon";

export interface QuantityProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "md";
  /** Accessible name of the field (also used for the buttons). Default "Quantity". */
  label?: string;
}

/** Minus, number and plus in one frame (`.oc-quantity`). */
export const Quantity = forwardRef<HTMLInputElement, QuantityProps>(function Quantity(
  { value, defaultValue = 1, onChange, min = 0, max, step = 1, size = "md", label = "Quantity", disabled, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useState(value ?? defaultValue);
  useEffect(() => { if (value !== undefined) setCurrent(value); }, [value]);
  const limits = { min, max: max ?? Infinity, step };
  const set = (next: number) => { setCurrent(next); onChange?.(next); };
  return (
    <div className={cx("oc-quantity", size === "sm" && "oc-quantity--sm", className)}>
      <button className="oc-quantity__step" type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={disabled || current <= min} onClick={() => set(stepQuantity(current, -1, limits))}>
        <Icon d="M19 13H5v-2h14z" />
      </button>
      <input
        ref={ref}
        className="oc-quantity__input"
        type="number"
        inputMode="numeric"
        value={Number.isFinite(current) ? current : ""}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        disabled={disabled}
        onChange={(event) => set(event.target.value === "" ? NaN : Number(event.target.value))}
        {...rest}
      />
      <button className="oc-quantity__step" type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={disabled || (max != null && current >= max)} onClick={() => set(stepQuantity(current, 1, limits))}>
        <Icon d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
      </button>
    </div>
  );
});
