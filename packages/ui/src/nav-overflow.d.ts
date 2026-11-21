// File: packages/ui/src/nav-overflow.d.ts
// Types for the app header "More" overflow ([data-oc-nav-overflow] around a <ul> of links).

/** How many items fit: all when they fit in `available`, otherwise as many as fit next to the More button. */
export function fitNavItems(widths: number[], available: number, moreWidth: number, gap?: number): number;
/** Shows the first `visible` <li> items of `list`, hides the rest (data-oc-hidden) and copies their links into the More menu. Returns the hidden count. */
export function applyNavOverflow(list: HTMLElement, more: HTMLElement, visible: number): number;
/** Starts one [data-oc-nav-overflow] nav (ResizeObserver); returns a function that stops it. Event: oc-nav-overflow ({ visible, hidden }). */
export function bindNavOverflow(nav: HTMLElement): () => void;
/** Starts every [data-oc-nav-overflow] nav in scope. */
export function initNavOverflow(scope?: ParentNode): Array<() => void>;
