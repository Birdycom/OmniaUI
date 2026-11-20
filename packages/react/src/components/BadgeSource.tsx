// File: packages/react/src/components/BadgeSource.tsx
// Map: types -> BadgeSource (span.oc-badge-source | -file | -scss)
// Same markup as the source badges on the badge page: a small pill that says where a piece comes from.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface BadgeSourceProps extends HTMLAttributes<HTMLSpanElement> {
  /** source = a component or package (teal), file = a file path (purple), scss = a stylesheet (orange). */
  kind?: "source" | "file" | "scss";
}

/** `.oc-badge-source` / `.oc-badge-source-file` / `.oc-badge-source-scss`. */
export const BadgeSource = forwardRef<HTMLSpanElement, BadgeSourceProps>(function BadgeSource({ kind = "source", className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx(kind === "source" ? "oc-badge-source" : `oc-badge-source-${kind}`, className)} {...rest}>
      {children}
    </span>
  );
});
