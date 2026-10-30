// File: packages/react/src/components/Watermark.tsx | Map: types -> Watermark (span.oc-watermark + modifiers, text once or tiled)
import { forwardRef, Fragment } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type WatermarkVariant = "diagonal" | "straight" | "tile" | "corner" | "corner-top";
export type WatermarkTone = "default" | "light" | "primary" | "destructive";

export interface WatermarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** The text ("Concept", "Draft"), or a logo (<img>) or icon (<svg>). */
  text?: ReactNode;
  variant?: WatermarkVariant;
  tone?: WatermarkTone;
  /** How often the text repeats with variant="tile". */
  repeat?: number;
  /** Turn an <img> logo into a flat gray stamp. */
  mono?: boolean;
}

/**
 * `<span class="oc-watermark">`: light text over its positioned parent (put it last inside an element with
 * `className="relative"`). Click-through and aria-hidden: say "draft" in the content itself when it matters.
 */
export const Watermark = forwardRef<HTMLSpanElement, WatermarkProps>(function Watermark(
  { text = "Concept", variant = "diagonal", tone = "default", repeat = 12, mono = false, className, ...rest },
  ref,
) {
  const classes = cx("oc-watermark", variant !== "diagonal" && `oc-watermark--${variant}`, tone !== "default" && `oc-watermark--${tone}`, mono && "oc-watermark--mono", className);
  const count = variant === "tile" ? Math.max(1, repeat) : 1;
  return (
    <span ref={ref} className={classes} aria-hidden="true" {...rest}>
      {Array.from({ length: count }, (_, i) => (typeof text === "string" || typeof text === "number" ? <span key={i}>{text}</span> : <Fragment key={i}>{text}</Fragment>))}
    </span>
  );
});
