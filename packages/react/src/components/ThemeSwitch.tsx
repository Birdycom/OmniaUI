"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export type ThemeMode = "system" | "light" | "dark";

const LABELS: Record<ThemeMode, string> = { system: "System", light: "Light", dark: "Dark" };

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
}

/**
 * `.oc-theme-switch` radio group. The CSS applies `color-scheme` through `:has()`,
 * so no state is needed; `onChange` lets you persist the choice.
 */
export const ThemeSwitch = forwardRef<HTMLElement, ThemeSwitchProps>(function ThemeSwitch(
  { value, defaultValue = "system", onChange, modes = ["system", "light", "dark"], name, as = "fieldset", className, "aria-label": ariaLabel = "Color theme", ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-theme-${auto.replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<ThemeMode>(value, defaultValue, onChange);
  const items = modes.map((m) => (
    <label key={m}>
      <input type="radio" name={group} value={m} checked={current === m} onChange={() => setCurrent(m)} /> {LABELS[m]}
    </label>
  ));
  return as === "div" ? (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cx("oc-theme-switch", className)} role="radiogroup" aria-label={ariaLabel} {...rest}>{items}</div>
  ) : (
    <fieldset ref={ref as React.Ref<HTMLFieldSetElement>} className={cx("oc-theme-switch", className)} aria-label={ariaLabel} {...rest}>{items}</fieldset>
  );
});
