// Same markup as packages/ui/snippets/reading.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ReadingProps extends HTMLAttributes<HTMLSpanElement> {
  /** cool (muted, default), warm (warning) or hot (destructive). */
  level?: "cool" | "warm" | "hot";
}

/** A small measured value ("57 °C") in tabular numbers (`.oc-reading`). */
export const Reading = forwardRef<HTMLSpanElement, ReadingProps>(function Reading({ level, className, ...rest }, ref) {
  return <span ref={ref} className={cx("oc-reading", level && level !== "cool" && `oc-reading--${level}`, className)} {...rest} />;
});
