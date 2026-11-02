// File: packages/ui/src/barcode.d.ts
// Types for the barcode script (EAN-13, EAN-8, UPC-A, Code 128 as SVG).

export type BarcodeFormat = "auto" | "EAN13" | "EAN8" | "UPC" | "CODE128";
export const CODE128: string[];
export function guessFormat(value: string): Exclude<BarcodeFormat, "auto">;
export function eanCheck(body: string): string;
export function encodeEan(value: string, length: 8 | 13): { bits: string; text: string };
export function code128Values(text: string): number[];
export function encodeCode128(text: string): { bits: string; text: string };
export function encodeBarcode(value: string, format?: BarcodeFormat | string): { bits: string; text: string };
export function barsToSvg(bits: string, label?: string): string;
export function barcodeFile(value: string, options?: { format?: BarcodeFormat | string; digits?: boolean; moduleWidth?: number; height?: number }): string;
export function renderBarcode(el: HTMLElement): void;
export function bindBarcodeMaker(root: HTMLElement): void;
export function initBarcodes(scope?: ParentNode): void;
