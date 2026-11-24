// 0.18.0: focus alone opens a combobox list only when the user tabbed into the field. A dialog, sheet or drawer that
// focuses the field when it opens (autofocus, focus()) leaves the list closed until a click, typing, Arrow Down or Enter.
// One capture listener per document notes the last Tab press; a focus within 400 ms after it counts as the user's.
const watched = new WeakSet<Document>();
let tabAt = -Infinity;
const now = () => (globalThis.performance?.now?.() ?? Date.now());

export function watchTab(doc: Document | null | undefined = typeof document === "undefined" ? undefined : document): void {
  if (!doc || watched.has(doc)) return;
  watched.add(doc);
  doc.addEventListener("keydown", (e) => { if (e.key === "Tab") tabAt = now(); }, true);
}

/** True right after a Tab press: the focus that follows came from the user, not from a script or autofocus. */
export function focusFromTab(): boolean {
  return now() - tabAt < 400;
}
