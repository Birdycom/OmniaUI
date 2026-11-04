// File: packages/ui/src/toc.d.ts
// Types for the table-of-contents scroll-spy fallback.

/** Index of the last heading whose top is at or above the line, or -1. */
export function currentIndex(tops: number[], line: number): number;
/** Puts aria-current on the link of the heading you are reading, in browsers without :target-current. */
export function initToc(scope?: ParentNode, options?: { force?: boolean }): () => void;
/** New scrollTop that keeps a link (top/bottom in the scroller's content) in view, with a margin. */
export function keepInView(scrollTop: number, viewHeight: number, top: number, bottom: number, margin?: number): number;
