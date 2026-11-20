// Same markup as packages/ui/snippets/spinner.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "muted";
  /** With a label the spinner is a role="status"; without one it is aria-hidden (e.g. inside a button). */
  label?: string;
}

/** Loading ring in currentColor (`.oc-spinner`, `--sm/--lg/--xl/--primary/--muted`). */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({ size, color, label, className, ...rest }, ref) {
  return (
    <span
      ref={ref}
      className={cx("oc-spinner", size && size !== "md" && `oc-spinner--${size}`, color && `oc-spinner--${color}`, className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      {...rest}
    />
  );
});
