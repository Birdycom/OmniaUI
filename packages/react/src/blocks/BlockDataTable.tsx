import { forwardRef } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockDataTableProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Header buttons (export, new...). */
  actions?: ReactNode;
  /** Search + filters row (`oc-table-toolbar`). Use `BlockDataTableSpacer` to push items right. */
  toolbar?: ReactNode;
  /** Selection bar, shown by you when rows are selected (`oc-block-datatable-bulk`). */
  bulk?: ReactNode;
  /** Entries text, page-size select and pagination (`oc-table-footer`). */
  footer?: ReactNode;
  /** The `<Table>`. */
  children?: ReactNode;
}

/** `.oc-card.oc-block-datatable`: card with header, toolbar, table, bulk bar and footer. */
export const BlockDataTable = forwardRef<HTMLElement, BlockDataTableProps>(function BlockDataTable(
  { title, description, actions, toolbar, bulk, footer, className, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-card oc-block-datatable", className)} {...rest}>
      <header className="oc-block-datatable-head">
        <div>
          {title != null && <h2 className="oc-block-datatable-title">{title}</h2>}
          {description != null && <p className="oc-block-datatable-description">{description}</p>}
        </div>
        {actions != null && <div>{actions}</div>}
      </header>
      <div className="oc-block-datatable-body">
        {toolbar != null && <div className="oc-table-toolbar">{toolbar}</div>}
        {bulk != null && <div className="oc-block-datatable-bulk">{bulk}</div>}
        {children}
        {footer != null && <div className="oc-table-footer">{footer}</div>}
      </div>
    </section>
  );
});

/** `.oc-table-toolbar-spacer`: pushes the following toolbar items to the right. */
export function BlockDataTableSpacer() {
  return <span className="oc-table-toolbar-spacer" />;
}

/** `.oc-filter-pills` group. */
export function FilterPills({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-filter-pills", className)} role="group" {...rest} />;
}

/** `a.oc-filter-pill` (set `current` for the active filter). */
export function FilterPill({ current, className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { current?: boolean }) {
  return <a className={cx("oc-filter-pill", className)} aria-current={current ? "true" : undefined} {...rest} />;
}
