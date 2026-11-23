// File: packages/react/src/components/Scrim.tsx | Map: types -> Scrim (span.oc-scrim + side / dark modifiers, tokens as style)
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils";

export type ScrimSide = "bottom" | "top" | "start" | "end" | "full";

export interface ScrimProps extends HTMLAttributes<HTMLSpanElement> {
  /** Edge where the scrim is strongest (default bottom); `full` is one even layer. */
  side?: ScrimSide;
  /** Near-black scrim for light text (`.oc-scrim--dark`). Default: the page background. */
  dark?: boolean;
  /** Opacity at the edge, 0 to 1 (`--oc-scrim-strength`, default 0.85). */
  strength?: number;
  /** How far the fade reaches, e.g. "60%" or "12rem" (`--oc-scrim-size`). */
  size?: string;
  /** Own scrim color (`--oc-scrim-color`). */
  color?: string;
}

/**
 * `<span class="oc-scrim">`: a calm fade over a picture so text on it stays readable. Put it inside a positioned element
 * (`className="relative"`) after the image; text on top gets `className="oc-scrim-content"`. Decorative: aria-hidden.
 */
export const Scrim = forwardRef<HTMLSpanElement, ScrimProps>(function Scrim(
  { side = "bottom", dark = false, strength, size, color, className, style, ...rest },
  ref,
) {
  const vars: Record<string, string> = {};
  if (strength != null) vars["--oc-scrim-strength"] = String(strength);
  if (size) vars["--oc-scrim-size"] = size;
  if (color) vars["--oc-scrim-color"] = color;
  return (
    <span
      ref={ref}
      className={cx("oc-scrim", side !== "bottom" && `oc-scrim--${side}`, dark && "oc-scrim--dark", className)}
      style={{ ...(vars as CSSProperties), ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
});
