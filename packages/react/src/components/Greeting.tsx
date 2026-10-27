// File: packages/react/src/components/Greeting.tsx
// Map: greetingTimeOfDay() helper -> Greeting = header -> icon -> body (eyebrow, title + name, date) -> actions
// The time of day is computed from `date` (default: now). Morning 05-12, afternoon 12-18, evening otherwise.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type GreetingTimeOfDay = "morning" | "afternoon" | "evening";

/** Pick the time-of-day modifier for a date. */
export function greetingTimeOfDay(date: Date = new Date()): GreetingTimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

const WORDS: Record<GreetingTimeOfDay, string> = { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" };

export interface GreetingProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  name?: ReactNode;
  /** The moment to greet for (default: now). Also shown as the date. */
  date?: Date;
  /** Force a time of day instead of computing it. */
  timeOfDay?: GreetingTimeOfDay;
  /** Translated greetings, e.g. `{ morning: "Goedemorgen", ... }`. */
  words?: Partial<Record<GreetingTimeOfDay, string>>;
  /** Locale for the date text (default: the browser locale). */
  locale?: string;
  /** Hide the date line. */
  hideDate?: boolean;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  size?: "lg";
}

/** `.oc-greeting`: dashboard greeting with date and actions. */
export const Greeting = forwardRef<HTMLElement, GreetingProps>(function Greeting(
  { name, date, timeOfDay, words, locale, hideDate, eyebrow, icon, actions, size, className, ...rest },
  ref,
) {
  const when = date ?? new Date();
  const tod = timeOfDay ?? greetingTimeOfDay(when);
  const word = words?.[tod] ?? WORDS[tod];
  const dateText = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(when);
  // datetime needs YYYY-MM-DD in local time (toISOString would use UTC).
  const iso = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, "0")}-${String(when.getDate()).padStart(2, "0")}`;
  return (
    <header ref={ref} className={cx("oc-greeting", `oc-greeting--${tod}`, size && `oc-greeting--${size}`, className)} {...rest}>
      {icon != null && <span className="oc-greeting-icon" aria-hidden="true">{icon}</span>}
      <div className="oc-greeting-body">
        {eyebrow != null && <p className="oc-greeting-eyebrow">{eyebrow}</p>}
        <h2 className="oc-greeting-title">
          {word}
          {name != null && <>, <span className="oc-greeting-name">{name}</span></>}
        </h2>
        {!hideDate && <time className="oc-greeting-date" dateTime={iso}>{dateText}</time>}
      </div>
      {actions != null && <div className="oc-greeting-actions">{actions}</div>}
    </header>
  );
});
