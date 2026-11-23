// File: packages/react/src/components/Calendar.tsx
// Map: props (single day or range, month, min/max) -> month grid (monthGrid) -> header (previous, title, next) -> table
//      (weekdays, days with state: today, outside, selected, range, disabled) -> pick -> arrow keys (also into the next
//      or previous month)
// The CSS calendar (.oc-calendar, packages/ui/snippets/calendar.html) as a component (0.17.0).
"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { dayState, monthGrid, shiftDate, shiftMonth } from "../../../ui/src/calendar.js";

export interface CalendarRange { start?: string; end?: string }

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** "single" (default): one day. "range": a start and an end day. */
  mode?: "single" | "range";
  /** The picked day ("2026-10-20"), single mode. */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** The picked range, range mode. */
  range?: CalendarRange;
  defaultRange?: CalendarRange;
  onRangeChange?: (range: CalendarRange) => void;
  /** The month shown ("2026-10"); default: the month of the value, else of today. */
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  /** First and last day that can be picked. */
  min?: string;
  max?: string;
  /** Days that cannot be picked (a holiday, a full day). */
  isDisabled?: (date: string) => boolean;
  /** Today ("2026-10-14"); default: the real today. */
  today?: string;
  /** Language of the month and day names (default: the page). */
  locale?: string;
  /** 1 = Monday first (default), 0 = Sunday first. */
  weekStart?: 0 | 1;
  labels?: { previous?: string; next?: string };
}

const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const chevron = (d: string) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

/** `.oc-calendar`: a month to pick a day or a range from, with the keyboard too. */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { mode = "single", value, defaultValue, onChange, range, defaultRange, onRangeChange, month, defaultMonth, onMonthChange, min, max, isDisabled, today, locale, weekStart = 1, labels, className, ...rest },
  ref,
) {
  const now = today ?? isoToday();
  const [day, setDay] = useControllable<string | undefined>(value, defaultValue, onChange as (v: string | undefined) => void);
  const [span, setSpan] = useControllable<CalendarRange>(range, defaultRange ?? {}, onRangeChange);
  const startMonth = (mode === "range" ? span.start : day)?.slice(0, 7) ?? now.slice(0, 7);
  const [shown, setShown] = useControllable<string>(month, defaultMonth ?? startMonth, onMonthChange);
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const weeks = useMemo(() => monthGrid(shown, weekStart), [shown, weekStart]);
  const fmtTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const fmtDay = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const fmtDayLong = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const title = fmtTitle.format(new Date(`${shown}-01T12:00:00`));
  const off = (iso: string) => (min != null && iso < min) || (max != null && iso > max) || !!isDisabled?.(iso);

  useEffect(() => {
    if (!focusDate) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, shown]);

  const pick = (iso: string) => {
    if (off(iso)) return;
    if (mode === "single") setDay(iso);
    else if (!span.start || span.end) setSpan({ start: iso });
    else if (iso < span.start) setSpan({ start: iso, end: span.start });
    else setSpan({ start: span.start, end: iso });
    if (iso.slice(0, 7) !== shown) setShown(iso.slice(0, 7));
  };
  const onKey = (e: KeyboardEvent<HTMLTableElement>) => {
    const from = (e.target as HTMLElement).dataset.date;
    if (!from) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    let to: string | undefined;
    if (step) to = shiftDate(from, step);
    else if (e.key === "Home" || e.key === "End") {
      const dow = (new Date(`${from}T12:00:00`).getDay() - weekStart + 7) % 7;
      to = shiftDate(from, e.key === "Home" ? -dow : 6 - dow);
    } else if (e.key === "PageUp" || e.key === "PageDown") to = shiftMonth(from.slice(0, 7), e.key === "PageUp" ? -1 : 1) + from.slice(7);
    if (!to) return;
    e.preventDefault();
    if (to.slice(0, 7) !== shown) setShown(to.slice(0, 7));
    setFocusDate(to);
  };

  const selected = mode === "single" ? day : span.start;
  const tabDay = focusDate && focusDate.slice(0, 7) === shown ? focusDate
    : selected && selected.slice(0, 7) === shown ? selected
    : now.slice(0, 7) === shown ? now : `${shown}-01`;

  return (
    <div ref={ref} className={cx("oc-calendar", className)} role="group" aria-label={title} {...rest}>
      <div className="oc-calendar-header">
        <button className="oc-calendar-nav" type="button" aria-label={labels?.previous ?? "Previous month"} onClick={() => setShown(shiftMonth(shown, -1))}>{chevron("m15 18-6-6 6-6")}</button>
        <h3 className="oc-calendar-title" aria-live="polite">{title}</h3>
        <button className="oc-calendar-nav" type="button" aria-label={labels?.next ?? "Next month"} onClick={() => setShown(shiftMonth(shown, 1))}>{chevron("m9 18 6-6-6-6")}</button>
      </div>
      <table ref={gridRef} className="oc-calendar-grid" role="grid" aria-label={title} onKeyDown={onKey}>
        <thead>
          <tr>
            {weeks[0].map((d) => {
              const date = new Date(`${d.iso}T12:00:00`);
              return <th key={d.iso} className="oc-calendar-weekday" scope="col" abbr={fmtDayLong.format(date)}>{fmtDay.format(date).slice(0, 2)}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w[0].iso}>
              {w.map((d) => {
                const s = mode === "single" ? dayState(d.iso, day) : dayState(d.iso, span.start, span.end);
                return (
                  <td key={d.iso}>
                    <button
                      className={cx("oc-calendar-day", d.outside && "oc-calendar-day--outside", d.iso === now && "oc-calendar-day--today", ...s.cls)}
                      type="button"
                      data-date={d.iso}
                      tabIndex={d.iso === tabDay ? 0 : -1}
                      aria-selected={s.selected ? true : undefined}
                      aria-current={d.iso === now ? "date" : undefined}
                      disabled={off(d.iso)}
                      onClick={() => pick(d.iso)}
                    >
                      {d.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
