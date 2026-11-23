// File: packages/ui/src/tabs.d.ts
// Types for the class-toggle tabs behaviour ([data-oc-tabs] with button[role=tab]).

/** Index of the tab a key moves to (arrows, Home, End), skipping disabled tabs and wrapping; -1 for another key. */
export function nextTab(index: number, disabled: boolean[], key: string, vertical?: boolean): number;
/** Starts one [data-oc-tabs] tab list; returns a function that stops it. Event: oc-tabs-change ({ index, tab, panel }). */
export function bindTabs(list: HTMLElement): () => void;
/** Starts every [data-oc-tabs] tab list in scope. */
export function initTabs(scope?: ParentNode): Array<() => void>;
