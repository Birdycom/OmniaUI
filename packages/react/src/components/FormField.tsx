// File: packages/react/src/components/FormField.tsx
// Map: props -> ids (control, help, error / errorKey) -> injected control props (id, aria-*, required, onValidate)
//      -> label row (label + required mark + tooltip + trailing) -> control -> description -> error -> FieldGroup
"use client";

import { Children, cloneElement, forwardRef, isValidElement, useId, useState } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Error message (`oc-field-error`); also sets `aria-invalid` on the control. */
  error?: ReactNode;
  /** Horizontal layout (`oc-field--horizontal`). */
  horizontal?: boolean;
  /** Id of the control; generated when omitted. */
  htmlFor?: string;
  /** Help behind an info icon after the label (`.oc-field-tooltip`): text, or any node for a rich tooltip. */
  tooltip?: ReactNode;
  /** Accessible name of the info icon (default "More information"). */
  tooltipLabel?: string;
  /** Required field: a mark after the label (`.oc-field-required`) and `required` + `aria-required` on the control. */
  required?: boolean;
  /** Content at the end of the label row (`.oc-field-label-trailing`): a link, a counter, a small button. */
  labelTrailing?: ReactNode;
  /** Key of the field in your error bag: `data-error-key` on the field and `<errorKey>-error` as the id of the error. */
  errorKey?: string;
  /** Keep the label for screen readers only (`oc-visually-hidden`). */
  hideLabel?: boolean;
  /** Compact bookkeeping look for label and control (`oc-field--ledger`). */
  variant?: "ledger";
  /** Module colour name: sets `data-module`. */
  module?: string;
  /** A single control (Input, Select, Textarea...) gets id / aria-describedby / aria-invalid injected. */
  children?: ReactNode;
}

/** `<div class="oc-field">` with label, control, description and error wired through ids. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  {
    label, description, error, horizontal, htmlFor, tooltip, tooltipLabel = "More information", required, labelTrailing, errorKey,
    hideLabel, variant, module, className, children, ...rest
  },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const [validation, setValidation] = useState<string | null>(null);
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as ReactElement<Record<string, unknown>>) : null;
  const controlId = htmlFor ?? (only?.props.id as string | undefined) ?? `oc-field-${auto}`;
  // The control's own validation message (Input validationType) shows when the field has no error of its own.
  const shownError = error ?? validation ?? undefined;
  const helpId = description != null ? `${controlId}-help` : undefined;
  const errorId = shownError != null ? `${errorKey ?? controlId}-error` : undefined;
  const tipId = tooltip != null ? `${controlId}-tip` : undefined;
  const describedBy = [only?.props["aria-describedby"] as string | undefined, helpId, errorId].filter(Boolean).join(" ") || undefined;

  const control = only
    ? cloneElement(only, {
        id: controlId,
        "aria-describedby": describedBy,
        ...(shownError != null ? { "aria-invalid": true } : {}),
        ...(required ? { required: true, "aria-required": true } : {}),
        ...(only.props.validationType
          ? {
              onValidate: (valid: boolean, value: string) => {
                setValidation(valid ? null : ((only.props.validationMessage as string | undefined) ?? "Invalid value"));
                (only.props.onValidate as ((v: boolean, s: string) => void) | undefined)?.(valid, value);
              },
            }
          : {}),
      })
    : children;

  const labelNode = label != null && (
    <label className={cx("oc-field-label", hideLabel && "oc-visually-hidden")} htmlFor={controlId}>
      {label}
      {required && <span className="oc-field-required" aria-hidden="true">*</span>}
    </label>
  );
  const tip = tooltip != null && (
    <span className="oc-tooltip oc-field-tooltip-wrap" data-tooltip={typeof tooltip === "string" ? tooltip : undefined}>
      <button type="button" className="oc-field-tooltip" aria-label={tooltipLabel} aria-describedby={tipId}>
        {webiconNode("mdi:information-outline")}
      </button>
      {typeof tooltip === "string"
        ? <span className="oc-visually-hidden" id={tipId}>{tooltip}</span>
        : <span className="oc-tooltip__content" role="tooltip" id={tipId}>{tooltip}</span>}
    </span>
  );
  const row = tip || labelTrailing != null;

  return (
    <div
      ref={ref}
      className={cx("oc-field", horizontal && "oc-field--horizontal", variant === "ledger" && "oc-field--ledger", className)}
      data-module={module}
      data-error-key={errorKey}
      {...rest}
    >
      {row ? (
        <div className="oc-field-label-row">
          {labelNode}
          {tip}
          {labelTrailing != null && <span className="oc-field-label-trailing">{labelTrailing}</span>}
        </div>
      ) : labelNode}
      {control}
      {description != null && <p className="oc-field-description" id={helpId}>{description}</p>}
      {shownError != null && <p className="oc-field-error" id={errorId} role="alert">{shownError}</p>}
    </div>
  );
});

/** `<div class="oc-field-group">`: stack (or `row`) of related controls. */
export const FieldGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { row?: boolean }>(function FieldGroup(
  { row, className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("oc-field-group", row && "oc-field-group--row", className)} {...rest} />;
});
