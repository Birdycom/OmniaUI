// File: packages/react/src/components/ModeBadge.tsx
// Map: types -> default words -> ModeBadge (span.oc-mode-badge[data-mode]; "both" as two parts)
// Test and live at a glance, in fixed colors (--oc-mode-test, --oc-mode-live). Same markup as snippets/mode-badge.html.

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type Mode = "test" | "live" | "both";

export interface ModeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  mode: Mode;
  size?: "sm" | "md" | "lg";
  /** Words for the parts (translate them): default { test: "Test", live: "Live" }. */
  labels?: { test?: ReactNode; live?: ReactNode };
}

/** `.oc-mode-badge`: TEST, LIVE, or TEST and LIVE side by side. */
export const ModeBadge = forwardRef<HTMLSpanElement, ModeBadgeProps>(function ModeBadge(
  { mode, size = "md", labels, className, children, ...rest },
  ref,
) {
  const test = labels?.test ?? "Test";
  const live = labels?.live ?? "Live";
  return (
    <span ref={ref} className={cx("oc-mode-badge", size !== "md" && `oc-mode-badge--${size}`, className)} data-mode={mode} {...rest}>
      {children ?? (mode === "both" ? <><span>{test}</span><span>{live}</span></> : mode === "live" ? live : test)}
    </span>
  );
});
