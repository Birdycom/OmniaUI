"use client";

import { createContext, forwardRef, useCallback, useContext, useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { webiconNode } from "./Webicon";
import { revealTab } from "../../../ui/src/tabs.js";

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
  /** The tabs (props API). Leave it out for the compound API: `<TabsList>`, `<TabsTrigger>` and `<TabsContent>` as children. */
  tabs?: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called with the new value (same as `onChange`; the compound name). */
  onValueChange?: (value: string) => void;
  /** Module color (`data-module` on the root). */
  module?: string;
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
  { tabs, value, defaultValue, onChange, onValueChange, module, name, variant, mode = "radio", listLabel, listClassName, className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-tabs-${auto.replace(/:/g, "")}`;
  const first = tabs?.find((t) => !t.disabled) ?? tabs?.[0];
  const report = useCallback((v: string) => { onChange?.(v); onValueChange?.(v); }, [onChange, onValueChange]);
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? first?.value ?? "", report);
  if (module) (rest as Record<string, unknown>)["data-module"] = module;
  if (!tabs) {
    return (
      <TabsContext.Provider value={{ value: current, select: setCurrent, base: group, variant }}>
        <div ref={ref} className={cx("oc-tabs", className)} {...rest} />
      </TabsContext.Provider>
    );
  }
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
              onClick={(e) => { setCurrent(t.value); revealTab(e.currentTarget); }}
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

/* ---------------------------------------------------------------------------------------------
 * Compound API (0.17.0): <Tabs value onValueChange><TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList>
 * <TabsContent value="a">...</TabsContent></Tabs>. Class-toggle tabs underneath (button[role=tab], aria-selected,
 * .is-active on the panel); arrow keys, Home and End move between the enabled tabs.
 * ------------------------------------------------------------------------------------------- */

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  /** Base of the tab and panel ids. */
  base: string;
  variant?: "pill" | "vertical";
}
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Tabs> without a tabs prop.`);
  return ctx;
}

/** A value as part of an id: characters that do not belong in an id become a dash. */
const idPart = (value: string) => value.replace(/[^A-Za-z0-9_-]+/g, "-");

/** The index of the tab a key moves to (skips disabled tabs, wraps at both ends); -1 for another key. */
export function nextTabIndex(index: number, disabled: boolean[], key: string, vertical = false): number {
  const n = disabled.length;
  let step: number;
  let from = index;
  if (key === (vertical ? "ArrowDown" : "ArrowRight")) step = 1;
  else if (key === (vertical ? "ArrowUp" : "ArrowLeft")) step = -1;
  else if (key === "Home") { step = 1; from = -1; }
  else if (key === "End") { step = -1; from = n; }
  else return -1;
  for (let i = 1; i <= n; i++) {
    const at = (((from + step * i) % n) + n) % n;
    if (!disabled[at]) return at;
  }
  return -1;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Overrides the variant of the Tabs root: line (default), `pill` or `vertical`. */
  variant?: "pill" | "vertical";
  /** Counts in the triggers: adds `.oc-data-table-tabs` (the data table tab look). */
  counts?: boolean;
}

/** `.oc-tab-list[role=tablist]` of the compound Tabs. */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList({ variant, counts, className, onKeyDown, ...rest }, ref) {
  const ctx = useTabs("TabsList");
  const v = variant ?? ctx.variant;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const list = e.currentTarget;
    const all = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter((t) => t.closest('[role="tablist"]') === list);
    const at = all.indexOf(e.target as HTMLButtonElement);
    if (at < 0) return;
    const next = nextTabIndex(at, all.map((t) => t.disabled), e.key, v === "vertical");
    if (next < 0) return;
    e.preventDefault();
    all[next].focus();
    all[next].click();
  };
  return (
    <div
      ref={ref}
      className={cx("oc-tab-list", v && `oc-tab-list--${v}`, counts && "oc-data-table-tabs", className)}
      role="tablist"
      aria-orientation={v === "vertical" ? "vertical" : undefined}
      onKeyDown={onKey}
      {...rest}
    />
  );
});

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  /** Icon before the label: a webicon name ("mdi:domain") or any node. */
  icon?: ReactNode;
  /** Count after the label (`.oc-data-table-tab-count`); give the TabsList `counts` for the data table look. */
  count?: ReactNode;
  countTone?: "success" | "info" | "warning";
}

/** `button.oc-tab-trigger[role=tab]`: selects its value on click. */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, icon, count, countTone, className, children, onClick, ...rest },
  ref,
) {
  const ctx = useTabs("TabsTrigger");
  const on = ctx.value === value;
  return (
    <button
      ref={ref}
      className={cx("oc-tab-trigger", className)}
      type="button"
      role="tab"
      id={`${ctx.base}-tab-${idPart(value)}`}
      aria-selected={on}
      aria-controls={`${ctx.base}-${idPart(value)}`}
      tabIndex={on || !ctx.value ? 0 : -1}
      data-state={on ? "active" : "inactive"}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) { ctx.select(value); revealTab(e.currentTarget); }
      }}
      {...rest}
    >
      {icon != null && webiconNode(icon)}
      {children}
      {count != null && <span className={cx("oc-data-table-tab-count", countTone && `oc-data-table-tab-count--${countTone}`)}>{count}</span>}
    </button>
  );
});

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the content in the DOM while hidden (default true; the CSS hides inactive panels). `false`: only the active panel has content. */
  forceMount?: boolean;
}

/** `.oc-tab-panel[role=tabpanel]`; `.is-active` when its value is selected. */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ value, forceMount = true, className, children, ...rest }, ref) {
  const ctx = useTabs("TabsContent");
  const on = ctx.value === value;
  return (
    <div
      ref={ref}
      className={cx("oc-tab-panel", on && "is-active", className)}
      id={`${ctx.base}-${idPart(value)}`}
      role="tabpanel"
      aria-labelledby={`${ctx.base}-tab-${idPart(value)}`}
      tabIndex={0}
      data-state={on ? "active" : "inactive"}
      {...rest}
    >
      {(on || forceMount) && children}
    </div>
  );
});
