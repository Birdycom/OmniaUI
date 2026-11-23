// File: packages/react/src/components/DecimalInput.tsx
// Map: helpers (locale separators, parse, format, currency symbol) -> component (text field, optional unit frame,
//      0.18.0: currency / percent preset = the affix frame of AffixInput around the locale field)
// Same markup as packages/ui/snippets/decimal-input.html. Formats on blur with Intl.NumberFormat.
"use client";

import { forwardRef, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";

export interface DecimalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type"> {
  /** The number; null = empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** BCP 47 locale for separators, e.g. "nl-BE" (1.234,56) or "en-US" (1,234.56). */
  locale?: string;
  /** Fixed number of decimals shown after blur (default 2, or the decimals of `currency`). */
  decimals?: number;
  /** Unit text inside the frame (m², kg). */
  unit?: string;
  /**
   * 0.18.0: ISO currency code ("EUR", "USD"): its symbol inside the frame (before or after the value, as the locale writes
   * it: € 1.234,56 in nl-BE, 1.234,56 € in fr-BE) and the decimals of that currency unless `decimals` is set.
   */
  currency?: string;
  /** 0.18.0: a percentage: "%" after the value. The value is the number you see (21 = 21 %), not a fraction. */
  percent?: boolean;
  /** Class for the frame around the field (with `unit`, `currency` or `percent`); `className` goes to the input. */
  groupClassName?: string;
  /** Left-aligned digits. */
  alignStart?: boolean;
  error?: boolean;
}

/** Group and decimal separator of a locale, e.g. nl-BE -> { group: ".", decimal: "," }. */
function separators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  return { group: parts.find((p) => p.type === "group")?.value ?? ",", decimal: parts.find((p) => p.type === "decimal")?.value ?? "." };
}

/** "1.234,56" (nl-BE) -> 1234.56. Returns null for empty or unreadable text. */
export function parseDecimal(text: string, locale = "nl-BE"): number | null {
  const { group, decimal } = separators(locale);
  const clean = text.trim().split(group).join("").replace(decimal, ".").replace(/\s/g, "");
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

/** The symbol of a currency in a locale and whether it comes before the number: ("nl-BE", "EUR") -> { symbol: "€", before: true }. */
export function currencyAffix(locale: string, currency: string): { symbol: string; before: boolean; decimals: number } {
  const nf = new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol" });
  const parts = nf.formatToParts(1);
  const at = parts.findIndex((p) => p.type === "currency");
  return { symbol: parts[at]?.value ?? currency, before: at < parts.findIndex((p) => p.type === "integer"), decimals: nf.resolvedOptions().maximumFractionDigits ?? 2 };
}

/** 1234.56 -> "1.234,56" (nl-BE, 2 decimals). */
export function formatDecimal(n: number | null | undefined, locale = "nl-BE", decimals = 2): string {
  if (n == null) return "";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

/** `.oc-decimal-input`: free typing, formatted on blur, value reported as a number. */
export const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(function DecimalInput(
  { value, defaultValue, onValueChange, locale = "nl-BE", decimals: decimalsProp, unit, currency, percent, groupClassName, alignStart, error, className, onBlur, onFocus, ...rest },
  ref,
) {
  const money = currency ? currencyAffix(locale, currency) : undefined;
  const decimals = decimalsProp ?? money?.decimals ?? 2;
  const [text, setText] = useState(() => formatDecimal(value ?? defaultValue, locale, decimals));
  const [focused, setFocused] = useState(false);

  // Controlled: show a new outside value, but never while the user is typing.
  useEffect(() => {
    if (value !== undefined && !focused) setText(formatDecimal(value, locale, decimals));
  }, [value, locale, decimals, focused]);

  const input = (
    <input
      ref={ref}
      className={cx("oc-input", "oc-decimal-input", alignStart && "oc-decimal-input--start", className)}
      type="text"
      inputMode="decimal"
      aria-invalid={error ? true : undefined}
      value={text}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onChange={(e) => { setText(e.target.value); onValueChange?.(parseDecimal(e.target.value, locale)); }}
      onBlur={(e) => {
        setFocused(false);
        const n = parseDecimal(text, locale);
        if (n != null || !text.trim()) setText(formatDecimal(n, locale, decimals));
        onBlur?.(e);
      }}
      {...rest}
    />
  );

  const symbol = money?.symbol ?? (percent ? "%" : undefined);
  if (symbol) {
    const addon = <span className="oc-input-addon" aria-hidden="true">{symbol}</span>;
    const before = money?.before ?? false;
    return (
      <div className={cx("oc-input-group", "oc-input-group--affix", error && "oc-input-group--error", groupClassName)} data-currency={currency || undefined}>
        {before && addon}
        {input}
        {!before && addon}
      </div>
    );
  }
  if (!unit) return input;
  return (
    <div className={cx("oc-decimal-field", groupClassName)}>
      {input}
      <span className="oc-decimal-field-unit">{unit}</span>
    </div>
  );
});
