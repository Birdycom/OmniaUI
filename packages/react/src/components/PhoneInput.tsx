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
  /** 0.18.0: how the national digits are grouped, one # per digit ("### ## ## ##" -> 470 12 34 56). */
  format?: string;
  /** 0.18.0: the same as group sizes ([3, 2, 2, 2]); wins over `format`. */
  groups?: number[];
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
  /** Controlled dial code ("+31"); wins over the code in the value. */
  dial?: string;
  /** Called with the new dial code when the country changes. */
  onDialChange?: (dial: string) => void;
  /** Form name of the dial code select (e.g. "phone_dial"), for a plain form post. */
  dialName?: string;
}

/** 0.18.0: the default countries with the usual national grouping (BE 470 12 34 56, NL/FR 6 12 34 56 78, DE 151 2345 6789). */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { dial: "+32", label: "BE +32", format: "### ## ## ##" },
  { dial: "+31", label: "NL +31", format: "# ## ## ## ##" },
  { dial: "+33", label: "FR +33", format: "# ## ## ## ##" },
  { dial: "+49", label: "DE +49", format: "### #### ####" },
];
const DEFAULT_COUNTRIES = PHONE_COUNTRIES;

/** Group sizes of a country: `groups`, else the # runs of `format` ("### ## ##" -> [3, 2, 2]), else none. */
export function phoneGroups(country?: Pick<PhoneCountry, "format" | "groups">): number[] {
  if (country?.groups?.length) return country.groups.filter((n) => n > 0);
  return (country?.format?.match(/#+/g) ?? []).map((run) => run.length);
}

/**
 * "470123456" -> "470 12 34 56". Without a country (or one without format/groups): a group of 3, then pairs (readable for
 * most European numbers). 0.18.0: with a country, its `format` / `groups`; digits beyond the pattern follow in pairs.
 */
export function formatPhoneNational(digits: string, country?: Pick<PhoneCountry, "format" | "groups">): string {
  const clean = digits.replace(/\D/g, "");
  const sizes = phoneGroups(country);
  const parts: string[] = [];
  let at = 0;
  for (const size of sizes.length ? sizes : [3]) {
    if (at >= clean.length) break;
    parts.push(clean.slice(at, at + size));
    at += size;
  }
  parts.push(...(clean.slice(at).match(/.{1,2}/g) ?? []));
  return parts.filter(Boolean).join(" ");
}

/** Split "+32470..." into the known dial code (longest match) and the national digits. */
export function splitPhone(full: string, countries: PhoneCountry[]) {
  const match = [...countries].sort((a, b) => b.dial.length - a.dial.length).find((c) => full.startsWith(c.dial));
  return match ? { dial: match.dial, national: full.slice(match.dial.length) } : { dial: "", national: full.replace(/^\+/, "") };
}

/** `.oc-phone-input`: country dial code + national number. Emits one value: dial + digits. */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, defaultValue, onChange, countries = DEFAULT_COUNTRIES, defaultDial, size = "md", error, dialLabel = "Country code", dial: dialProp, onDialChange, dialName, className, disabled, ...rest },
  ref,
) {
  const [full, setFull] = useControllable<string>(value, defaultValue ?? "", onChange);
  const parsed = splitPhone(full, countries);
  // Remember the chosen dial code, also while the number is still empty.
  const [dialState, setDialState] = useState(dialProp || parsed.dial || defaultDial || countries[0]?.dial || "");
  const dial = dialProp || parsed.dial || dialState;

  const emit = (nextDial: string, national: string) => {
    setDialState(nextDial);
    if (nextDial !== dial) onDialChange?.(nextDial);
    const digits = national.replace(/\D/g, "");
    setFull(digits ? nextDial + digits : "");
  };

  return (
    <div className={cx("oc-phone-input", size === "sm" && "oc-phone-input--sm", error && "oc-phone-input--error", className)}>
      <select className="oc-phone-input-dial" name={dialName} aria-label={dialLabel} value={dial} disabled={disabled} onChange={(e) => emit(e.target.value, parsed.national)}>
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
        value={formatPhoneNational(parsed.national, countries.find((c) => c.dial === dial))}
        onChange={(e) => emit(dial, e.target.value)}
        {...rest}
      />
    </div>
  );
});
