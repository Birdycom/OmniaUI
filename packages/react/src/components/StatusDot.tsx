// File: packages/react/src/components/StatusDot.tsx | Map: types -> StatusDot (span.oc-status-dot) -> Status (p.oc-status: dot + text + meta)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type StatusTone = "default" | "working" | "waiting" | "done" | "error" | "idle";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  size?: "sm" | "md" | "lg";
  /** Says the state when the dot stands alone (role="img"); without it the dot is aria-hidden. */
  label?: string;
}

/** `<span class="oc-status-dot oc-status-dot--{tone}">`: a live state light; --working pulses. */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { tone = "default", size = "md", label, className, ...rest },
  ref,
) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <span
      ref={ref}
      className={cx("oc-status-dot", tone !== "default" && `oc-status-dot--${tone}`, size !== "md" && `oc-status-dot--${size}`, className)}
      {...a11y}
      {...rest}
    />
  );
});

export interface StatusProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: StatusTone;
  /** Right-aligned extra (a time, a count) in tabular numbers. */
  meta?: ReactNode;
  /** The state in words; cuts off with … on one line. */
  children?: ReactNode;
}

/** `<p class="oc-status">`: dot + one line of state text + optional meta. */
export const Status = forwardRef<HTMLParagraphElement, StatusProps>(function Status(
  { tone = "default", meta, className, children, ...rest },
  ref,
) {
  return (
    <p ref={ref} className={cx("oc-status", className)} {...rest}>
      <StatusDot tone={tone} />
      <span className="oc-status__text">{children}</span>
      {meta != null && <span className="oc-status__meta">{meta}</span>}
    </p>
  );
});
