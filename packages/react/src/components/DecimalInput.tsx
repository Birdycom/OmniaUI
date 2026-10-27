// File: packages/react/src/components/DecimalInput.tsx
// Map: helpers (locale separators, parse, format) -> component (text field, optional unit frame)
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
  /** Fixed number of decimals shown after blur. */
  decimals?: number;
  /** Unit text inside the frame (m², kg). */
  unit?: string;
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

/** 1234.56 -> "1.234,56" (nl-BE, 2 decimals). */
export function formatDecimal(n: number | null | undefined, locale = "nl-BE", decimals = 2): string {
  if (n == null) return "";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

/** `.oc-decimal-input`: free typing, formatted on blur, value reported as a number. */
export const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(function DecimalInput(
  { value, defaultValue, onValueChange, locale = "nl-BE", decimals = 2, unit, alignStart, error, className, onBlur, onFocus, ...rest },
  ref,
) {
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

  if (!unit) return input;
  return (
    <div className="oc-decimal-field">
      {input}
      <span className="oc-decimal-field-unit">{unit}</span>
    </div>
  );
});
