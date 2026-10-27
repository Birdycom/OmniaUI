"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  value: string;
  /** Accessible name of the read-only input. */
  label?: string;
  buttonLabel?: string;
  /** How long the `is-copied` feedback stays (ms). */
  feedbackMs?: number;
  onCopy?: (value: string) => void;
}

/** Read-only monospace value with a copy button (`is-copied` feedback for 2s). */
export const CopyField = forwardRef<HTMLDivElement, CopyFieldProps>(function CopyField(
  { value, label = "Value", buttonLabel = "Copy", feedbackMs = 2000, onCopy, className, ...rest },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    onCopy?.(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), feedbackMs);
  };

  return (
    <div ref={ref} className={cx("oc-copy-field", className)} {...rest}>
      <input className="oc-copy-field-value" type="text" readOnly value={value} aria-label={label} />
      <button className={cx("oc-copy-field-button", copied && "is-copied")} type="button" onClick={copy}>{buttonLabel}</button>
    </div>
  );
});
