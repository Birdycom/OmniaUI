// File: packages/react/src/components/LanguageSelect.tsx
// Map: types -> globe icon -> component (label pill: icon + native select)
// Same markup as packages/ui/snippets/language-select.html. The app decides what "change" does.
"use client";

import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface LanguageSelectOption {
  value: string;
  label: string;
}

export interface LanguageSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue" | "onChange"> {
  options: LanguageSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Currency look (symbol in primary color). */
  currency?: boolean;
  /** No frame until hover / focus. */
  ghost?: boolean;
  /** Replaces the globe icon (e.g. "€"). */
  icon?: ReactNode;
  /** Class for the wrapping label (`className` goes to the select). */
  labelClassName?: string;
}

/** Small globe drawn with currentColor. */
const Globe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

/** `.oc-language-select`: native select in a pill with a leading icon. */
export const LanguageSelect = forwardRef<HTMLSelectElement, LanguageSelectProps>(function LanguageSelect(
  { options, value, defaultValue, onChange, currency, ghost, icon, labelClassName, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  return (
    <label className={cx("oc-language-select", ghost && "oc-language-select--ghost", currency && "oc-language-select--currency", labelClassName)}>
      <span className="oc-language-select-icon" aria-hidden="true">{icon ?? (currency ? "\u20AC" : <Globe />)}</span>
      <select
        ref={ref}
        className={cx("oc-language-select-control", className)}
        aria-label={currency ? "Currency" : "Language"}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
});
