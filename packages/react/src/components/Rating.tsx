"use client";

// Same markup as packages/ui/snippets/rating.html.
import { forwardRef, useEffect, useId, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils";

export interface RatingProps extends HTMLAttributes<HTMLSpanElement> {
  /** The score, e.g. 4.5. */
  value: number;
  /** Number of stars. Default 5. */
  max?: number;
  size?: "sm" | "md" | "lg";
  /** Accessible text; default "4.5 out of 5". */
  label?: string;
}

/** Stars of a score (`.oc-rating`), halves and decimals included. */
export const Rating = forwardRef<HTMLSpanElement, RatingProps>(function Rating(
  { value, max = 5, size = "md", label, className, style, ...rest },
  ref,
) {
  const score = Math.max(0, Math.min(max, value));
  return (
    <span
      ref={ref}
      className={cx("oc-rating", size !== "md" && `oc-rating--${size}`, className)}
      style={{ ...style, ["--oc-rating" as string]: String(score), ...(max !== 5 ? { ["--oc-rating-max" as string]: String(max) } : {}) } as CSSProperties}
      role="img"
      aria-label={label ?? `${score} out of ${max}`}
      {...rest}
    />
  );
});

export interface RatingInputProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /** Radio name (form value 1–5). Default: a generated name. */
  name?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  legend?: string;
  /** Text per star; default "1 star", "2 stars" … */
  starLabel?: (n: number) => string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

/** Five radio buttons drawn as stars (`.oc-rating-input`), CSS hover preview. */
export const RatingInput = forwardRef<HTMLFieldSetElement, RatingInputProps>(function RatingInput(
  { name, value, defaultValue, onChange, legend = "Rating", starLabel = (n) => (n === 1 ? "1 star" : `${n} stars`), size = "md", disabled, className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-rating-${auto.replace(/:/g, "")}`;
  const [current, setCurrent] = useState(value ?? defaultValue ?? 0);
  useEffect(() => { if (value !== undefined) setCurrent(value); }, [value]);
  return (
    <fieldset ref={ref} className={cx("oc-rating-input", size !== "md" && `oc-rating-input--${size}`, className)} disabled={disabled} {...rest}>
      <legend>{legend}</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n}>
          <input type="radio" name={group} value={n} checked={current === n} onChange={() => { setCurrent(n); onChange?.(n); }} />
          <span>{starLabel(n)}</span>
        </label>
      ))}
    </fieldset>
  );
});
