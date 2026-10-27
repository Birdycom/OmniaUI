// File: packages/react/src/components/ChipFilter.tsx
// Map: types -> component (group -> one chip label per option: checkbox or radio + text + optional count)
// Same markup as packages/ui/snippets/chip-filter.html. multiple = checkboxes (array value), else radios (string).
"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface ChipFilterOption {
  value: string;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface ChipFilterProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: ChipFilterOption[];
  /** Several chips at once (checkboxes). */
  multiple?: boolean;
  /** string for single choice, string[] with `multiple`. */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  name?: string;
  size?: "sm" | "md";
  /** One line that scrolls sideways. */
  scroll?: boolean;
}

/** `.oc-chip-filter`: rounded filter chips. */
export const ChipFilter = forwardRef<HTMLDivElement, ChipFilterProps>(function ChipFilter(
  { options, multiple, value, defaultValue, onChange, name, size = "md", scroll, className, ...rest },
  ref,
) {
  const group = name ?? `oc-chip-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string | string[]>(value, defaultValue ?? (multiple ? [] : ""), onChange);
  const selected = Array.isArray(current) ? current : current ? [current] : [];

  // Checkbox: add or remove the value. Radio: replace it.
  const toggle = (v: string) => setCurrent(multiple ? (selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]) : v);

  return (
    <div
      ref={ref}
      className={cx("oc-chip-filter", size === "sm" && "oc-chip-filter--sm", scroll && "oc-chip-filter--scroll", className)}
      role={multiple ? "group" : "radiogroup"}
      {...rest}
    >
      {options.map((o) => (
        <label key={o.value} className="oc-chip-filter-item">
          <input type={multiple ? "checkbox" : "radio"} name={group} value={o.value} disabled={o.disabled} checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
          {" "}{o.label}
          {o.count != null && <span className="oc-chip-filter-count">{o.count}</span>}
        </label>
      ))}
    </div>
  );
});
