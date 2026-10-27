// File: packages/react/src/components/TopProgress.tsx
// Map: TopProgress = progress.oc-top-progress -> phase state (hidden / active / done) -> fade-out timer
// `active` true shows the bar. When it turns false the bar gets `.is-done` (fades out),
// and after the fade it is hidden again. Without `value` the bar is indeterminate.
"use client";

import { forwardRef, useEffect, useState } from "react";
import type { ProgressHTMLAttributes } from "react";
import { cx } from "../utils";

export type TopProgressTone = "default" | "success" | "warning" | "danger" | "brand";

export interface TopProgressProps extends ProgressHTMLAttributes<HTMLProgressElement> {
  /** Show the bar (a request or page load is running). Default true. */
  active?: boolean;
  tone?: TopProgressTone;
  /** 4px instead of 2px. */
  large?: boolean;
  /** In the normal flow (e.g. inside a card) instead of fixed at the top. */
  static?: boolean;
  /** Fade-out time in ms before the bar is hidden. */
  fadeMs?: number;
}

type Phase = "hidden" | "active" | "done";

/** `progress.oc-top-progress`: thin loading bar at the top of the page. */
export const TopProgress = forwardRef<HTMLProgressElement, TopProgressProps>(function TopProgress(
  { active = true, tone = "default", large, static: inFlow, fadeMs = 400, className, ...rest },
  ref,
) {
  const [phase, setPhase] = useState<Phase>(active ? "active" : "hidden");

  useEffect(() => {
    if (active) {
      setPhase("active");
      return;
    }
    // Only fade out when the bar was visible; keep it hidden otherwise.
    setPhase((p) => (p === "hidden" ? "hidden" : "done"));
    const timer = setTimeout(() => setPhase("hidden"), fadeMs);
    return () => clearTimeout(timer);
  }, [active, fadeMs]);

  const cls = cx(
    "oc-top-progress",
    tone !== "default" && `oc-top-progress--${tone}`,
    large && "oc-top-progress--lg",
    inFlow && "oc-top-progress--static",
    phase === "done" && "is-done",
    className,
  );
  return <progress ref={ref} className={cls} hidden={phase === "hidden"} {...rest} />;
});
