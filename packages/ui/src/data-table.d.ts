// File: packages/ui/src/data-table.d.ts
// Types for the list-table behaviour script (search, sort, pages, resize, drag, bulk).

export function pageItems(current: number, last: number): Array<number | "…">;
export function compareValues(a: string, b: string, numeric: boolean): number;
export function toCsv(headers: string[], rows: string[][]): string;
export function rowPasses(status: string | undefined, filter: string, text: string, query: string): boolean;
export function bindDataTable(root: HTMLElement): void;
export function initDataTables(scope?: ParentNode): void;
