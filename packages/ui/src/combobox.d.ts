// File: packages/ui/src/combobox.d.ts
// Types for the combobox behaviour (filter, keyboard, choose) of the CSS combobox.

/** Text label of an option (without its icon). */
export function optionLabel(option: Element): string;
/** data-value of an option, else its label. */
export function optionValue(option: HTMLElement): string;
/** True when the label contains the query (case and accents ignored). */
export function matches(label: string, query: string): boolean;
/** Starts one .oc-combobox; returns a function that stops it. Event: oc-combobox-change { value, label }. */
export function bindCombobox(root: HTMLElement): () => void;
/** Starts every .oc-combobox[data-oc-combobox] in scope; returns a function that stops them. */
export function initCombobox(scope?: ParentNode): () => void;
