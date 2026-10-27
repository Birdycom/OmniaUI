// File: packages/react/src/components/ColorSelect.tsx
// Map: types -> component (fieldset radiogroup -> one label per color: radio + swatch + name)
// Same markup as packages/ui/snippets/color-select.html.
"use client";

import { forwardRef, useId } from "react";
import type { CSSProperties, FieldsetHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface ColorSelectOption {
  value: string;
  label: string;
  /** CSS color, use Omnia tokens: "var(--color-red-70)". */
  color: string;
  disabled?: boolean;
}

export interface ColorSelectProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  options: ColorSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Radio group name (generated when omitted). */
  name?: string;
  /** Rows with visible names instead of a swatch grid. */
  list?: boolean;
  size?: "sm" | "md";
}

/** `.oc-color-select`: radio swatches; the color is passed through the --oc-swatch variable. */
export const ColorSelect = forwardRef<HTMLFieldSetElement, ColorSelectProps>(function ColorSelect(
  { options, value, defaultValue, onChange, name, list, size = "md", className, ...rest },
  ref,
) {
  const group = name ?? `oc-color-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? "", onChange);
  return (
    <fieldset ref={ref} className={cx("oc-color-select", list && "oc-color-select--list", size === "sm" && "oc-color-select--sm", className)} role="radiogroup" {...rest}>
      {options.map((o) => (
        <label key={o.value} className="oc-color-select-option" style={{ "--oc-swatch": o.color } as CSSProperties}>
          <input type="radio" name={group} value={o.value} disabled={o.disabled} checked={current === o.value} onChange={() => setCurrent(o.value)} />
          <span className="oc-color-select-swatch" />
          <span className="oc-color-select-name">{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
});
