// File: packages/ui/src/form-extras.d.ts
// Types for the date field (ISO week), name card (rename), avatar picker (preview), quantity (step), language code and one-time code helpers.

export function isoWeek(date: Date): { week: number; year: number };
export function bindDateField(root: HTMLElement): void;
export function bindNameCard(root: HTMLElement): void;
export function acceptsFile(file: { type?: string; name?: string } | null | undefined, accept?: string): boolean;
export function bindAvatarPicker(root: HTMLElement): void;
export function stepQuantity(value: number, direction: -1 | 1, limits?: { min?: number; max?: number; step?: number }): number;
export function bindQuantity(root: HTMLElement): void;
export function languageCode(select: HTMLSelectElement): string;
export function bindLanguageCode(root: HTMLElement): void;
/** 0.17.1: the cell the caret is in (0-based), the last one when the code is full. */
export function otpActiveCell(selectionStart: number | null | undefined, valueLength: number, length: number): number;
/** 0.17.1: marks the active cell of an input.oc-otp (data-otp-active + --oc-otp-active); returns a cleanup function. */
export function bindOtp(input: HTMLInputElement): () => void;
/** 0.18.0: a picked slot of .oc-time-picker goes into its .oc-time-input (input + change events) and closes the popover. */
export function bindTimePicker(root: HTMLElement): void;
/** 0.18.0: selects the whole value of an input[data-oc-select-on-focus] on focus (a click or Tab). */
export function bindSelectOnFocus(input: HTMLInputElement): void;
/** 0.18.0: default national grouping per dial code ("+32": "### ## ## ##", ...). */
export const PHONE_FORMATS: Record<string, string>;
/** 0.18.0: "470123456" + "### ## ## ##" (or [3, 2, 2, 2]) -> "470 12 34 56"; without a format: 3, then pairs. */
export function formatPhoneDigits(digits: string, format?: string | number[] | null): string;
/** 0.18.0: .oc-phone-input groups the number per country while typing and again when the country changes. */
export function bindPhoneInput(root: HTMLElement): void;
export function initFormExtras(scope?: ParentNode): void;
