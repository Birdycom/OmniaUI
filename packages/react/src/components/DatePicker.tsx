// File: packages/react/src/components/DatePicker.tsx
// Map: props (value, placeholder, locale, calendar options) -> trigger (.oc-date-picker-trigger, value or placeholder)
//      -> popover (.oc-popover--calendar) with the Calendar -> pick (close the popover) -> hidden input for forms
// Same markup as packages/ui/snippets/date-picker.html (the trigger and the calendar popover).
"use client";

import { forwardRef, useId, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { useControllable } from "../hooks";
import { Calendar } from "./Calendar";
import type { CalendarProps } from "./Calendar";
import { Webicon } from "./Webicon";

export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange"> {
  /** The picked day ("2026-10-16"). */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** Text on the trigger while nothing is picked (default "Pick a date"). */
  placeholder?: ReactNode;
  /** Language of the date on the trigger and in the calendar (default: the page). */
  locale?: string;
  /** How the trigger shows the date (default: 16 October 2026). */
  format?: (date: string) => ReactNode;
  /** A hidden input with the picked day, for a form. */
  name?: string;
  min?: string;
  max?: string;
  isDisabled?: (date: string) => boolean;
  today?: string;
  weekStart?: 0 | 1;
  /** More props for the Calendar. */
  calendarProps?: Omit<CalendarProps, "mode" | "value" | "defaultValue" | "onChange">;
}

const longDate = (date: string, locale?: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));

const calendarIcon = <Webicon name="mdi:calendar" size="sm" />;

/** Trigger button with a calendar in a popover (`.oc-date-picker-trigger` + `.oc-popover--calendar`). A pick closes it. */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  { value, defaultValue, onChange, placeholder = "Pick a date", locale, format, name, min, max, isDisabled, today, weekStart, calendarProps, id, className, ...rest },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const popId = id ? `${id}-calendar` : `oc-date-picker-${auto}`;
  const pop = useRef<HTMLDivElement>(null);
  const [date, setDate] = useControllable<string | undefined>(value, defaultValue, onChange as (d: string | undefined) => void);
  const pick = (d: string) => {
    setDate(d);
    try { (pop.current as (HTMLDivElement & { hidePopover?: () => void }) | null)?.hidePopover?.(); } catch { /* already closed */ }
  };
  return (
    <>
      <button
        ref={ref}
        id={id}
        className={cx("oc-btn oc-btn--outline oc-date-picker-trigger", className)}
        type="button"
        popoverTarget={popId}
        aria-haspopup="dialog"
        {...(date ? {} : { "data-empty": "" })}
        {...rest}
      >
        <span>{date ? (format ? format(date) : longDate(date, locale)) : placeholder}</span> {calendarIcon}
      </button>
      <div ref={pop} className="oc-popover oc-popover--calendar" id={popId} {...attrs({ popover: "" })}>
        <Calendar {...calendarProps} value={date} onChange={pick} locale={locale} min={min} max={max} isDisabled={isDisabled} today={today} weekStart={weekStart} />
      </div>
      {name && <input type="hidden" name={name} value={date ?? ""} />}
    </>
  );
});
