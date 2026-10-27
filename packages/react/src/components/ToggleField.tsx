// File: packages/react/src/components/ToggleField.tsx
// Map: props -> component (label row: text block + span.oc-switch with checkbox)
// Same markup as packages/ui/snippets/toggle-field.html. Works controlled (checked) or uncontrolled.
"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ToggleFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> {
  label: ReactNode;
  description?: ReactNode;
  /** Bordered box. */
  card?: boolean;
  /** Switch first, text after it. */
  reverse?: boolean;
  /** Class for the row (`className` goes to the input). */
  fieldClassName?: string;
}

/** `.oc-toggle-field`: the whole row is the label, so clicking the text flips the switch. */
export const ToggleField = forwardRef<HTMLInputElement, ToggleFieldProps>(function ToggleField(
  { label, description, card, reverse, fieldClassName, className, ...rest },
  ref,
) {
  const descId = `oc-toggle-field-${useId().replace(/:/g, "")}`;
  return (
    <label className={cx("oc-toggle-field", card && "oc-toggle-field--card", reverse && "oc-toggle-field--reverse", fieldClassName)}>
      <span className="oc-toggle-field-text">
        <span className="oc-toggle-field-label">{label}</span>
        {description != null && <span className="oc-toggle-field-description" id={descId}>{description}</span>}
      </span>
      <span className="oc-switch">
        <input ref={ref} type="checkbox" role="switch" className={className} aria-describedby={description != null ? descId : undefined} {...rest} />
        <span className="oc-switch-track" />
      </span>
    </label>
  );
});
