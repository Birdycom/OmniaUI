// File: packages/ui/src/form-extras.d.ts
// Types for the date field (ISO week), name card (rename) and avatar picker (preview) helpers.

export function isoWeek(date: Date): { week: number; year: number };
export function bindDateField(root: HTMLElement): void;
export function bindNameCard(root: HTMLElement): void;
export function bindAvatarPicker(root: HTMLElement): void;
export function initFormExtras(scope?: ParentNode): void;
