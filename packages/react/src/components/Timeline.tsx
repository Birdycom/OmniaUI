// File: packages/react/src/components/Timeline.tsx | Map: types -> Timeline (ol.oc-timeline -> li.oc-timeline__item)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TimelineEntry {
  /** Year or date label. */
  date: ReactNode;
  /** Machine-readable date; renders a <time> when set. */
  dateTime?: string;
  title?: ReactNode;
  text?: ReactNode;
  /** Marks the latest entry (filled dot). */
  current?: boolean;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineEntry[];
  /** More space between entries. */
  size?: "default" | "lg";
  /** Line in the accent color. */
  accent?: boolean;
}

/** `<ol class="oc-timeline">` with dated entries. Use `className="oc-accent--green"` for another accent. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, size = "default", accent = false, className, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx("oc-timeline", size === "lg" && "oc-timeline--lg", accent && "oc-timeline--accent", className)} {...rest}>
      {items.map((item, i) => (
        <li key={i} className={cx("oc-timeline__item", item.current && "oc-timeline__item--current")}>
          {item.dateTime ? (
            <time className="oc-timeline__date" dateTime={item.dateTime}>{item.date}</time>
          ) : (
            <span className="oc-timeline__date">{item.date}</span>
          )}
          {item.title != null && <h3 className="oc-timeline__title">{item.title}</h3>}
          {item.text != null && <p className="oc-timeline__text">{item.text}</p>}
        </li>
      ))}
    </ol>
  );
});
