// File: packages/react/src/components/FactList.tsx | Map: types -> FactList (dl.oc-fact-list -> div > dt + dd)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FactListRow {
  label: ReactNode;
  value: ReactNode;
}

export interface FactListProps extends HTMLAttributes<HTMLDListElement> {
  items: FactListRow[];
  plain?: boolean;
  compact?: boolean;
  stacked?: boolean;
  /** Values in the accent color. */
  accent?: boolean;
}

/** `<dl class="oc-fact-list">`: key / value product facts (variant of the definition list). */
export const FactList = forwardRef<HTMLDListElement, FactListProps>(function FactList(
  { items, plain = false, compact = false, stacked = false, accent = false, className, ...rest },
  ref,
) {
  const classes = cx(
    "oc-fact-list",
    plain && "oc-fact-list--plain",
    compact && "oc-fact-list--compact",
    stacked && "oc-fact-list--stacked",
    accent && "oc-fact-list--accent",
    className,
  );
  return (
    <dl ref={ref} className={classes} {...rest}>
      {items.map((row, i) => (
        <div key={i}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
});
