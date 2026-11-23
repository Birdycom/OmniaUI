// File: packages/ui/src/barcode.d.ts
// Types for the barcode script (EAN-13, EAN-8, UPC-A, Code 128 as SVG).

export type BarcodeFormat = "auto" | "EAN13" | "EAN8" | "UPC" | "CODE128";
export const CODE128: string[];
/** 12 digits (0.17.1): UPC-A when the last digit is its check digit, else an EAN-13 body. */
export function guessFormat(value: string): Exclude<BarcodeFormat, "auto">;
export function eanCheck(body: string): string;
export function encodeEan(value: string, length: 8 | 13): { bits: string; text: string };
export function code128Values(text: string): number[];
export function encodeCode128(text: string): { bits: string; text: string };
/** fallback "code128" (0.17.1): an EAN/UPC value that cannot be encoded becomes Code 128 (`fallback: true`) instead of an error. */
export function encodeBarcode(value: string, format?: BarcodeFormat | string, options?: { fallback?: "code128" | "CODE128" | string }): { bits: string; text: string; format: Exclude<BarcodeFormat, "auto">; fallback?: boolean };
/** EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1 (0.17.0); Code 128 stays one group. */
export function digitGroups(text: string, format?: string): string[];
/** The figcaption markup with one span.oc-barcode__group per group (0.17.0). */
export function digitsHtml(text: string, format?: string, group?: boolean): string;
export function barsToSvg(bits: string, label?: string): string;
export function barcodeFile(value: string, options?: { format?: BarcodeFormat | string; digits?: boolean; moduleWidth?: number; height?: number }): string;
export function renderBarcode(el: HTMLElement): void;
export function initBarcodes(scope?: ParentNode): void;
