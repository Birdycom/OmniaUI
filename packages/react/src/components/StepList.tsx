// Same markup as packages/ui/snippets/step-list.html.
import { forwardRef } from "react";
import type { OlHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface StepListProps extends OlHTMLAttributes<HTMLOListElement> {
  /** One node per step; or pass <li> elements as children. */
  items?: ReactNode[];
  /** Tighter rows and a smaller text. */
  size?: "md" | "sm";
}

/** Compact numbered list of steps (`ol.oc-step-list`); the numbers take the color of a severity card around it. */
export const StepList = forwardRef<HTMLOListElement, StepListProps>(function StepList({ items, size, className, children, ...rest }, ref) {
  return (
    <ol ref={ref} className={cx("oc-step-list", size === "sm" && "oc-step-list--sm", className)} {...rest}>
      {items?.map((item, i) => <li key={i}>{item}</li>)}
      {children}
    </ol>
  );
});
