import type { ReactNode } from "react";

export type ClassValue = string | false | null | undefined;

/** Join class names, skipping falsy values. */
export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}

/** `oc-btn` + `--secondary` -> `oc-btn oc-btn--secondary` (skips empty modifiers). */
export function mod(base: string, ...modifiers: ClassValue[]): string {
  return cx(base, ...modifiers.map((m) => (m ? `${base}--${m}` : null)));
}

/** Attributes React's types do not know yet (popover, invoker commands, closedby). */
export function attrs(record: Record<string, string | undefined>): object {
  return record;
}

export type Slot = ReactNode;

/** Call a handler, then call another one. */
export function callAll<E>(...fns: Array<((e: E) => void) | undefined>) {
  return (e: E) => fns.forEach((fn) => fn?.(e));
}
