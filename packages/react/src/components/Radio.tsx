// Same markup as packages/ui/snippets/radio.html.
"use client";

import { createContext, forwardRef, useContext, useId } from "react";
import type { CSSProperties, FieldsetHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

interface RadioGroupState {
  value: string | number | undefined;
  setValue: (value: string | number) => void;
  name: string;
  card: boolean;
}

const RadioGroupContext = createContext<RadioGroupState | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  value: string | number;
  /** Muted second line; makes the item a bordered card. */
  description?: ReactNode;
  /** Bordered card form (`oc-radio-item--card`). */
  card?: boolean;
  /** Class of the label around the radio (`className` goes there too); `style` also goes to the label. */
  labelClassName?: string;
}

/**
 * One radio in a label (`.oc-radio-item` > `input.oc-radio`). Inside a RadioGroup it reads and writes the group's
 * value; standalone it is a plain native radio (give it a `name`, `checked` or `defaultChecked`).
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, description, card, labelClassName, className, style, children, onChange, checked, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const isCard = card || !!group?.card || description != null;
  const own = group ? { name: group.name, checked: group.value === value } : checked !== undefined ? { checked } : {};
  return (
    <label className={cx("oc-radio-item", isCard && "oc-radio-item--card", labelClassName, className)} style={style as CSSProperties | undefined}>
      <input
        ref={ref}
        className="oc-radio"
        type="radio"
        value={value}
        {...rest}
        {...own}
        onChange={(e) => {
          onChange?.(e);
          group?.setValue(value);
        }}
      />
      {description != null ? <span>{children}<small>{description}</small></span> : children}
    </label>
  );
});

export interface RadioOption {
  value: string | number;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string | number) => void;
  /** Heading of the group (`<legend class="oc-label">`). */
  legend?: ReactNode;
  /** Items from data; or put `<Radio>` children inside. */
  options?: RadioOption[];
  /** Name of the radios (default a generated one). */
  name?: string;
  /** Lay the items out horizontally (`oc-radio-group--row`). */
  row?: boolean;
  /** Bordered card items. */
  card?: boolean;
}

/** Radio group on a fieldset (`.oc-radio-group`, `--row`). */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  { value, defaultValue, onValueChange, legend, options, name, row, card, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const [current, setCurrent] = useControllable<string | number | undefined>(value, defaultValue, onValueChange as (v: string | number | undefined) => void);
  return (
    <RadioGroupContext.Provider value={{ value: current, setValue: setCurrent, name: name ?? `oc-radio-${auto.replace(/:/g, "")}`, card: !!card }}>
      <fieldset ref={ref} className={cx("oc-radio-group", row && "oc-radio-group--row", className)} {...rest}>
        {legend != null && <legend className="oc-label">{legend}</legend>}
        {children ?? options?.map((o) => (
          <Radio key={o.value} value={o.value} disabled={o.disabled} description={o.description}>{o.label}</Radio>
        ))}
      </fieldset>
    </RadioGroupContext.Provider>
  );
});
