// File: packages/react/src/components/TimeInput.tsx
// Map: helper (digits -> HH:mm) -> component (text field + datalist of slots)
// Same markup as packages/ui/snippets/time-input.html. JS only adds the colon while typing ("0930" -> "09:30").
"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "list"> {
  /** "HH:mm" or "" (empty). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Suggested times shown by the browser while typing (datalist). */
  slots?: string[];
  error?: boolean;
}

/** Keep up to 4 digits and put a colon after the first two: "0930" -> "09:30". Short input is completed on blur. */
export function formatTime24h(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** On blur: "9" -> "09:00", "930" -> "09:30". Leaves other text alone (pattern marks it invalid). */
function completeTime(text: string): string {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 1 || digits.length === 2) return `${digits.padStart(2, "0")}:00`;
  if (digits.length === 3) return `0${digits[0]}:${digits.slice(1)}`;
  return text;
}

/** `.oc-time-input`: 24h text field (pattern HH:mm) with optional datalist suggestions. */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(
  { value, defaultValue, onChange, slots, error, className, onBlur, placeholder = "hh:mm", ...rest },
  ref,
) {
  const listId = `oc-time-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? "", onChange);
  return (
    <>
      <input
        ref={ref}
        className={cx("oc-input", "oc-time-input", className)}
        type="text"
        inputMode="numeric"
        maxLength={5}
        pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
        placeholder={placeholder}
        list={slots?.length ? listId : undefined}
        aria-invalid={error ? true : undefined}
        value={current}
        onChange={(e) => {
          // A picked datalist option already has the colon; typed digits get one.
          const v = e.target.value;
          setCurrent(/^\d{2}:\d{2}$/.test(v) ? v : formatTime24h(v));
        }}
        onBlur={(e) => {
          const done = completeTime(current);
          if (done !== current) setCurrent(done);
          onBlur?.(e);
        }}
        {...rest}
      />
      {slots?.length ? (
        <datalist id={listId}>
          {slots.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      ) : null}
    </>
  );
});
