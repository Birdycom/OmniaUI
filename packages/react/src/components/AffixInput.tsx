// File: packages/react/src/components/AffixInput.tsx
// Map: variant presets (currency / percent / email) -> component (input group --affix with inline symbol)
// Same markup as packages/ui/snippets/affix-input.html. No state: a plain input with a symbol inside the frame.
import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type AffixInputVariant = "currency" | "percent" | "email";

export interface AffixInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Preset: symbol, input type, inputmode and alignment. */
  variant?: AffixInputVariant;
  /** Symbol before the value (overrides the preset). */
  prefix?: ReactNode;
  /** Symbol after the value (overrides the preset). */
  suffix?: ReactNode;
  /** Right-aligned tabular digits. Off by default: the value sits next to the symbol column. */
  alignEnd?: boolean;
  error?: boolean;
  /** Class for the wrapper (`className` goes to the input). */
  groupClassName?: string;
}

// Preset per variant. Email uses type="email" so :user-invalid checks the address.
const PRESETS: Record<AffixInputVariant, { prefix?: string; suffix?: string; end: boolean; input: InputHTMLAttributes<HTMLInputElement> }> = {
  currency: { prefix: "\u20AC", end: false, input: { type: "text", inputMode: "decimal" } },
  percent: { prefix: "%", end: false, input: { type: "text", inputMode: "decimal" } },
  email: { prefix: "@", end: false, input: { type: "email", autoComplete: "email" } },
};

/** `.oc-input-group.oc-input-group--affix`: symbol (€, %, @) inside the field. */
export const AffixInput = forwardRef<HTMLInputElement, AffixInputProps>(function AffixInput(
  { variant, prefix, suffix, alignEnd, error, groupClassName, className, ...rest },
  ref,
) {
  const preset = variant ? PRESETS[variant] : undefined;
  const before = prefix ?? preset?.prefix;
  const after = suffix ?? preset?.suffix;
  const end = alignEnd ?? preset?.end ?? false;
  return (
    <div className={cx("oc-input-group", "oc-input-group--affix", end && "oc-input-group--end", error && "oc-input-group--error", groupClassName)}>
      {before != null && <span className="oc-input-addon" aria-hidden="true">{before}</span>}
      <input ref={ref} className={cx("oc-input", className)} aria-invalid={error ? true : undefined} {...preset?.input} {...rest} />
      {after != null && <span className="oc-input-addon" aria-hidden="true">{after}</span>}
    </div>
  );
});
