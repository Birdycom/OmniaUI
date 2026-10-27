import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  /** Maximum (default 100). */
  max?: number;
  /** Bar color. */
  variant?: "default" | "success" | "warning" | "danger";
}

/** `<div class="oc-progress" role="progressbar">` with an `oc-progress-bar` sized in percent. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, variant = "default", className, ...rest },
  ref,
) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div
      ref={ref}
      className={cx("oc-progress", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...rest}
    >
      <div className={cx("oc-progress-bar", variant !== "default" && `oc-progress-bar--${variant}`)} style={{ width: `${pct}%` }} />
    </div>
  );
});
