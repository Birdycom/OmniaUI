// File: packages/ui/src/countdown.d.ts
// Types for the countdown behaviour of the CSS countdown (.oc-countdown).

/** 90 -> "1:30", 3725 -> "1:02:05"; never below 0. */
export function formatCountdown(seconds: number): string;
/** Seconds left, the part of the total that is left (0..1) and "low" | "done" | "". */
export function countdownState(left: number, total: number, low?: number): { left: number; fraction: number; state: "" | "low" | "done" };
/** Starts one [data-oc-countdown] element; returns a function that stops it. Event: oc-countdown-end. */
export function bindCountdown(el: HTMLElement): () => void;
/** Starts every [data-oc-countdown] in scope. */
export function initCountdown(scope?: ParentNode): Array<() => void>;
