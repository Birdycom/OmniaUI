"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Radio group name (generated when omitted). */
  name?: string;
}

/** `.oc-tabset`: radio triggers + panels; CSS (`:has()`) shows the selected panel. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, value, defaultValue, onChange, name, className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-tabs-${auto.replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? tabs[0]?.value ?? "", onChange);
  return (
    <div ref={ref} className={cx("oc-tabset", className)} {...rest}>
      <div className="oc-tab-list" role="tablist">
        {tabs.map((t) => (
          <label className="oc-tab-trigger" key={t.value}>
            <input type="radio" name={group} value={t.value} checked={current === t.value} onChange={() => setCurrent(t.value)} /> {t.label}
          </label>
        ))}
      </div>
      {tabs.map((t) => (
        <div className="oc-tab-panel" key={t.value}>{t.content}</div>
      ))}
    </div>
  );
});
