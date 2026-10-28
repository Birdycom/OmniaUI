// File: packages/react/src/components/ColumnMenu.tsx
// Map: ColumnMenu = scope -> toolbar trigger -> popover (title, form with one checkbox per column, reset) -> children (the table)
// Hiding columns is pure CSS: an unchecked [data-col="n"] hides column n inside the scope (n = 1-10).
// The checkboxes are uncontrolled, so "Reset" (a form reset) restores the defaults.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface ColumnMenuColumn {
  label: ReactNode;
  /** Visible at the start (default true). */
  visible?: boolean;
  /** Always visible; the checkbox is disabled. */
  locked?: boolean;
}

export interface ColumnMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** One entry per table column, in column order (max 10). */
  columns: ColumnMenuColumn[];
  /** The table (`.oc-table`) the menu controls. */
  children: ReactNode;
  triggerLabel?: ReactNode;
  title?: ReactNode;
  resetLabel?: ReactNode;
  /** Called with the column number (1-based) and its new visibility. */
  onColumnToggle?: (column: number, visible: boolean) => void;
}

/** `.oc-column-menu-scope` with a `.oc-column-menu[popover]` column checklist. */
export const ColumnMenu = forwardRef<HTMLDivElement, ColumnMenuProps>(function ColumnMenu(
  { columns, children, triggerLabel = "Columns", title = "Visible columns", resetLabel = "Reset", onColumnToggle, className, ...rest },
  ref,
) {
  const menuId = `oc-column-menu-${useId().replace(/:/g, "")}`;
  return (
    <div ref={ref} className={cx("oc-column-menu-scope", className)} {...rest}>
      <div className="oc-table-toolbar">
        <span className="oc-table-toolbar-spacer" />
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" popoverTarget={menuId}>
          {triggerLabel}
        </button>
      </div>
      <div className="oc-column-menu" id={menuId} {...attrs({ popover: "" })}>
        <p className="oc-column-menu-title">{title}</p>
        <form className="oc-column-menu-list">
          {columns.map((col, i) => (
            <label className="oc-column-menu-item" key={i}>
              <input
                type="checkbox"
                data-col={i + 1}
                defaultChecked={col.locked || col.visible !== false}
                disabled={col.locked}
                onChange={(e) => onColumnToggle?.(i + 1, e.currentTarget.checked)}
              />{" "}
              {col.label}
            </label>
          ))}
          <div className="oc-column-menu-footer">
            <button className="oc-btn oc-btn--ghost oc-btn--sm" type="reset">{resetLabel}</button>
          </div>
        </form>
      </div>
      {children}
    </div>
  );
});
