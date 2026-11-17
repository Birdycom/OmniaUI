"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  value: string;
  /** Accessible name of the read-only input. */
  label?: string;
  buttonLabel?: string;
  /** How long the `is-copied` feedback stays (ms). */
  feedbackMs?: number;
  onCopy?: (value: string) => void;
  /** Large centred code to read and type over (a join code, a voucher); "lg" for reading from a distance. */
  display?: boolean | "lg";
  /** Show the value in groups of n characters ("K7QM 2XPA"); the copy button still copies the raw value. */
  group?: number;
  /** A short line under the code, inside the frame (with `display`). */
  caption?: ReactNode;
}

/** "K7QM2XPA" in groups of 4: "K7QM 2XPA". */
export const groupCode = (value: string, size?: number) => (size && size > 0 ? value.match(new RegExp(`.{1,${size}}`, "gu"))?.join(" ") ?? value : value);

/** Read-only monospace value with a copy button (`is-copied` feedback for 2s). */
export const CopyField = forwardRef<HTMLDivElement, CopyFieldProps>(function CopyField(
  { value, label = "Value", buttonLabel = "Copy", feedbackMs = 2000, onCopy, display, group, caption, className, ...rest },
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
    <div ref={ref} className={cx("oc-copy-field", display && "oc-copy-field--display", display === "lg" && "oc-copy-field--lg", className)} style={display ? ({ "--oc-copy-chars": groupCode(value, group).length, ...rest.style } as CSSProperties) : rest.style} {...rest}>
      <input className="oc-copy-field-value" type="text" readOnly value={groupCode(value, group)} aria-label={label} />
      <button className={cx("oc-copy-field-button", copied && "is-copied")} type="button" onClick={copy} data-copy={group ? value : undefined}>{buttonLabel}</button>
      {caption != null && <p className="oc-copy-field-caption">{caption}</p>}
    </div>
  );
});
