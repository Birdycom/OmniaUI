// File: packages/ui/src/input-mask.d.ts
// Types for the input mask and validation helpers (live formatting, blur validation) of a plain .oc-input.

/** Named masks; any other string is a pattern (9 = digit, A = letter, * = any). */
export type NamedMask = "iban" | "bic" | "vat" | "phone";
/** Checks `validate()` knows. */
export type ValidationType = "iban" | "bic" | "vat" | "email" | "phone";

/** Length of an IBAN per country (ISO 3166 code). */
export const IBAN_LENGTHS: Record<string, number>;
export const NAMED_MASKS: NamedMask[];
/** Formats a value with a pattern: 9 = digit, A = letter, * = any; other characters are literals. */
export function applyPattern(pattern: string, value: string): string;
/** Formats a value while typing (named mask or pattern). */
export function applyMask(type: NamedMask | (string & {}) | undefined, value: string): string;
/** Caret position in `formatted` after `count` letters/digits. */
export function caretFor(formatted: string, count: number): number;
/** Number of letters/digits before `caret` in `value`. */
export function countBefore(value: string, caret: number): number;
/** IBAN check: country length + mod-97. */
export function validIban(value: string): boolean;
/** VAT number: BE (mod-97), NL (format), other EU countries (format). */
export function validVat(value: string): boolean;
/** True when the value is valid for the type; an empty value is always valid. */
export function validate(type: ValidationType | (string & {}) | undefined, value: string): boolean;
/** Formats an input in place and keeps the caret behind the same character. Returns the new value. */
export function maskInput(input: HTMLInputElement, type: string): string;
/** Starts one input (data-oc-mask, data-oc-validate, data-oc-validation-message). Event: oc-input-validate { valid, value, type }. */
export function bindInputMask(input: HTMLInputElement): () => void;
/** Starts every input[data-oc-mask] / input[data-oc-validate] in scope. */
export function initInputMask(scope?: ParentNode): () => void;
