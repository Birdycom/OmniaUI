"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { webiconNode } from "./Webicon";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  /** Icon before the label: a webicon name ("mdi:domain") or any node. */
  icon?: ReactNode;
  /** Count after the label (`.oc-data-table-tab-count`); the tab list then gets `.oc-data-table-tabs`. */
  count?: ReactNode;
  /** Color of the count, like the type badge in a data table. */
  countTone?: "success" | "info" | "warning";
  /** A tab that cannot be chosen. */
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Radio group name (generated when omitted); in buttons mode the base of the tab and panel ids. */
  name?: string;
  /** Line tabs (default), a muted track with a raised pill (`pill`) or the tabs beside the panels (`vertical`). */
  variant?: "pill" | "vertical";
  /** `radio` (default): radio inputs and `:has()`, no state needed. `buttons`: class-toggle tabs, `button[role=tab]` with
   *  `aria-selected` and `.is-active` on the panel (the component holds the state). */
  mode?: "radio" | "buttons";
  /** `aria-label` of the tab list. */
  listLabel?: string;
  /** Extra class for the tab list. */
  listClassName?: string;
}

/** `.oc-tabset`: radio triggers + panels; CSS (`:has()`) shows the selected panel. `mode="buttons"`: class-toggle tabs. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, value, defaultValue, onChange, name, variant, mode = "radio", listLabel, listClassName, className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-tabs-${auto.replace(/:/g, "")}`;
  const first = tabs.find((t) => !t.disabled) ?? tabs[0];
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? first?.value ?? "", onChange);
  const counts = tabs.some((t) => t.count != null);
  const listClass = cx("oc-tab-list", variant && `oc-tab-list--${variant}`, counts && "oc-data-table-tabs", listClassName);
  const inner = (t: TabItem) => (
    <>
      {t.icon != null && webiconNode(t.icon)}
      {t.label}
      {t.count != null && <span className={cx("oc-data-table-tab-count", t.countTone && `oc-data-table-tab-count--${t.countTone}`)}>{t.count}</span>}
    </>
  );
  if (mode === "buttons") {
    return (
      <div ref={ref} className={className} {...rest}>
        <div className={listClass} role="tablist" aria-label={listLabel}>
          {tabs.map((t, i) => (
            <button
              key={t.value}
              className="oc-tab-trigger"
              type="button"
              role="tab"
              id={`${group}-tab-${i + 1}`}
              aria-selected={current === t.value}
              aria-controls={`${group}-${i + 1}`}
              disabled={t.disabled}
              onClick={() => setCurrent(t.value)}
            >
              {inner(t)}
            </button>
          ))}
        </div>
        {tabs.map((t, i) => (
          <div
            key={t.value}
            className={cx("oc-tab-panel", current === t.value && "is-active")}
            id={`${group}-${i + 1}`}
            role="tabpanel"
            aria-labelledby={`${group}-tab-${i + 1}`}
          >
            {t.content}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div ref={ref} className={cx("oc-tabset", className)} {...rest}>
      <div className={listClass} role="tablist" aria-label={listLabel}>
        {tabs.map((t) => (
          <label className="oc-tab-trigger" key={t.value}>
            <input type="radio" name={group} value={t.value} checked={current === t.value} disabled={t.disabled} onChange={() => setCurrent(t.value)} /> {inner(t)}
          </label>
        ))}
      </div>
      {tabs.map((t) => (
        <div className="oc-tab-panel" key={t.value}>{t.content}</div>
      ))}
    </div>
  );
});
