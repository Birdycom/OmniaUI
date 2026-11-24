"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  value: string;
  /** Accessible name of the read-only value (default "Value"). Same as `ariaLabel`. */
  label?: string;
  /** Accessible name of the value when there is no visible label; wins over `label`. Translate it ("Waarde"). */
  ariaLabel?: string;
  buttonLabel?: string;
  /** Feedback on the button and in a live region after copying (default "Copied"). */
  copiedLabel?: string;
  /** How long the `is-copied` feedback stays (ms). */
  feedbackMs?: number;
  onCopy?: (value: string) => void;
  /** Large centred code to read and type over (a join code, a voucher); "lg" for reading from a distance. */
  display?: boolean | "lg";
  /** Show the value in groups of n characters ("K7QM 2XPA"); the copy button still copies the raw value. */
  group?: number;
  /** A short line under the code, inside the frame (with `display`). */
  caption?: ReactNode;
  /** A secret (API key, setup key): shown as dots with a show/hide toggle (aria-pressed); copy still copies the value. */
  masked?: boolean;
  /** Accessible name of the show/hide toggle (default "Show value"). */
  revealLabel?: string;
  /** Long values (a token, a URL) break over lines instead of ending in an ellipsis. Not with `masked`. */
  wrap?: boolean;
  /** The copy icon (mdi:content-copy) on the button. Default true. */
  icon?: boolean;
  /** 0.18.0: the field stretches with a narrow column and may shrink below its content (`oc-copy-field--block`). */
  block?: boolean;
}

/** "K7QM2XPA" in groups of 4: "K7QM 2XPA". */
export const groupCode = (value: string, size?: number) => (size && size > 0 ? value.match(new RegExp(`.{1,${size}}`, "gu"))?.join(" ") ?? value : value);

/** Read-only monospace value with a copy button (`is-copied` feedback for 2s). */
export const CopyField = forwardRef<HTMLDivElement, CopyFieldProps>(function CopyField(
  {
    value,
    label,
    ariaLabel,
    buttonLabel = "Copy",
    copiedLabel = "Copied",
    feedbackMs = 2000,
    onCopy,
    display,
    group,
    caption,
    masked,
    revealLabel = "Show value",
    wrap,
    icon = true,
    block,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueId = `oc-copy-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
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

  const shown = groupCode(value, group);
  const name = ariaLabel ?? label ?? "Value";
  const wraps = wrap && !masked;
  return (
    <div
      ref={ref}
      className={cx("oc-copy-field", display && "oc-copy-field--display", display === "lg" && "oc-copy-field--lg", wraps && "oc-copy-field--wrap", block && "oc-copy-field--block", className)}
      style={display ? ({ "--oc-copy-chars": shown.length, ...style } as CSSProperties) : style}
      {...rest}
    >
      {wraps ? (
        <output id={valueId} className="oc-copy-field-value" aria-label={name}>{shown}</output>
      ) : (
        <input id={valueId} className="oc-copy-field-value" type={masked && !revealed ? "password" : "text"} readOnly value={shown} aria-label={name} autoComplete="off" />
      )}
      {masked && (
        <button
          className="oc-copy-field-toggle"
          type="button"
          aria-pressed={revealed}
          aria-controls={valueId}
          aria-label={revealLabel}
          onClick={() => setRevealed((v) => !v)}
        >
          <Webicon name={revealed ? "mdi:eye-off" : "mdi:eye"} bare fallback="iconify" />
        </button>
      )}
      <button className={cx("oc-copy-field-button", copied && "is-copied")} type="button" onClick={copy} data-copy={group ? value : undefined}>
        {icon && <Webicon name={copied ? "mdi:check" : "mdi:content-copy"} bare fallback="iconify" />}
        <span className="oc-copy-field-button-label">{copied ? copiedLabel : buttonLabel}</span>
      </button>
      <span className="oc-copy-field-status oc-visually-hidden" role="status" aria-live="polite">{copied ? copiedLabel : ""}</span>
      {caption != null && <p className="oc-copy-field-caption">{caption}</p>}
    </div>
  );
});
