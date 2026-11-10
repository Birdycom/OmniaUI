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

/** "Contact 1" -> "C1": the first letters of the first two words (as the Blade components do). */
export function initialsOf(name: unknown): string {
  // A ReactNode name (<>Contact 1 <small>(you)</small></>) counts by its text. A part in brackets ("(you)",
  // "(admin)") and words without a letter or digit ("·", "—") give no initial.
  return textOf(name).replace(/\([^)]*\)/g, " ").trim().split(/\s+/)
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
    .filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/** The plain text of a React node: strings, numbers, arrays and the children of elements. */
export function textOf(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) return textOf((node as { props?: { children?: unknown } }).props?.children);
  return "";
}

/** Call a handler, then call another one. */
export function callAll<E>(...fns: Array<((e: E) => void) | undefined>) {
  return (e: E) => fns.forEach((fn) => fn?.(e));
}
