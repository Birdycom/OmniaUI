// Same markup as packages/ui/snippets/aspect-ratio.html.
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils";

export type AspectRatioPreset = "square" | "photo" | "portrait" | "wide";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** A preset, a number (1.5) or a CSS ratio ("5 / 2"); default 16 / 9. */
  ratio?: AspectRatioPreset | number | string;
  /** Center the content (`oc-aspect--center`). */
  center?: boolean;
  /** No rounded corners and no background (`oc-aspect--flush`), for a picture edge to edge. */
  flush?: boolean;
}

const PRESETS = ["square", "photo", "portrait", "wide"];

/** Aspect-ratio box (`.oc-aspect`, `--square/--photo/--portrait/--wide/--center/--flush`, a custom ratio via `--oc-aspect`). */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio({ ratio, center, flush, className, style, ...rest }, ref) {
  const preset = typeof ratio === "string" && PRESETS.includes(ratio) ? ratio : undefined;
  const custom = ratio !== undefined && !preset ? String(ratio) : undefined;
  return (
    <div
      ref={ref}
      className={cx("oc-aspect", preset && `oc-aspect--${preset}`, center && "oc-aspect--center", flush && "oc-aspect--flush", className)}
      style={custom ? ({ "--oc-aspect": custom, ...style } as CSSProperties) : style}
      {...rest}
    />
  );
});
