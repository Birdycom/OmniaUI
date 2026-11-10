"use client";

import { createElement, forwardRef, useId } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export type ThemeMode = "system" | "light" | "dark";

const LABELS: Record<ThemeMode, string> = { system: "System", light: "Light", dark: "Dark" };
const ICONS: Record<ThemeMode, string> = { system: "mdi:monitor", light: "mdi:white-balance-sunny", dark: "mdi:weather-night" };

export interface ThemeSwitchProps extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  value?: ThemeMode;
  defaultValue?: ThemeMode;
  onChange?: (mode: ThemeMode) => void;
  /** Which modes to offer (default all three). */
  modes?: ThemeMode[];
  /** Radio group name (generated when omitted). */
  name?: string;
  /** Render a `div role="radiogroup"` (compact app bars) instead of a `fieldset`. */
  as?: "fieldset" | "div";
  /** Monitor / sun / moon webicons (`<iconify-icon>`): `true` shows only the icons (`--icons`, text for screen readers
   *  and as tooltip), `"text"` shows icon and text. */
  icons?: boolean | "text";
}

/**
 * `.oc-theme-switch` radio group. The CSS applies `color-scheme` through `:has()`,
 * so no state is needed; `onChange` lets you persist the choice.
 */
export const ThemeSwitch = forwardRef<HTMLElement, ThemeSwitchProps>(function ThemeSwitch(
  { value, defaultValue = "system", onChange, modes = ["system", "light", "dark"], name, as = "fieldset", icons = false, className, "aria-label": ariaLabel = "Color theme", ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-theme-${auto.replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<ThemeMode>(value, defaultValue, onChange);
  const iconOnly = icons === true;
  const items = modes.map((m) => (
    <label key={m} title={iconOnly ? LABELS[m] : undefined}>
      <input type="radio" name={group} value={m} checked={current === m} onChange={() => setCurrent(m)} />
      {icons ? createElement("iconify-icon", { icon: ICONS[m], "aria-hidden": "true" }) : null}
      {iconOnly ? <span className="oc-theme-switch__text">{LABELS[m]}</span> : <> {LABELS[m]}</>}
    </label>
  ));
  const classes = cx("oc-theme-switch", iconOnly && "oc-theme-switch--icons", className);
  return as === "div" ? (
    <div ref={ref as React.Ref<HTMLDivElement>} className={classes} role="radiogroup" aria-label={ariaLabel} {...rest}>{items}</div>
  ) : (
    <fieldset ref={ref as React.Ref<HTMLFieldSetElement>} className={classes} aria-label={ariaLabel} {...rest}>{items}</fieldset>
  );
});
