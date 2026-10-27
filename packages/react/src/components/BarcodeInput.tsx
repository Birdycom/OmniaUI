// File: packages/react/src/components/BarcodeInput.tsx
// Map: props -> component (label, digits-only field, preview figure with placeholder bars or your own graphic)
// Same markup as packages/ui/snippets/barcode-input.html. No barcode drawing: pass your own <svg>/<canvas> as children.
"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface BarcodeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "children"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible label above the field. */
  label?: ReactNode;
  /** Text in the preview while the field is empty. */
  emptyText?: string;
  error?: boolean;
  /** Your own barcode graphic; replaces the placeholder bars. */
  children?: ReactNode;
  /** Class for the wrapper (`className` goes to the input). */
  wrapperClassName?: string;
}

/** `.oc-barcode-input`: code field + preview. Keeps digits only (hand scanners type like a keyboard). */
export const BarcodeInput = forwardRef<HTMLInputElement, BarcodeInputProps>(function BarcodeInput(
  { value, defaultValue, onChange, label, emptyText = "No code yet", error, children, wrapperClassName, className, id, ...rest },
  ref,
) {
  const auto = `oc-barcode-${useId().replace(/:/g, "")}`;
  const inputId = id ?? auto;
  const [code, setCode] = useControllable<string>(value, defaultValue ?? "", onChange);
  const empty = !code;
  return (
    <div className={cx("oc-barcode-input", wrapperClassName)}>
      {label != null && <label className="oc-field-label" htmlFor={inputId}>{label}</label>}
      <div className="oc-input-group oc-input-group--affix">
        <span className="oc-input-addon" aria-hidden="true">
          <svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 1h1.4v14H1zm2.2 0h.7v14h-.7zm1.6 0h1.5v14H4.8zm2.4 0h.7v14H7.2zm1.6 0h.7v14H8.8zm1.5 0h1.4v14h-1.4zm2.2 0H15v14h-.9z" /></svg>
        </span>
        <input
          ref={ref}
          id={inputId}
          className={cx("oc-input", "oc-barcode-input-field", className)}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={80}
          placeholder="EAN-13 or internal code"
          aria-invalid={error ? true : undefined}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          {...rest}
        />
      </div>
      <figure className={cx("oc-barcode-preview", empty && "oc-barcode-preview--empty")} aria-label="Barcode preview">
        {children ?? <div className="oc-barcode-preview-bars" aria-hidden="true" />}
        <figcaption className="oc-barcode-preview-code">{empty ? emptyText : code}</figcaption>
      </figure>
    </div>
  );
});
