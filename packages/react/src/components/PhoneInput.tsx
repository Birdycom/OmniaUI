// File: packages/react/src/components/PhoneInput.tsx
// Map: types -> helpers (split value, group digits) -> component (dial select + tel input)
// Same markup as packages/ui/snippets/phone-input.html. The only JS: digit grouping and joining dial + number.
"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface PhoneCountry {
  /** Dial code with plus sign, e.g. "+32". */
  dial: string;
  /** Text in the select, e.g. "BE +32". */
  label: string;
}

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
  /** Full value without spaces, e.g. "+32470123456" (empty string = no number). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  countries?: PhoneCountry[];
  /** Dial code used while the value is empty. */
  defaultDial?: string;
  size?: "sm" | "md";
  error?: boolean;
  /** Accessible name of the dial code select. */
  dialLabel?: string;
}

const DEFAULT_COUNTRIES: PhoneCountry[] = [
  { dial: "+32", label: "BE +32" },
  { dial: "+31", label: "NL +31" },
  { dial: "+33", label: "FR +33" },
  { dial: "+49", label: "DE +49" },
];

/** "470123456" -> "470 12 34 56": a group of 3, then pairs (readable for most European numbers). */
export function formatPhoneNational(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  const head = clean.slice(0, 3);
  const pairs = clean.slice(3).match(/.{1,2}/g) ?? [];
  return [head, ...pairs].filter(Boolean).join(" ");
}

/** Split "+32470..." into the known dial code (longest match) and the national digits. */
function splitPhone(full: string, countries: PhoneCountry[]) {
  const match = [...countries].sort((a, b) => b.dial.length - a.dial.length).find((c) => full.startsWith(c.dial));
  return match ? { dial: match.dial, national: full.slice(match.dial.length) } : { dial: "", national: full.replace(/^\+/, "") };
}

/** `.oc-phone-input`: country dial code + national number. Emits one value: dial + digits. */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, defaultValue, onChange, countries = DEFAULT_COUNTRIES, defaultDial, size = "md", error, dialLabel = "Country code", className, disabled, ...rest },
  ref,
) {
  const [full, setFull] = useControllable<string>(value, defaultValue ?? "", onChange);
  const parsed = splitPhone(full, countries);
  // Remember the chosen dial code, also while the number is still empty.
  const [dialState, setDialState] = useState(parsed.dial || defaultDial || countries[0]?.dial || "");
  const dial = parsed.dial || dialState;

  const emit = (nextDial: string, national: string) => {
    setDialState(nextDial);
    const digits = national.replace(/\D/g, "");
    setFull(digits ? nextDial + digits : "");
  };

  return (
    <div className={cx("oc-phone-input", size === "sm" && "oc-phone-input--sm", error && "oc-phone-input--error", className)}>
      <select className="oc-phone-input-dial" aria-label={dialLabel} value={dial} disabled={disabled} onChange={(e) => emit(e.target.value, parsed.national)}>
        {countries.map((c) => (
          <option key={c.dial} value={c.dial}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        ref={ref}
        className="oc-phone-input-number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        value={formatPhoneNational(parsed.national)}
        onChange={(e) => emit(dial, e.target.value)}
        {...rest}
      />
    </div>
  );
});
