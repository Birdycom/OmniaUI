// Same markup as packages/ui/snippets/toggle.html.
"use client";

import { createContext, forwardRef, useContext, useId } from "react";
import type { CSSProperties, HTMLAttributes, InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

interface ToggleGroupState {
  values: string[];
  type: "single" | "multiple";
  name: string;
  toggle: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupState | null>(null);

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value"> {
  /** Value inside a ToggleGroup (then the group decides whether it is pressed). */
  value?: string;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  /** Square, icon-only toggle (`oc-toggle--icon`); give it an aria-label. */
  icon?: boolean;
  /** A `<button aria-pressed>` instead of a label + checkbox (standalone only). */
  button?: boolean;
  /** Pressed state, standalone. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Class of the root (`className` too); `style` also goes to the root, other props to the input or button. */
  labelClassName?: string;
}

/**
 * Toggle (`.oc-toggle`, `--outline/--sm/--lg/--icon`). Inside a ToggleGroup (give it a `value`) it is a label around a
 * radio or checkbox; standalone a label + checkbox, or with `button` a `<button aria-pressed>`.
 */
export const Toggle = forwardRef<HTMLInputElement | HTMLButtonElement, ToggleProps>(function Toggle(
  { value, variant, size, icon, button, pressed, defaultPressed, onPressedChange, disabled, className, labelClassName, style, children, onChange, ...rest },
  ref,
) {
  const group = useContext(ToggleGroupContext);
  const [on, setOn] = useControllable<boolean>(pressed, defaultPressed ?? false, onPressedChange);
  const inGroup = !!group && value !== undefined;
  const isOn = inGroup ? group.values.includes(value) : on;
  const classes = cx("oc-toggle", variant === "outline" && "oc-toggle--outline", size && size !== "md" && `oc-toggle--${size}`, icon && "oc-toggle--icon", labelClassName, className);
  if (button && !inGroup) {
    const { name: _name, checked: _checked, ...buttonRest } = rest;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        style={style}
        aria-pressed={on ? "true" : "false"}
        disabled={disabled}
        {...(buttonRest as HTMLAttributes<HTMLButtonElement>)}
        onClick={() => setOn(!on)}
      >
        {children}
      </button>
    );
  }
  return (
    <label className={classes} style={style as CSSProperties | undefined}>
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        {...rest}
        type={inGroup && group.type === "single" ? "radio" : "checkbox"}
        name={inGroup ? group.name : rest.name}
        value={value}
        checked={isOn}
        disabled={disabled}
        onChange={(e) => {
          onChange?.(e);
          if (inGroup) group.toggle(value);
          else setOn(!on);
        }}
      />
      {children}
    </label>
  );
});

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** "multiple" (default): checkboxes, value is an array. "single": radios, value is one string. */
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** Gaps between the toggles (`oc-toggle-group--spaced`). */
  spaced?: boolean;
  /** Accessible name (aria-label). */
  label?: string;
  /** Name of the inputs (default a generated one). */
  name?: string;
}

/** Connected toggles (`.oc-toggle-group`). Put `<Toggle value="...">` items inside. */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { type = "multiple", value, defaultValue, onValueChange, spaced, label, name, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const [current, setCurrent] = useControllable<string | string[] | undefined>(value, defaultValue, onValueChange as (v: string | string[] | undefined) => void);
  const values = Array.isArray(current) ? current : current ? [current] : [];
  const toggle = (v: string) => {
    if (type === "single") setCurrent(v);
    else setCurrent(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };
  return (
    <ToggleGroupContext.Provider value={{ values, type, name: name ?? `oc-toggle-${auto.replace(/:/g, "")}`, toggle }}>
      <div
        ref={ref}
        className={cx("oc-toggle-group", spaced && "oc-toggle-group--spaced", className)}
        role={type === "single" ? "radiogroup" : "group"}
        aria-label={label}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
});
