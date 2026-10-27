"use client";

import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface ColorFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Hex value, e.g. `#3366cc` (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Id of the text input (so a <label for> can point at it). */
  id?: string;
  name?: string;
  disabled?: boolean;
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Native color picker + monospaced hex text input, kept in sync. */
export const ColorField = forwardRef<HTMLDivElement, ColorFieldProps>(function ColorField(
  { value, defaultValue = "#000000", onChange, id, name, disabled, className, ...rest },
  ref,
) {
  const [color, setColor] = useControllable<string>(value, defaultValue, onChange);
  const [lastValid, setLastValid] = useState(HEX.test(color) ? color : "#000000");
  const picker = HEX.test(color) ? color : lastValid;
  const update = (next: string) => {
    if (HEX.test(next)) setLastValid(next);
    setColor(next);
  };
  return (
    <div ref={ref} className={cx("oc-color-field", className)} {...rest}>
      <input type="color" aria-label="Pick a color" value={picker} disabled={disabled} onChange={(e) => update(e.target.value)} />
      <input
        className="oc-input"
        type="text"
        id={id}
        name={name}
        aria-label="Color value"
        value={color}
        disabled={disabled}
        onChange={(e) => update(e.target.value)}
      />
    </div>
  );
});
