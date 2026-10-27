import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils";

export interface CounterProps extends HTMLAttributes<HTMLElement> {
  /** Target number (`--oc-counter-to`). */
  to: number;
  /** Text after the number, e.g. `+` or `%` (`--oc-counter-suffix`). */
  suffix?: string;
  /** Start animating when scrolled into view (default true). */
  onView?: boolean;
}

/** `<strong class="oc-counter oc-counter--on-view">`: animated number, CSS only. */
export const Counter = forwardRef<HTMLElement, CounterProps>(function Counter(
  { to, suffix, onView = true, className, style, ...rest },
  ref,
) {
  const vars = { "--oc-counter-to": to, ...(suffix ? { "--oc-counter-suffix": `'${suffix}'` } : {}) } as CSSProperties;
  return <strong ref={ref} className={cx("oc-counter", onView && "oc-counter--on-view", className)} style={{ ...vars, ...style }} {...rest} />;
});
