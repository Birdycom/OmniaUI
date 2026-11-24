// File: packages/react/src/components/StatList.tsx
// Map: items -> dl.oc-dl.oc-dl--stat -> rows (label + sublabel, value) -> total row
// Stat list (0.18.0): label / value rows in tabular numbers with a total row, on the definition list (oc-dl) markup.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface StatListItem {
  label: ReactNode;
  value: ReactNode;
  /** Small text under the label. */
  sublabel?: ReactNode;
}

export interface StatListProps extends HTMLAttributes<HTMLDListElement> {
  items: StatListItem[];
  /** The total row at the end (`.oc-dl-row--total`). */
  total?: StatListItem;
}

/** `dl.oc-dl.oc-dl--stat`: a score or cost breakdown with a total row. */
export const StatList = forwardRef<HTMLDListElement, StatListProps>(function StatList({ items, total, className, ...rest }, ref) {
  const row = (item: StatListItem, key: number | string, isTotal = false) => (
    <div className={cx("oc-dl-row", isTotal && "oc-dl-row--total")} key={key}>
      <dt className="oc-dl-term">
        {item.label}
        {item.sublabel != null && <span className="oc-dl-sub">{item.sublabel}</span>}
      </dt>
      <dd className="oc-dl-detail">{item.value}</dd>
    </div>
  );
  return (
    <dl ref={ref} className={cx("oc-dl", "oc-dl--stat", className)} {...rest}>
      {items.map((item, i) => row(item, i))}
      {total && row(total, "total", true)}
    </dl>
  );
});
