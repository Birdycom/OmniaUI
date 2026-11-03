// Same markup as packages/ui/snippets/panel.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Soft light in a corner: start (top start), end (top end) or both (two lights). */
  glow?: "start" | "end" | "both";
}

/** Framed panel for a form, a call to action or a feature (`.oc-panel`). */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel({ glow, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cx("oc-panel", (glow === "start" || glow === "end") && "oc-panel--glow", glow === "end" && "oc-panel--glow-end", glow === "both" && "oc-panel--glow-both", className)}
      {...rest}
    />
  );
});
