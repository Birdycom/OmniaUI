"use client";

import { forwardRef, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { isoWeek } from "../../../ui/src/form-extras.js";
import { cx } from "../utils";
import { Icon } from "./Icon";

export interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Show the ISO week at the end. Default true. */
  week?: boolean;
  /** Week label template: {week} and {year}. Default "Week {week}". */
  weekLabel?: string;
  size?: "md" | "sm";
}

/** Native date input with a calendar icon zone and the ISO week (`.oc-date-field`). */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
  { week = true, weekLabel = "Week {week}", size = "md", className, value, defaultValue, onChange, ...rest },
  ref,
) {
  const [current, setCurrent] = useState(String(value ?? defaultValue ?? ""));
  useEffect(() => { if (value !== undefined) setCurrent(String(value)); }, [value]);
  const [y, m, d] = current.split("-").map(Number);
  const label = week && y ? (() => { const w = isoWeek(new Date(y, m - 1, d)); return weekLabel.replace("{week}", String(w.week)).replace("{year}", String(w.year)); })() : "";
  return (
    <div className={cx("oc-date-field", size === "sm" && "oc-date-field--sm", className)}>
      <span className="oc-date-field__icon"><Icon d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 16H5V9h14zm0-12H5V5h14z" /></span>
      <input
        ref={ref}
        type="date"
        className="oc-date-field__input"
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => { setCurrent(event.target.value); onChange?.(event); }}
        {...rest}
      />
      {week && <output className="oc-date-field__week">{label}</output>}
    </div>
  );
});
