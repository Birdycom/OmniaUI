// File: packages/react/src/components/ExpandableTable.tsx
// Map: types -> ExpandableTable (wrapper -> table: first rows, dimmed row, hidden rows -> toggle label) -> ShowMore (text + hidden extra + toggle)
// Same markup as packages/ui/snippets/expandable-table.html. CSS only: a checkbox in the button opens the rest, no JavaScript.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ExpandableTableColumn {
  key: string;
  label: ReactNode;
}

export interface ExpandableTableProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns of a quick table; leave out to put your own <table> (with the row classes) as children. */
  columns?: ExpandableTableColumn[];
  rows?: Array<Record<string, ReactNode>>;
  /** Rows shown before "Show more"; the last one is faded (default 10). */
  visible?: number;
  /** Class of the table (default the reference table, `oc-table-ref`). */
  tableClassName?: string;
  moreLabel?: ReactNode;
  lessLabel?: ReactNode;
  /** The button spans the full width under the table (`__wrap--full`). Default true. */
  full?: boolean;
  /** Button variant (default secondary). */
  buttonVariant?: "secondary" | "outline" | "ghost";
  /** Start open. */
  defaultOpen?: boolean;
}

/** `.oc-expandable-table`: shows the first rows; "Show more" reveals the rest. */
export const ExpandableTable = forwardRef<HTMLDivElement, ExpandableTableProps>(function ExpandableTable(
  { columns, rows = [], visible = 10, tableClassName = "oc-table-ref", moreLabel = "Show more", lessLabel = "Show less", full = true, buttonVariant = "secondary", defaultOpen, className, children, ...rest },
  ref,
) {
  // Row class: the last visible row fades, the rows after it hide until the toggle is checked.
  const rowClass = (i: number) => (i === visible - 1 && rows.length > visible ? "oc-expandable-table__row-dimmed" : i >= visible ? "oc-expandable-table__row-more" : undefined);
  return (
    <div ref={ref} className={cx("oc-expandable-table", className)} {...rest}>
      {columns ? (
        <table className={tableClassName}>
          <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={rowClass(i)}>{columns.map((c) => <td key={c.key}>{row[c.key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
      <div className={cx("oc-expandable-table__wrap", full && "oc-expandable-table__wrap--full")}>
        <label className={cx("oc-btn", `oc-btn--${buttonVariant}`, "oc-expandable-table__trigger")}>
          <input type="checkbox" className="oc-expandable-table__toggle" defaultChecked={defaultOpen} />
          <span className="oc-expandable-table__more">{moreLabel}</span>
          <span className="oc-expandable-table__less">{lessLabel}</span>
        </label>
      </div>
    </div>
  );
});

export interface ShowMoreProps extends HTMLAttributes<HTMLDivElement> {
  /** Content that appears after pressing the button (`.oc-showmore__extra`). */
  extra: ReactNode;
  moreLabel?: ReactNode;
  lessLabel?: ReactNode;
  /** Button variant (default outline). */
  buttonVariant?: "outline" | "secondary" | "ghost";
  defaultOpen?: boolean;
}

/** `.oc-showmore`: text that is always visible (children), extra text behind a "Show more" toggle button. */
export const ShowMore = forwardRef<HTMLDivElement, ShowMoreProps>(function ShowMore(
  { extra, moreLabel = "Show more", lessLabel = "Show less", buttonVariant = "outline", defaultOpen, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-showmore", className)} {...rest}>
      {children}
      <div className="oc-showmore__extra">{extra}</div>
      <label className={cx("oc-btn", `oc-btn--${buttonVariant}`, "oc-btn--toggle")}>
        <input type="checkbox" defaultChecked={defaultOpen} />
        <span className="oc-btn-toggle__off">{moreLabel}</span>
        <span className="oc-btn-toggle__on">{lessLabel}</span>
      </label>
    </div>
  );
});
