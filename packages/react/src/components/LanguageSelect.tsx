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
  /** Closed it shows only the code ("NL"); pair with ghost in a title bar. The option's value, upper case. */
  code?: boolean;
  /** Replaces the globe icon (e.g. "€"). */
  icon?: ReactNode;
  /** Class for the wrapping label (`className` goes to the select). */
  labelClassName?: string;
}

/** Small globe drawn with currentColor. */
const Globe = () => (
  <svg data-icon="mdi:web" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2s.06-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.92 7.92 0 0 1 9.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8 8 0 0 1 5.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.7 15.7 0 0 0-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"/></svg>
);

/** `.oc-language-select`: native select in a pill with a leading icon. */
export const LanguageSelect = forwardRef<HTMLSelectElement, LanguageSelectProps>(function LanguageSelect(
  { options, value, defaultValue, onChange, currency, ghost, code, icon, labelClassName, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  return (
    <label
      className={cx("oc-language-select", ghost && "oc-language-select--ghost", currency && "oc-language-select--currency", code && "oc-language-select--code", labelClassName)}
      data-code={code ? current.toUpperCase() : undefined}
    >
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
