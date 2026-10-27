// File: packages/react/src/components/TableCompact.tsx
// Map: TableCompact = wrapper div -> table.oc-table (thead from columns, tbody from rows, tfoot from footer) or your own children
// Pass `columns` + `rows` for a quick table, or put your own <table class="oc-table"> as children.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TableCompactColumn {
  key: string;
  label: ReactNode;
  /** Right aligned, tabular figures (`data-numeric`). */
  numeric?: boolean;
  /** The cell may wrap (`data-wrap`). */
  wrap?: boolean;
}

export interface TableCompactProps extends HTMLAttributes<HTMLDivElement> {
  columns?: TableCompactColumn[];
  rows?: Array<Record<string, ReactNode>>;
  /** Total row: one value per column key (missing keys stay empty). */
  footer?: Record<string, ReactNode>;
  bordered?: boolean;
  plain?: boolean;
}

/** Cell attributes from the column settings. */
const cellAttrs = (c: TableCompactColumn) => ({
  "data-numeric": c.numeric ? "" : undefined,
  "data-wrap": c.wrap ? "" : undefined,
});

/** `.oc-table-compact`: small striped table for inside cards. */
export const TableCompact = forwardRef<HTMLDivElement, TableCompactProps>(function TableCompact(
  { columns, rows = [], footer, bordered, plain, className, children, ...rest },
  ref,
) {
  const cls = cx("oc-table-compact", bordered && "oc-table-compact--bordered", plain && "oc-table-compact--plain", className);
  return (
    <div ref={ref} className={cls} {...rest}>
      {columns ? (
        <table className="oc-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} {...cellAttrs(c)}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>{columns.map((c) => <td key={c.key} {...cellAttrs(c)}>{row[c.key]}</td>)}</tr>
            ))}
          </tbody>
          {footer && (
            <tfoot>
              <tr>{columns.map((c) => <td key={c.key} {...cellAttrs(c)}>{footer[c.key]}</td>)}</tr>
            </tfoot>
          )}
        </table>
      ) : (
        children
      )}
    </div>
  );
});
