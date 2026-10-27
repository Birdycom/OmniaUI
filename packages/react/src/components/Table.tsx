import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes } from "react";
import { cx } from "../utils";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  compact?: boolean;
  borderless?: boolean;
  sticky?: boolean;
  /** `<caption>` text. */
  caption?: ReactNode;
  /** Class for the `oc-table-wrap` scroll container. */
  wrapClassName?: string;
}

/** `div.oc-table-wrap > table.oc-table` */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { striped, compact, borderless, sticky, caption, wrapClassName, className, children, ...rest },
  ref,
) {
  return (
    <div className={cx("oc-table-wrap", wrapClassName)}>
      <table
        ref={ref}
        className={cx(
          "oc-table",
          striped && "oc-table--striped",
          compact && "oc-table--compact",
          borderless && "oc-table--borderless",
          sticky && "oc-table--sticky",
          className,
        )}
        {...rest}
      >
        {caption != null && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
});

export interface TableSortProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

/** `a.oc-table-sort` inside a `<th aria-sort="ascending|descending">`. */
export const TableSort = forwardRef<HTMLAnchorElement, TableSortProps>(function TableSort({ className, ...rest }, ref) {
  return <a ref={ref} className={cx("oc-table-sort", className)} {...rest} />;
});

/** `td.oc-table-actions` */
export function TableActions({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx("oc-table-actions", className)} {...rest} />;
}

type RowActionProps = {
  tone?: "default" | "destructive" | "primary" | "success";
} & (
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
);

/** `.oc-table-row-action`: link (with `href`) or button. */
export function TableRowAction({ tone = "default", className, ...props }: RowActionProps) {
  const cls = cx("oc-table-row-action", tone !== "default" && `oc-table-row-action--${tone}`, className);
  if (props.href !== undefined) return <a className={cls} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  return <button type="button" className={cls} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}

/** Empty-state row: `<tr class="oc-table-empty"><td colspan>`; put an `<EmptyState>` inside. */
export function TableEmpty({ colSpan, children, ...rest }: HTMLAttributes<HTMLTableRowElement> & { colSpan: number }) {
  return (
    <tr className="oc-table-empty" {...rest}>
      <td colSpan={colSpan}>{children}</td>
    </tr>
  );
}
