import { Children, cloneElement, forwardRef, isValidElement, useId } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "../utils";

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Error message (`oc-field-error`); also sets `aria-invalid` on the control. */
  error?: ReactNode;
  /** Horizontal layout (`oc-field--horizontal`). */
  horizontal?: boolean;
  /** Id of the control; generated when omitted. */
  htmlFor?: string;
  /** A single control (Input, Select, Textarea...) gets id / aria-describedby / aria-invalid injected. */
  children?: ReactNode;
}

/** `<div class="oc-field">` with label, control, description and error wired through ids. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { label, description, error, horizontal, htmlFor, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as ReactElement<Record<string, unknown>>) : null;
  const controlId = htmlFor ?? (only?.props.id as string | undefined) ?? `oc-field-${auto.replace(/:/g, "")}`;
  const helpId = description != null ? `${controlId}-help` : undefined;
  const errorId = error != null ? `${controlId}-error` : undefined;
  const describedBy = [only?.props["aria-describedby"] as string | undefined, helpId, errorId].filter(Boolean).join(" ") || undefined;

  const control = only
    ? cloneElement(only, {
        id: controlId,
        "aria-describedby": describedBy,
        ...(error != null ? { "aria-invalid": true } : {}),
      })
    : children;

  return (
    <div ref={ref} className={cx("oc-field", horizontal && "oc-field--horizontal", className)} {...rest}>
      {label != null && <label className="oc-field-label" htmlFor={controlId}>{label}</label>}
      {control}
      {description != null && <p className="oc-field-description" id={helpId}>{description}</p>}
      {error != null && <p className="oc-field-error" id={errorId} role="alert">{error}</p>}
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
