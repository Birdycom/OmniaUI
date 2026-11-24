// File: packages/react/src/components/ModeBadge.tsx
// Map: types -> default words -> ModeBadge (span.oc-mode-badge[data-mode]; "both" as two parts)
// Test and live at a glance, in fixed colors (--oc-mode-test, --oc-mode-live). Same markup as snippets/mode-badge.html.

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

/** 0.18.0: also `staging` and `offline`. */
export type Mode = "test" | "live" | "both" | "staging" | "offline";

export interface ModeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  mode: Mode;
  size?: "sm" | "md" | "lg";
  /** Words for the parts (translate them): default { test: "Test", live: "Live", staging: "Staging", offline: "Offline" }. */
  labels?: { test?: ReactNode; live?: ReactNode; staging?: ReactNode; offline?: ReactNode };
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
      {children ?? (mode === "both" ? <><span>{test}</span><span>{live}</span></> : mode === "live" ? live : mode === "staging" ? (labels?.staging ?? "Staging") : mode === "offline" ? (labels?.offline ?? "Offline") : test)}
    </span>
  );
});
export interface EnvFrameProps extends HTMLAttributes<HTMLDivElement> {
  mode: Exclude<Mode, "both">;
  /** Inside a container (position: relative) instead of around the viewport (`oc-env-frame--contained`). */
  contained?: boolean;
}

/** 0.18.0: `div.oc-env-frame`: a colored line around the viewport in the mode color (pointer-events: none). */
export const EnvFrame = forwardRef<HTMLDivElement, EnvFrameProps>(function EnvFrame({ mode, contained, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-env-frame", contained && "oc-env-frame--contained", className)} data-mode={mode} aria-hidden="true" {...rest} />;
});
