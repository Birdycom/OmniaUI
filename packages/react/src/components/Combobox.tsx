// File: packages/react/src/components/Combobox.tsx
// Map: types -> icon helper -> Combobox (state: text, open, active) -> keyboard -> markup (.oc-combobox, optional icons)
// Same markup as packages/ui/snippets/combobox.html: an input with a listbox. Typing filters, the arrow keys move the
// active option, Enter or a click chooses, Escape closes. With icons: an icon in front of every option and in front of the
// chosen value in the field; options without an icon line up with the others (CSS).
"use client";

import { createElement, forwardRef, useId, useMemo, useState } from "react";
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Icon in front of the label: a webicon name ("mdi:github", "flag:nl-4x3") or any node (an <svg>, an <img>). */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name of the field and the list (default "Choose"). */
  label?: string;
  /** Icon in the field while nothing is chosen (only drawn when the options have icons or this is set). */
  icon?: ReactNode;
  /** Text when nothing matches (default "No results"). */
  emptyText?: ReactNode;
  /** Class for the wrapper (`className` goes to the input). */
  wrapperClassName?: string;
}

/** A webicon name becomes an <iconify-icon>; anything else is drawn as it is. */
export function renderIcon(icon: ReactNode): ReactNode {
  return typeof icon === "string" && icon.includes(":") ? createElement("iconify-icon", { icon, "aria-hidden": "true" }) : icon;
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** `.oc-combobox`: a field with a filtered list of options, optionally with an icon per option. */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { options, value, defaultValue, onChange, label = "Choose", icon, emptyText = "No results", wrapperClassName, className, name, placeholder, id, ...rest },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const listId = `oc-combobox-${auto}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? "", onChange);
  const chosen = options.find((o) => o.value === current);
  const [text, setText] = useState<string | null>(null); // null = not typing: the field shows the chosen label
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const shown = useMemo(() => (text ? options.filter((o) => fold(o.label).includes(fold(text).trim())) : options), [options, text]);
  const enabled = shown.filter((o) => !o.disabled);
  const withIcons = icon != null || options.some((o) => o.icon != null);
  const optionId = (v: string) => `${listId}-${options.findIndex((o) => o.value === v)}`;

  const choose = (o?: ComboboxOption) => {
    if (!o || o.disabled) return;
    setCurrent(o.value);
    setText(null);
    setOpen(false);
    setActive(null);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    rest.onKeyDown?.(e);
    const at = enabled.findIndex((o) => o.value === active);
    const move = (i: number) => { e.preventDefault(); setOpen(true); setActive(enabled[(i + enabled.length) % enabled.length]?.value ?? null); };
    if (e.key === "ArrowDown") move(open ? at + 1 : Math.max(at, 0));
    else if (e.key === "ArrowUp") move(at <= 0 ? enabled.length - 1 : at - 1);
    else if (e.key === "Home" && open) move(0);
    else if (e.key === "End" && open) move(enabled.length - 1);
    else if (e.key === "Enter" && open && at >= 0) { e.preventDefault(); choose(enabled[at]); }
    else if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); setText(null); }
  };

  return (
    <div className={cx("oc-combobox", wrapperClassName)} data-open={open ? "" : "false"}>
      {withIcons && <span className="oc-combobox-icon" aria-hidden="true">{renderIcon(chosen?.icon ?? icon)}</span>}
      <input
        ref={ref}
        id={id}
        className={cx("oc-input oc-combobox-input", className)}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active != null ? optionId(active) : undefined}
        aria-label={label}
        placeholder={placeholder}
        value={text ?? chosen?.label ?? ""}
        {...rest}
        onChange={(e) => { setText(e.target.value); setOpen(true); const first = options.find((o) => !o.disabled && fold(o.label).includes(fold(e.target.value).trim())); setActive(first?.value ?? null); }}
        onKeyDown={onKeyDown}
        onFocus={(e) => { rest.onFocus?.(e); setOpen(true); }}
        onClick={(e) => { rest.onClick?.(e); setOpen(true); }}
        onBlur={(e) => { rest.onBlur?.(e); setOpen(false); setText(null); setActive(null); }}
      />
      {name != null && <input type="hidden" name={name} value={current} />}
      <ul className="oc-combobox-list" id={listId} role="listbox" aria-label={label}>
        {shown.map((o) => (
          <li
            key={o.value}
            id={optionId(o.value)}
            className="oc-combobox-option"
            role="option"
            tabIndex={-1}
            aria-selected={o.value === current}
            aria-disabled={o.disabled || undefined}
            data-active={o.value === active ? "" : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(o)}
          >
            {o.icon != null && <span className="oc-combobox-option-icon" aria-hidden="true">{renderIcon(o.icon)}</span>}
            {o.label}
          </li>
        ))}
        {shown.length === 0 && <li className="oc-combobox-empty" role="presentation">{emptyText}</li>}
      </ul>
    </div>
  );
});
