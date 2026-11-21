// File: packages/ui/src/combobox.d.ts
// Types for the combobox behaviour (filter, keyboard, choose, catalog mode) of the CSS combobox.

/** Option data for server search results and root.ocSetOptions(). */
export interface ComboboxItem {
  value: string | number;
  label: string;
  description?: string;
  /** Webicon name, drawn with <iconify-icon>. */
  icon?: string;
  image?: string;
  emoji?: string;
  disabled?: boolean;
}

/** The wrapper after bindCombobox: ocSetOptions replaces the options (server search results); with `query`, an answer
 *  for an older question than what is in the field is dropped. */
export interface ComboboxRoot extends HTMLElement {
  ocSetOptions?: (items: ComboboxItem[], query?: string) => void;
}

/** Text label of an option (without its icon, image, emoji or description). */
export function optionLabel(option: Element): string;
/** data-value of an option, else its label. */
export function optionValue(option: HTMLElement): string;
/** True when the label contains the query (case and accents ignored). */
export function matches(label: string, query: string): boolean;
/** One <li class="oc-combobox-option"> from data. */
export function optionElement(item: ComboboxItem, doc?: Document): HTMLLIElement;
/**
 * Starts one .oc-combobox; returns a function that stops it. Events: oc-combobox-change { value, label, custom },
 * oc-combobox-search { query } (data-oc-search="event"), oc-combobox-manage { href }.
 */
export function bindCombobox(root: ComboboxRoot): () => void;
/** Starts every .oc-combobox[data-oc-combobox] in scope; returns a function that stops them. */
export function initCombobox(scope?: ParentNode): () => void;
