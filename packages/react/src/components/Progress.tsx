import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  /** Maximum (default 100). */
  max?: number;
  /** Bar color. Wins over `levels`. */
  variant?: "default" | "success" | "warning" | "danger";
  /** Height: 4 px (xs), 6 px (sm) or 8 px (default). */
  size?: "xs" | "sm" | "md";
  /** Light top edge and a soft glow in the bar color. */
  glow?: boolean;
  /** Color by the value: warning from 70 %, danger from 90 %; or your own [warning, danger] limits in percent. */
  levels?: boolean | [number, number];
  /** A target or schedule point, in the unit of `value`: an upright line on the track. */
  marker?: number;
}

/** The bar color for `levels` at a percentage. */
export function progressLevel(pct: number, levels: true | [number, number]): "default" | "warning" | "danger" {
  const [warn, danger] = levels === true ? [70, 90] : levels;
  return pct >= danger ? "danger" : pct >= warn ? "warning" : "default";
}

/** `<div class="oc-progress" role="progressbar">` with an `oc-progress-bar` sized in percent. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, variant = "default", size = "md", glow, levels, marker, className, ...rest },
  ref,
) {
  const percent = (v: number) => (max > 0 ? Math.min(100, Math.max(0, (v / max) * 100)) : 0);
  const pct = Math.round(percent(value));
  const tone = variant === "default" && levels ? progressLevel(pct, levels) : variant;
  return (
    <div
      ref={ref}
      className={cx("oc-progress", size !== "md" && `oc-progress--${size}`, glow && "oc-progress--glow", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...rest}
    >
      <div className={cx("oc-progress-bar", tone !== "default" && `oc-progress-bar--${tone}`)} style={{ width: `${pct}%` }} />
      {marker != null && <span className="oc-progress-marker" style={{ left: `${percent(marker)}%` }} />}
    </div>
  );
});
