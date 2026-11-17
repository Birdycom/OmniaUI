// File: packages/ui/src/calendar.d.ts
// Types for the calendar behaviour (pick a day or a range, arrow keys) of the CSS calendar.

/** The ISO date `days` after (or before) an ISO date ("2026-10-31", 1 -> "2026-11-01"). */
export function shiftDate(iso: string, days: number): string;
/** aria-selected and the --range-* classes of one day for a choice (one day, or start..end). */
export function dayState(iso: string, start?: string, end?: string): { selected: boolean; cls: string[] };
/** Starts one [data-oc-calendar] root; returns a function that stops it. Event: oc-calendar-change. */
export function bindCalendar(root: HTMLElement): () => void;
/** Starts every [data-oc-calendar] in scope. */
export function initCalendar(scope?: ParentNode): Array<() => void>;
