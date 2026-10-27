// File: packages/react/src/components/DataTable.tsx
// Map: column and row types -> shell markup -> bind the list-table script on mount
"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { bindDataTable } from "../../../ui/src/data-table.js";

export interface DataTableColumn {
  key: string;
  header: string;
  /** Right aligned, sorted as a number (5,15 and 5.15). */
  numeric?: boolean;
  /** Click the header to sort. Default true. */
  sortable?: boolean;
  /** Show the column in the Columns menu. Default true. */
  hideable?: boolean;
  /** Start hidden until the user checks it in the Columns menu. */
  defaultHidden?: boolean;
}

export interface DataTableRow {
  key: string;
  status?: "active" | "deleted" | "archived";
  cells: Record<string, string>;
  /** Sort and export value when it differs from the visible text. */
  values?: Record<string, string>;
  href?: string;
}

export interface DataTableProps {
  id?: string;
  title?: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  pageSize?: number;
  searchPlaceholder?: string;
  selectable?: boolean;
  draggable?: boolean;
  /** Trash and archive pills. Default true. */
  filters?: boolean;
  /** Demo mode: trash, restore, duplicate and delete change the rows in the page. */
  live?: boolean;
  /** Page actions on the right of the toolbar (New article, …). */
  actions?: ReactNode;
  onBulk?: (action: string, keys: string[]) => void;
}

const PAGE_SIZES = [10, 15, 20, 50, 100];

/** Korrekt / OmniaDesk list table. The script in @birdycom/omniaui/data-table.js does the work. */
export function DataTable({
  id,
  title = "List",
  columns,
  rows,
  pageSize = 15,
  searchPlaceholder = "Search...",
  selectable = true,
  draggable = true,
  filters = true,
  live = false,
  actions,
  onBulk,
}: DataTableProps) {
  const autoId = useId().replace(/:/g, "");
  const tableId = id || `oc-dt-${autoId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const onBulkRef = useRef(onBulk);
  onBulkRef.current = onBulk;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    bindDataTable(root);
    const onBulkEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ action: string; keys: string[] }>).detail;
      onBulkRef.current?.(detail.action, detail.keys);
    };
    root.addEventListener("oc-datatable-bulk", onBulkEvent);
    return () => root.removeEventListener("oc-datatable-bulk", onBulkEvent);
  }, [columns, rows]);

  const lead = (selectable ? 1 : 0) + (draggable ? 1 : 0);
  const sizes = [...new Set([...PAGE_SIZES, pageSize])].sort((a, b) => a - b);

  return (
    <div
      ref={rootRef}
      className="oc-data-table oc-column-menu-scope"
      id={tableId}
      data-page-size={pageSize}
      data-oc-live={live ? "true" : undefined}
    >
      <div className="oc-data-table-toolbar">
        <div className="oc-data-table-heading">
          <span className="oc-data-table-title">{title}</span>
          <button className="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" popoverTarget={`${tableId}-menu`} aria-label="Table actions">⚙</button>
          <div className="oc-dropdown-menu" id={`${tableId}-menu`} popover="auto">
            <button className="oc-dropdown-item" type="button" data-oc-export="">Export CSV</button>
            <button className="oc-dropdown-item" type="button" data-oc-import="">Import CSV</button>
            <input className="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file="" />
            <div className="oc-dropdown-separator" />
            <button className="oc-dropdown-item" type="button" data-oc-density="comfortable">Comfortable rows</button>
            <button className="oc-dropdown-item" type="button" data-oc-density="compact">Compact rows</button>
            <button className="oc-dropdown-item" type="button" data-oc-reset-widths="">Reset column widths</button>
          </div>
        </div>
        <input className="oc-input oc-data-table-search" type="search" placeholder={searchPlaceholder} aria-label={`Search ${title}`} />
        {filters && (
          <div className="oc-filter-pills" role="group" aria-label="Trash filter">
            <button className="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active only</button>
            <button className="oc-filter-pill" type="button" data-oc-filter="all">Including trash</button>
            <button className="oc-filter-pill" type="button" data-oc-filter="deleted">Trash only</button>
            <button className="oc-filter-pill" type="button" data-oc-filter="archived">Archive only</button>
          </div>
        )}
        <div className="oc-data-table-view" role="group" aria-label="View">
          <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true">Table</button>
          <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="grid">Cards</button>
        </div>
        {actions && <div className="oc-data-table-actions">{actions}</div>}
        <p className="oc-data-table-sort-summary" data-oc-sort-summary="" role="status" />
      </div>
      <div className="oc-table-toolbar">
        <span className="oc-table-toolbar-spacer" />
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" popoverTarget={`${tableId}-columns`}>Columns</button>
      </div>
      <div className="oc-column-menu" id={`${tableId}-columns`} popover="auto">
        <p className="oc-column-menu-title">Visible columns</p>
        <form className="oc-column-menu-list">
          {columns.map((col, index) => col.hideable === false ? null : (
            <label className="oc-column-menu-item" key={col.key}>
              <input type="checkbox" data-col={lead + index + 1} defaultChecked={!col.defaultHidden} /> {col.header}
            </label>
          ))}
        </form>
      </div>
      <div className="oc-data-table-bulk" hidden>
        <span data-oc-selected-count="">0 selected</span>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export">Export selection</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="duplicate">Duplicate</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="archive">Move to trash</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="restore">Restore</button>
        <button className="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete">Delete permanently</button>
        <button className="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="clear">Clear</button>
      </div>
      <div className="oc-data-table-frame">
        <div className="oc-data-table-scroll">
          <table className="oc-table oc-data-table-table">
            <thead>
              <tr>
                {selectable && <th data-oc-col="select"><input className="oc-checkbox" type="checkbox" data-oc-select-all="" aria-label="Select all" /></th>}
                {draggable && <th data-oc-col="order"><span className="oc-visually-hidden">Order</span></th>}
                {columns.map((col) => (
                  <th key={col.key} data-oc-col={col.key} data-oc-sort={col.numeric ? "numeric" : "text"} data-numeric={col.numeric ? "" : undefined}>
                    <span className="oc-data-table-th">
                      {col.sortable === false ? col.header : <button className="oc-table-sort" type="button">{col.header}</button>}
                      <span className="oc-data-table-resize" role="separator" aria-orientation="vertical" aria-label={`Resize ${col.header}`} />
                    </span>
                  </th>
                ))}
                <th data-oc-col="actions"><span className="oc-visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} data-oc-row="" data-oc-key={row.key} data-oc-status={row.status || "active"} data-oc-href={row.href}>
                  {selectable && (
                    <td data-oc-col="select"><input className="oc-checkbox" type="checkbox" data-oc-select="" aria-label={`Select ${row.cells.name || row.key}`} /></td>
                  )}
                  {draggable && (
                    <td data-oc-col="order" className="oc-sortable-row-grip-cell">
                      <button className="oc-sortable-row-grip" type="button" aria-label={`Move ${row.cells.name || row.key}`} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} data-oc-col={col.key} data-numeric={col.numeric ? "" : undefined} data-oc-value={row.values?.[col.key]}>
                      {row.cells[col.key] ?? ""}
                    </td>
                  ))}
                  <td data-oc-col="actions" className="oc-table-actions"><button className="oc-table-row-action" type="button">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="oc-data-table-empty" hidden>No results</p>
      </div>
      <div className="oc-data-table-footer">
        <p className="oc-data-table-summary" data-oc-summary="" />
        <label className="oc-data-table-per-page">Rows per page
          <select className="oc-select" data-oc-page-size="" aria-label="Rows per page" defaultValue={String(pageSize)}>
            {sizes.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <nav className="oc-data-table-pager" data-oc-pager="" aria-label="Pagination" />
      </div>
    </div>
  );
}
