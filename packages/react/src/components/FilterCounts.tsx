// File: packages/react/src/components/FilterCounts.tsx
// Map: types -> component (fieldset radiogroup -> one tile per view: radio + value + label + hint)
// Same markup as packages/ui/snippets/filter-counts.html.
"use client";

import { forwardRef, useId } from "react";
import type { FieldsetHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface FilterCountsOption {
  value: string;
  label: ReactNode;
  count: number | string;
  hint?: ReactNode;
  /** Accent color of the tile; default primary. */
  tone?: "primary" | "success" | "destructive" | "muted";
  disabled?: boolean;
}

export interface FilterCountsProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  options: FilterCountsOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  /** Small inline pills instead of tiles. */
  compact?: boolean;
}

/** `.oc-filter-counts`: choose a view; every tile shows its item count. */
export const FilterCounts = forwardRef<HTMLFieldSetElement, FilterCountsProps>(function FilterCounts(
  { options, value, defaultValue, onChange, name, compact, className, ...rest },
  ref,
) {
  const group = name ?? `oc-filter-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  return (
    <fieldset ref={ref} className={cx("oc-filter-counts", compact && "oc-filter-counts--compact", className)} role="radiogroup" {...rest}>
      {options.map((o) => (
        <label key={o.value} className={cx("oc-filter-counts-item", o.tone && o.tone !== "primary" && `oc-filter-counts-item--${o.tone}`)}>
          <input type="radio" name={group} value={o.value} disabled={o.disabled} checked={current === o.value} onChange={() => setCurrent(o.value)} />
          <span className="oc-filter-counts-value">{o.count}</span>
          <span className="oc-filter-counts-label">{o.label}</span>
          {o.hint != null && <span className="oc-filter-counts-hint">{o.hint}</span>}
        </label>
      ))}
    </fieldset>
  );
});
