// File: packages/ui/src/tabs.d.ts
// Types for the class-toggle tabs behaviour ([data-oc-tabs] with button[role=tab]).

/** Index of the tab a key moves to (arrows, Home, End), skipping disabled tabs and wrapping; -1 for another key. */
export function nextTab(index: number, disabled: boolean[], key: string, vertical?: boolean): number;
/** Starts one [data-oc-tabs] tab list; returns a function that stops it. Event: oc-tabs-change ({ index, tab, panel }). */
export function bindTabs(list: HTMLElement): () => void;
/** Starts every [data-oc-tabs] tab list in scope. */
export function initTabs(scope?: ParentNode): Array<() => void>;
/** 0.18.0: scroll a tab into view inside its sideways-scrolling tab list (never the page). */
export function revealTab(tab: HTMLElement | null | undefined, smooth?: boolean): void;
