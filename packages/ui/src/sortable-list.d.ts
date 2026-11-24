// File: packages/ui/src/sortable-list.d.ts
// Types for the sortable list script (0.18.0): pointer drag (touch), keyboard (Space + arrows), live region, oc-reorder event.

export interface SortableListMessages {
  /** {label}, {pos} and {count} are filled in. */
  grabbed?: string;
  moved?: string;
  dropped?: string;
  cancelled?: string;
}

export interface SortableListOptions {
  /** Move the DOM node (default true). false: only report from / to, for React or Vue that render the new order. */
  move?: boolean;
  onReorder?: (from: number, to: number, order: string[]) => void;
  messages?: SortableListMessages;
}

export interface SortableListApi {
  order(): string[];
  reorder(from: number, to: number): boolean;
  destroy(): void;
  set(options: SortableListOptions): void;
}

/** Detail of the "oc-reorder" event on the list. */
export interface SortableReorderDetail {
  from: number;
  to: number;
  order: string[];
  id?: string;
}

export function sortableItems(list: Element): HTMLElement[];
export function sortableOrder(list: Element): string[];
export function bindSortableList(list: HTMLElement, options?: SortableListOptions): SortableListApi | undefined;
export function initSortableLists(scope?: ParentNode): void;
