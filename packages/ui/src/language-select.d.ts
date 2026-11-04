// File: packages/ui/src/language-select.d.ts
// Types for the language select that switches the page.

/** Address for a chosen option value: the value, plus the current #hash when it has none of its own. */
export function languageTarget(value: string, hash?: string, keepHash?: boolean): string;
/** On change of a [data-oc-language-select], go to the address in the chosen option's value. */
export function initLanguageSelect(scope?: ParentNode): () => void;
