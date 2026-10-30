// File: packages/react/src/components/Glass.tsx | Map: types -> Glass (sheet: --strong, --flat) -> GlassPanel (layer: --strong)
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface GlassProps extends HTMLAttributes<HTMLElement> {
  /** More opaque, for text-heavy content. */
  strong?: boolean;
  /** Desktop window where the OS draws the blur: no own blur, no drop shadow. */
  flat?: boolean;
  as?: "div" | "section" | "aside" | "article" | "main";
}

/** `.oc-glass`: see-through sheet with a light top edge; .oc-card inside becomes a glass panel. */
export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  { strong, flat, as: Tag = "div", className, ...rest },
  ref,
) {
  return <Tag ref={ref as React.Ref<HTMLDivElement>} className={cx("oc-glass", strong && "oc-glass--strong", flat && "oc-glass--flat", className)} {...rest} />;
});

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

/** `.oc-glass-panel`: a lighter layer inside a glass sheet. */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel({ strong, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-glass-panel", strong && "oc-glass-panel--strong", className)} {...rest} />;
});
