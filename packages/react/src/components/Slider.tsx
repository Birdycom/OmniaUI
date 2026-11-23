// Same markup as packages/ui/snippets/slider.html.
"use client";

import { forwardRef } from "react";
import type { CSSProperties, ChangeEvent, InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "min" | "max" | "step"> {
  value?: number;
  defaultValue?: number;
  /** The new number after a move (the native `onChange` still fires too). */
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Vertical slider (`oc-slider--vertical`). */
  vertical?: boolean;
}

/** Fill length for `--oc-slider-progress` (clamped 0-100%). */
export function sliderProgress(value: number, min = 0, max = 100): string {
  const span = max - min;
  const pct = span > 0 ? ((value - min) / span) * 100 : 0;
  return `${Math.min(100, Math.max(0, pct))}%`;
}

/** Native range input (`.oc-slider`) that keeps `--oc-slider-progress` (the fill in Chromium/WebKit) in sync. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue, onValueChange, min = 0, max = 100, step, vertical, className, style, onChange, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllable<number>(value, defaultValue ?? 0, onValueChange);
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setCurrent(Number(e.target.value));
  };
  return (
    <input
      ref={ref}
      className={cx("oc-slider", vertical && "oc-slider--vertical", className)}
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      style={{ "--oc-slider-progress": sliderProgress(current, min, max), ...style } as CSSProperties}
      onChange={change}
      {...rest}
    />
  );
});
