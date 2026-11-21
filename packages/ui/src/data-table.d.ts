// File: packages/ui/src/data-table.d.ts
// Types for the list-table behaviour script (search, sort, pages, resize, drag, bulk).

export function pageItems(current: number, last: number): Array<number | "…">;
export function compareValues(a: string, b: string, numeric: boolean): number;
export function toCsv(headers: string[], rows: string[][]): string;
export function rowPasses(status: string | undefined, filter: string, text: string, query: string): boolean;
export function bindDataTable(root: HTMLElement): void;
export function initDataTables(scope?: ParentNode): void;

/** Server mode (0.17.0): detail of oc-datatable-query. page is 1-based. */
export interface DataTableQuery {
  reason: "sort" | "page" | "pageSize" | "search" | "trashed" | "filter";
  sort: string | null;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
  search: string;
  trashed: string;
  filters: Record<string, string>;
}

/** Server mode (0.17.0): the state the server answered, for plain HTML / Blade. */
export interface DataTableServerState {
  total?: number;
  /** 1-based. */
  page?: number;
  sort?: string | null;
  dir?: "asc" | "desc";
  trashed?: "active" | "all" | "deleted" | "archived";
  loading?: boolean;
  selected?: string[];
}

export function updateDataTable(root: HTMLElement, state?: DataTableServerState): void;
export function getDataTableSelection(root: HTMLElement): string[];
export function setDataTableSelection(root: HTMLElement, keys: Iterable<string>): void;
