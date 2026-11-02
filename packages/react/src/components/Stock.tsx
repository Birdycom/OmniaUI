// Same markup as packages/ui/snippets/stock.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface StockProps extends HTMLAttributes<HTMLSpanElement> {
  level?: "ok" | "low" | "out" | "order";
  badge?: boolean;
  /** The text; default per level ("In stock", "Low stock", "Out of stock", "On order"). */
  children?: ReactNode;
  /** A quiet extra after the text. */
  note?: ReactNode;
}

const STOCK_TEXT = { ok: "In stock", low: "Low stock", out: "Out of stock", order: "On order" } as const;

/** Stock status with a colored dot (`.oc-stock`). */
export const Stock = forwardRef<HTMLSpanElement, StockProps>(function Stock(
  { level = "ok", badge, note, children, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx("oc-stock", badge && "oc-stock--badge", className)} data-level={level === "ok" ? undefined : level} {...rest}>
      {children ?? STOCK_TEXT[level]}
      {note != null && <span className="oc-stock__note"> · {note}</span>}
    </span>
  );
});
