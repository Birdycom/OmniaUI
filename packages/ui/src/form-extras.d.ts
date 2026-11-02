// File: packages/ui/src/form-extras.d.ts
// Types for the date field (ISO week), name card (rename), avatar picker (preview) and quantity (step) helpers.

export function isoWeek(date: Date): { week: number; year: number };
export function bindDateField(root: HTMLElement): void;
export function bindNameCard(root: HTMLElement): void;
export function acceptsFile(file: { type?: string; name?: string } | null | undefined, accept?: string): boolean;
export function bindAvatarPicker(root: HTMLElement): void;
export function stepQuantity(value: number, direction: -1 | 1, limits?: { min?: number; max?: number; step?: number }): number;
export function bindQuantity(root: HTMLElement): void;
export function initFormExtras(scope?: ParentNode): void;
