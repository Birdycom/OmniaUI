// File: packages/react/src/components/DataTable.tsx
// Map: icons -> column, row, tab and filter types -> name cell helper -> server state (page, sort, search, trash, columns,
//      selection) -> shell markup (skeleton rows while loading) -> bind the list-table script on mount, query events -> callbacks
"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { bindDataTable, setDataTableSelection } from "../../../ui/src/data-table.js";
import { useControllable } from "../hooks";
import { Icon } from "./Icon";

/** Webicon paths (MDI) for the toolbar, drawn inline so the table needs no icon loader. */
const MDI = {
  cog_outline: "M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1l-.07 1l2.11 1.63c.19.15.25.42.12.64l-2 3.46c-.12.22-.39.31-.61.22l-2.49-1c-.52.39-1.06.73-1.69.98l-.37 2.65c-.04.24-.25.42-.5.42zm1.25-18l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.52l.37-2.61c1.19-.25 2.24-.89 3.01-1.77l2.43 1.04l.75-1.3l-2.12-1.55c.4-1.17.4-2.44 0-3.61l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4z",
  format_list_bulleted: "M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5",
  view_grid_outline: "M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z",
  tune_variant: "M8 13c-1.86 0-3.41 1.28-3.86 3H2v2h2.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22v-2H11.86c-.45-1.72-2-3-3.86-3m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M19.86 6c-.45-1.72-2-3-3.86-3s-3.41 1.28-3.86 3H2v2h10.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22V6zM16 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2",
  view_column_outline: "M4 5v13h17V5zm10 2v9h-3V7zM6 7h3v9H6zm13 9h-3V7h3z",
  table_cog: "M3 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H11v4h1.08c-.11.68-.11 1.35 0 2H3a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm19.78 6.32l-1.07-.82c.02-.17.04-.33.04-.5s-.01-.33-.04-.5l1.06-.82a.26.26 0 0 0 .06-.32l-1-1.73c-.06-.13-.19-.13-.33-.13l-1.22.5c-.28-.18-.54-.35-.85-.47l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.47l-1.24-.5c-.11 0-.24 0-.31.13l-1 1.73c-.06.11-.04.24.06.32l1.06.82a4.2 4.2 0 0 0 0 1l-1.06.82a.26.26 0 0 0-.06.32l1 1.73c.06.13.19.13.31.13l1.24-.5c.26.18.54.35.85.47l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.56-.29.84-.47l1.22.5c.14 0 .27 0 .34-.13l1-1.73a.26.26 0 0 0-.06-.32M18 19.5c-.83 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5s1.5.67 1.5 1.5s-.66 1.5-1.5 1.5",
  pencil_outline: "m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z",
  filter_outline: "M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z",
};

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
  /** Cut long text with an ellipsis at this width (e.g. "12rem"); the full text goes in the title. */
  truncate?: string;
  /** Sort the table on this column when it starts. */
  defaultSort?: "ascending" | "descending";
  /** Hide the column (th and tds, data-hide-below) when the table is narrower than 24rem (sm), 32rem (md) or 48rem (lg). */
  hideBelow?: "sm" | "md" | "lg";
}

export interface DataTableRow {
  key: string;
  status?: "active" | "deleted" | "archived";
  /** Text or any node per column: a <DataTableName>, a badge, a count button … */
  cells: Record<string, ReactNode>;
  /** Sort, filter, search and export value when it differs from the visible content (needed for nodes). */
  values?: Record<string, string>;
  href?: string;
}

/** Tabs above the toolbar that filter one column (All / Customers / Companies …). */
export interface DataTableTabs {
  column: string;
  label?: string;
  /** tone colors the count like the type badge in the table. */
  items: { value: string; label: string; icon?: ReactNode; count?: number; tone?: "success" | "info" | "warning" }[];
}

/** A select in the filter row that filters one column; "" is the "all" option. */
export interface DataTableColumnFilter {
  column: string;
  label: string;
  icon?: ReactNode;
  options: { value: string; label: string }[];
}

export interface DataTableProps {
  id?: string;
  title?: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  pageSize?: number;
  searchPlaceholder?: string;
  selectable?: boolean;
  /** Grip column to drag rows. The drag itself is OmniaUI Pro (data-table-pro.js). Default false. */
  draggable?: boolean;
  /** Handles to drag a column width. The resize itself is OmniaUI Pro (data-table-pro.js). Default false. */
  resizable?: boolean;
  /** Column chooser in the actions header (show or hide columns). Needs the OmniaUI Pro CSS. Default false. */
  columnMenu?: boolean;
  /** Trash pills (active / including trash / trash only). Default true. */
  filters?: boolean;
  /** Also an "Archive only" pill. Default true. */
  archive?: boolean;
  tabs?: DataTableTabs;
  columnFilters?: DataTableColumnFilter[];
  /** The buttons in the actions column of a row. Default: one soft edit button. */
  rowActions?: (row: DataTableRow) => ReactNode;
  /** Footer count, e.g. "Showing {from}–{to} of {total} customers". */
  summary?: string;
  /** Offer "Import CSV" in the settings (fires oc-datatable-import with the file). Default false. */
  importable?: boolean;
  /** "bordered" = version 2: tinted header, lines between the columns, sort chevrons always visible. */
  variant?: "default" | "bordered";
  /** Striped rows. Default true. */
  striped?: boolean;
  /** Demo mode: trash, restore, duplicate and delete change the rows in the page. */
  live?: boolean;
  /** Page actions on the right of the toolbar (New article, …). */
  actions?: ReactNode;
  onBulk?: (action: string, keys: string[]) => void;
  /** Texts in another language (any subset; the rest stays English). */
  labels?: Partial<DataTableLabels>;
  /** false: no table / cards switch, the table only. */
  view?: boolean;
  /** false: every row on one page, no pager and no rows-per-page (a report to print). */
  pagination?: boolean;
  /** The selection bar and the selection items of the list menu (default: as `filters`). */
  bulk?: boolean;

  /**
   * Server mode (0.17.0): `rows` is the current page from your API. The table does not filter, sort or slice them; every
   * control (sort, search, trash pills, column filters, pager, rows per page) calls back so you can fetch the next page.
   */
  server?: boolean;
  /** Server mode: the number of matches on the server (all pages), for the pager and the "Showing" line. */
  total?: number;
  /** Server mode: the current page, 1-based (controlled). Without it the table keeps the page itself. */
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** The sorted column (controlled): `{ key, dir }`, or null for none. Without it: the columns' defaultSort. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Text in the search field (controlled from outside, e.g. from the URL). */
  search?: string;
  /** Server mode: called after the typing stops (`searchDelay`). */
  onSearchChange?: (search: string) => void;
  /** Server mode: wait this long after the last key before onSearchChange. Default 300 ms. */
  searchDelay?: number;
  /** The trash pill that is on (controlled). Default "active". */
  trashed?: DataTableTrashed;
  onTrashedChange?: (trashed: DataTableTrashed) => void;
  /** Server mode: a column filter (select or tab) changed; "" means all. */
  onColumnFilterChange?: (column: string, value: string) => void;
  /** Server mode: every change at once (sort, dir, page, pageSize, search, trashed, filters), handy for one fetch. */
  onQueryChange?: (query: DataTableQuery) => void;
  /** Loading: skeleton rows instead of the rows and aria-busy on the table. */
  loading?: boolean;
  /** Number of skeleton rows. Default: the page size (5 without pagination). */
  skeletonRows?: number;
  /** Shown when there are no rows (default: the noResults text). */
  emptyState?: ReactNode;
  /**
   * Column chooser (free, 0.17.0): the keys of the visible columns (controlled). Setting this, defaultVisibleColumns or
   * onVisibleColumnsChange adds a columns button to the actions header; unchecked columns are not rendered.
   * Columns with hideable false always show.
   */
  visibleColumns?: string[];
  defaultVisibleColumns?: string[];
  onVisibleColumnsChange?: (keys: string[]) => void;
  /** The selected row keys (controlled), kept over pages. */
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
}

/** The sorted column in server mode. */
export interface DataTableSort {
  key: string;
  dir: "asc" | "desc";
}

export type DataTableTrashed = "active" | "all" | "deleted" | "archived";

/** Everything the server needs for one page (detail of the oc-datatable-query event). page is 1-based. */
export interface DataTableQuery {
  reason: "sort" | "page" | "pageSize" | "search" | "trashed" | "filter";
  sort: string | null;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
  search: string;
  trashed: DataTableTrashed;
  filters: Record<string, string>;
}

/** Every text of the DataTable, for another language (0.17.0). The script texts (pager, "3 selected", sort line,
 *  summary) go to data-oc-labels on the root. {from} {to} {total} {n} {label} {dir} {name} are filled in. */
export interface DataTableLabels {
  listActions: string; exportCsv: string; importCsv: string; duplicateSelection: string; trashSelection: string;
  comfortable: string; compact: string; search: string; trashFilter: string; activeOnly: string; includingTrash: string;
  trashOnly: string; archiveOnly: string; view: string; table: string; cards: string; columns: string; resetWidths: string;
  selected: string; exportSelection: string; duplicate: string; moveToTrash: string; restore: string; deletePermanently: string;
  clear: string; selectAll: string; select: string; order: string; move: string; resize: string; actions: string;
  noResults: string; summary: string; rowsPerPage: string; pagination: string; firstPage: string; previousPage: string;
  nextPage: string; lastPage: string; sortedBy: string; ascending: string; descending: string; edit: string;
}

export const DATA_TABLE_EN: DataTableLabels = {
  listActions: "List actions", exportCsv: "Export CSV", importCsv: "Import CSV", duplicateSelection: "Duplicate selection",
  trashSelection: "Move selection to trash", comfortable: "Comfortable rows", compact: "Compact rows", search: "Search {name}",
  trashFilter: "Trash filter", activeOnly: "Active only", includingTrash: "Including trash", trashOnly: "Trash only",
  archiveOnly: "Archive only", view: "View", table: "Table", cards: "Cards", columns: "Columns", resetWidths: "Reset column widths",
  selected: "{n} selected", exportSelection: "Export selection", duplicate: "Duplicate", moveToTrash: "Move to trash",
  restore: "Restore", deletePermanently: "Delete permanently", clear: "Clear", selectAll: "Select all", select: "Select {name}",
  order: "Order", move: "Move {name}", resize: "Resize {name}", actions: "Actions", noResults: "No results",
  summary: "Showing {from}–{to} of {total}", rowsPerPage: "Rows per page", pagination: "Pagination", firstPage: "First page",
  previousPage: "Previous page", nextPage: "Next page", lastPage: "Last page", sortedBy: "Sorted by {label}, {dir}",
  ascending: "ascending", descending: "descending", edit: "Edit {name}",
};
const fill = (s: string, name: unknown) => s.replace("{name}", String(name));
/** The keys the script reads from data-oc-labels. */
const SCRIPT_KEYS = ["selected", "summary", "firstPage", "previousPage", "nextPage", "lastPage", "sortedBy", "ascending", "descending"] as const;


const PAGE_SIZES = [10, 15, 20, 50, 100];

export interface DataTableNameProps {
  name: string;
  /** Initials in the avatar; default: the first letters of the name. */
  initials?: string;
  /** Image in the avatar instead of initials. */
  avatar?: string;
  /** A badge after the name (type, status …). */
  badge?: ReactNode;
  /** Muted second line (VAT number, e-mail …). */
  sub?: ReactNode;
}

/** Name cell: avatar, name with a badge and a muted second line. */
export function DataTableName({ name, initials, avatar, badge, sub }: DataTableNameProps) {
  const letters = initials ?? name.split(/[\s&-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className="oc-data-table-name">
      <span className="oc-avatar" aria-hidden="true">{avatar ? <img src={avatar} alt="" /> : letters}</span>
      <span className="oc-data-table-name-text">
        <span className="oc-data-table-name-line">{name} {badge}</span>
        {sub ? <span className="oc-data-table-name-sub">{sub}</span> : null}
      </span>
    </span>
  );
}

const defaultActions = (row: DataTableRow, edit = DATA_TABLE_EN.edit) => (
  <button className="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" type="button" aria-label={fill(edit, row.values?.name ?? row.key)} title={fill(edit, "").trim()}>
    <Icon d={MDI.pencil_outline} />
  </button>
);

/** List table for business apps. The script in @birdycom/omniaui/data-table.js does the work. */
export function DataTable({
  id,
  title = "List",
  columns,
  rows,
  pageSize = 15,
  searchPlaceholder = "Search...",
  selectable = true,
  draggable = false,
  resizable = false,
  columnMenu = false,
  filters = true,
  archive = true,
  tabs,
  columnFilters,
  rowActions,
  summary,
  importable = false,
  variant = "default",
  striped = true,
  live = false,
  actions,
  onBulk,
  labels,
  view = true,
  pagination = true,
  bulk = filters,
  server = false,
  total,
  page,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  searchDelay,
  trashed,
  onTrashedChange,
  onColumnFilterChange,
  onQueryChange,
  loading = false,
  skeletonRows,
  emptyState,
  visibleColumns,
  defaultVisibleColumns,
  onVisibleColumnsChange,
  selectedKeys,
  onSelectionChange,
}: DataTableProps) {
  const L = { ...DATA_TABLE_EN, ...labels };
  const scriptLabels = labels ? JSON.stringify(Object.fromEntries(SCRIPT_KEYS.filter((k) => labels[k] != null).map((k) => [k, labels[k]]))) : undefined;
  const autoId = useId().replace(/:/g, "");
  const tableId = id || `oc-dt-${autoId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useControllable<number>(page, 1, onPageChange);
  const picker = visibleColumns !== undefined || defaultVisibleColumns !== undefined || onVisibleColumnsChange !== undefined;
  const [visible, setVisible] = useControllable<string[]>(
    visibleColumns,
    defaultVisibleColumns ?? columns.filter((c) => !c.defaultHidden).map((c) => c.key),
    onVisibleColumnsChange,
  );
  const shown = picker ? columns.filter((c) => c.hideable === false || visible.includes(c.key)) : columns;
  // The latest callbacks for the listeners below, which are added once.
  const callbacks = { onBulk, onQueryChange, onSortChange, onSearchChange, onTrashedChange, onPageSizeChange, onColumnFilterChange, onSelectionChange, setCurrentPage, currentPage };
  const latest = useRef(callbacks);
  latest.current = callbacks;
  const lastFilters = useRef<Record<string, string>>({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onBulkEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ action: string; keys: string[] }>).detail;
      latest.current.onBulk?.(detail.action, detail.keys);
    };
    const onQuery = (event: Event) => {
      const q = (event as CustomEvent<DataTableQuery>).detail;
      const cb = latest.current;
      cb.onQueryChange?.(q);
      if (q.reason === "sort") cb.onSortChange?.(q.sort ? { key: q.sort, dir: q.dir } : null);
      if (q.reason === "search") cb.onSearchChange?.(q.search);
      if (q.reason === "trashed") cb.onTrashedChange?.(q.trashed);
      if (q.reason === "pageSize") cb.onPageSizeChange?.(q.pageSize);
      if (q.reason === "filter") {
        for (const [key, value] of Object.entries(q.filters)) {
          if ((lastFilters.current[key] ?? "") !== value) cb.onColumnFilterChange?.(key, value);
        }
      }
      lastFilters.current = { ...q.filters };
      if (q.page !== cb.currentPage) cb.setCurrentPage(q.page);
    };
    const onSelection = (event: Event) => latest.current.onSelectionChange?.((event as CustomEvent<{ keys: string[] }>).detail.keys);
    root.addEventListener("oc-datatable-bulk", onBulkEvent);
    root.addEventListener("oc-datatable-query", onQuery);
    root.addEventListener("oc-datatable-selection", onSelection);
    return () => {
      root.removeEventListener("oc-datatable-bulk", onBulkEvent);
      root.removeEventListener("oc-datatable-query", onQuery);
      root.removeEventListener("oc-datatable-selection", onSelection);
    };
  }, []);

  // (Re)bind after every change of the rows or the server state: the script keeps the selection and reads the new state.
  const sortKey = sort === undefined ? undefined : sort ? `${sort.key}:${sort.dir}` : "";
  const visibleKey = shown.map((c) => c.key).join(",");
  useEffect(() => {
    const root = rootRef.current;
    if (root) bindDataTable(root);
  }, [columns, rows, server, currentPage, total, sortKey, trashed, loading, visibleKey]);

  // Controlled text and page size: put them in the fields when they change from outside.
  useEffect(() => {
    const input = rootRef.current?.querySelector<HTMLInputElement>(".oc-data-table-search");
    if (input && search !== undefined && input.value !== search) input.value = search;
  }, [search]);
  useEffect(() => {
    const select = rootRef.current?.querySelector<HTMLSelectElement>("[data-oc-page-size]");
    if (server && select && select.value !== String(pageSize)) select.value = String(pageSize);
  }, [server, pageSize]);
  const selectedKey = selectedKeys?.join("\u0000");
  useEffect(() => {
    if (selectedKeys && rootRef.current) setDataTableSelection(rootRef.current, selectedKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const lead = (selectable ? 1 : 0) + (draggable ? 1 : 0);
  const sizes = [...new Set([...PAGE_SIZES, pageSize])].sort((a, b) => a - b);
  const label = (row: DataTableRow) => row.values?.name ?? (typeof row.cells.name === "string" ? row.cells.name : row.key);
  const pill = (value: DataTableTrashed) => ((trashed ?? "active") === value ? ("true" as const) : undefined);
  const ariaSort = (col: DataTableColumn) => {
    if (sort === undefined) return col.defaultSort;
    return sort && sort.key === col.key ? (sort.dir === "desc" ? "descending" : "ascending") : undefined;
  };
  const toggleColumn = (key: string, on: boolean) => {
    setVisible(columns.map((c) => c.key).filter((k) => (k === key ? on : visible.includes(k))));
  };
  const skeletons = loading ? Array.from({ length: skeletonRows ?? (pagination && pageSize > 0 ? pageSize : 5) }, (_, i) => i) : [];

  return (
    <div
      ref={rootRef}
      className={["oc-data-table", variant === "bordered" && "oc-data-table--bordered", !striped && "oc-data-table--plain", columnMenu && "oc-column-menu-scope"].filter(Boolean).join(" ")}
      id={tableId}
      data-page-size={pagination ? pageSize : 0}
      data-oc-live={live ? "true" : undefined}
      data-oc-labels={scriptLabels && scriptLabels !== "{}" ? scriptLabels : undefined}
      data-oc-no-grid={view ? undefined : ""}
      data-oc-server={server ? "true" : undefined}
      data-oc-total={server ? (total ?? rows.length) : undefined}
      data-oc-current-page={server ? currentPage : undefined}
      data-oc-search-delay={searchDelay}
      aria-busy={loading ? true : undefined}
    >
      {tabs && (
        <div className="oc-tab-list oc-data-table-tabs" role="tablist" aria-label={tabs.label ?? "Filter"}>
          {tabs.items.map((tab, i) => (
            <button
              key={tab.value}
              className="oc-tab-trigger"
              role="tab"
              type="button"
              data-oc-col-filter={tabs.column}
              data-oc-value={tab.value}
              aria-selected={i === 0 ? "true" : "false"}
            >
              {tab.icon}{tab.label}
              {tab.count != null && <span className={`oc-data-table-tab-count${tab.tone ? ` oc-data-table-tab-count--${tab.tone}` : ""}`}>{tab.count}</span>}
            </button>
          ))}
        </div>
      )}
      <div className="oc-data-table-toolbar">
        <div className="oc-data-table-heading">
          <span className="oc-data-table-title">{title}</span>
          <button className="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" popoverTarget={`${tableId}-menu`} aria-label={L.listActions} title={L.listActions}>
            <Icon d={MDI.tune_variant} />
          </button>
          <div className="oc-dropdown-menu" id={`${tableId}-menu`} popover="auto">
            <button className="oc-dropdown-item" type="button" data-oc-export="">{L.exportCsv}</button>
            {importable && (
              <>
                <button className="oc-dropdown-item" type="button" data-oc-import="">{L.importCsv}</button>
                <input className="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file="" />
              </>
            )}
            {bulk && <button className="oc-dropdown-item" type="button" data-oc-bulk="duplicate">{L.duplicateSelection}</button>}
            {bulk && <button className="oc-dropdown-item" type="button" data-oc-bulk="archive">{L.trashSelection}</button>}
            <div className="oc-dropdown-separator" />
            <button className="oc-dropdown-item" type="button" data-oc-density="comfortable">{L.comfortable}</button>
            <button className="oc-dropdown-item" type="button" data-oc-density="compact">{L.compact}</button>
          </div>
        </div>
        <input className="oc-input oc-data-table-search" type="search" placeholder={searchPlaceholder} aria-label={fill(L.search, title)} defaultValue={search} />
        {filters && (
          <div className="oc-filter-pills" role="group" aria-label={L.trashFilter}>
            <button className="oc-filter-pill" type="button" data-oc-filter="active" aria-current={pill("active")}>{L.activeOnly}</button>
            <button className="oc-filter-pill" type="button" data-oc-filter="all" aria-current={pill("all")}>{L.includingTrash}</button>
            <button className="oc-filter-pill" type="button" data-oc-filter="deleted" aria-current={pill("deleted")}>{L.trashOnly}</button>
            {archive && <button className="oc-filter-pill" type="button" data-oc-filter="archived" aria-current={pill("archived")}>{L.archiveOnly}</button>}
          </div>
        )}
        {view && <div className="oc-data-table-view" role="group" aria-label={L.view}>
          <button className="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true" aria-label={L.table}>
            <Icon d={MDI.format_list_bulleted} />
          </button>
          <button className="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="grid" aria-label={L.cards}>
            <Icon d={MDI.view_grid_outline} />
          </button>
        </div>}
        {actions && <div className="oc-data-table-actions">{actions}</div>}
        <p className="oc-data-table-sort-summary" data-oc-sort-summary="" role="status" />
      </div>
      {columnFilters?.length ? (
        <div className="oc-data-table-filters" id={`${tableId}-filters`}>
          {columnFilters.map((f) => (
            <label className="oc-data-table-filter" key={f.column}>
              {f.icon ?? <Icon d={MDI.filter_outline} />}
              <select className="oc-select" data-oc-col-filter={f.column} aria-label={f.label} defaultValue="">
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      ) : null}
      {picker && (
        <div className="oc-dropdown-menu oc-data-table-colpick" id={`${tableId}-colpick`} popover="auto">
          <p className="oc-data-table-colpick-title">{L.columns}</p>
          {columns.map((col) => (
            <label className="oc-dropdown-item" key={col.key}>
              <input
                type="checkbox"
                data-oc-visible-col={col.key}
                checked={col.hideable === false || visible.includes(col.key)}
                disabled={col.hideable === false}
                onChange={(e) => toggleColumn(col.key, e.currentTarget.checked)}
              /> {col.header}
            </label>
          ))}
        </div>
      )}
      {columnMenu && !picker && (<div className="oc-column-menu" id={`${tableId}-columns`} popover="auto">
        <p className="oc-column-menu-title">{L.columns}</p>
        {resizable && <button className="oc-dropdown-item" type="button" data-oc-reset-widths="">{L.resetWidths}</button>}
        {resizable && <div className="oc-dropdown-separator" />}
        <form className="oc-column-menu-list">
          {columns.map((col, index) => col.hideable === false ? null : (
            <label className="oc-column-menu-item" key={col.key}>
              <input type="checkbox" data-col={lead + index + 1} defaultChecked={!col.defaultHidden} /> {col.header}
            </label>
          ))}
        </form>
      </div>)}
      {bulk && <div className="oc-data-table-bulk" hidden>
        <span data-oc-selected-count="">{L.selected.replace("{n}", "0")}</span>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export">{L.exportSelection}</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="duplicate">{L.duplicate}</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="archive">{L.moveToTrash}</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="restore">{L.restore}</button>
        <button className="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete">{L.deletePermanently}</button>
        <button className="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="clear">{L.clear}</button>
      </div>}
      <div className="oc-data-table-frame">
        <div className="oc-data-table-scroll">
          <table className="oc-table oc-data-table-table">
            <thead>
              <tr>
                {selectable && <th data-oc-col="select"><input className="oc-checkbox" type="checkbox" data-oc-select-all="" aria-label={L.selectAll} /></th>}
                {draggable && <th data-oc-col="order"><span className="oc-visually-hidden">{L.order}</span></th>}
                {shown.map((col) => (
                  <th key={col.key} data-oc-col={col.key} data-oc-sort={col.numeric ? "numeric" : "text"} data-numeric={col.numeric ? "" : undefined} data-hide-below={col.hideBelow} aria-sort={ariaSort(col)}>
                    <span className="oc-data-table-th">
                      {col.sortable === false ? col.header : <button className="oc-table-sort" type="button">{col.header}</button>}
                      {resizable && <span className="oc-data-table-resize" role="separator" aria-orientation="vertical" aria-label={fill(L.resize, col.header)} />}
                    </span>
                  </th>
                ))}
                <th data-oc-col="actions">
                  <span className="oc-data-table-th">
                    {L.actions}
                    {(columnMenu || picker) && (
                      <button className="oc-btn oc-btn--plain oc-data-table-columns-btn" type="button" popoverTarget={picker ? `${tableId}-colpick` : `${tableId}-columns`} aria-label={L.columns} title={L.columns}>
                        <Icon d={MDI.view_column_outline} />
                      </button>
                    )}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {skeletons.map((i) => (
                <tr key={`oc-skeleton-${i}`} className="oc-data-table-skeleton" aria-hidden="true">
                  {selectable && <td data-oc-col="select"><span className="oc-skeleton oc-data-table-skeleton-box" /></td>}
                  {draggable && <td data-oc-col="order" />}
                  {shown.map((col) => (
                    <td key={col.key} data-numeric={col.numeric ? "" : undefined} data-hide-below={col.hideBelow}><span className="oc-skeleton oc-data-table-skeleton-bar" /></td>
                  ))}
                  <td data-oc-col="actions" />
                </tr>
              ))}
              {!loading && rows.map((row) => (
                <tr key={row.key} data-oc-row="" data-oc-key={row.key} data-oc-status={row.status || "active"} data-oc-href={row.href}>
                  {selectable && (
                    <td data-oc-col="select"><input className="oc-checkbox" type="checkbox" data-oc-select="" aria-label={fill(L.select, label(row))} /></td>
                  )}
                  {draggable && (
                    <td data-oc-col="order" className="oc-sortable-row-grip-cell">
                      <button className="oc-sortable-row-grip" type="button" aria-label={fill(L.move, label(row))} />
                    </td>
                  )}
                  {shown.map((col) => {
                    const cell = row.cells[col.key] ?? "";
                    return (
                      <td key={col.key} data-oc-col={col.key} data-numeric={col.numeric ? "" : undefined} data-hide-below={col.hideBelow} data-oc-value={row.values?.[col.key]}>
                        {col.truncate && typeof cell === "string"
                          ? <span className="oc-data-table-truncate" style={{ ["--oc-data-table-truncate" as string]: col.truncate }} title={cell}>{cell}</span>
                          : cell}
                      </td>
                    );
                  })}
                  <td data-oc-col="actions"><div style={{ display: "flex", gap: "0.375rem", justifyContent: "flex-end" }}>{rowActions ? rowActions(row) : defaultActions(row, L.edit)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {emptyState != null
          ? <div className="oc-data-table-empty" hidden>{emptyState}</div>
          : <p className="oc-data-table-empty" hidden>{L.noResults}</p>}
      </div>
      <div className="oc-data-table-footer">
        <p className="oc-data-table-summary" data-oc-summary={summary ?? labels?.summary ?? ""} />
        {pagination && <label className="oc-data-table-per-page">{L.rowsPerPage}
          <select className="oc-select" data-oc-page-size="" aria-label={L.rowsPerPage} defaultValue={String(pageSize)}>
            {sizes.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>}
        {pagination && <nav className="oc-data-table-pager" data-oc-pager="" aria-label={L.pagination} />}
      </div>
    </div>
  );
}
