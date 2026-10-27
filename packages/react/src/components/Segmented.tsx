"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
}

export interface SegmentedProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Radio group name (generated when omitted). */
  name?: string;
  /** Full width. */
  block?: boolean;
  size?: "sm" | "md";
}

/** `.oc-segmented` radio group as a pill switcher. */
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { options, value, defaultValue, onChange, name, block, size = "md", className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-segmented-${auto.replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  return (
    <div
      ref={ref}
      className={cx("oc-segmented", block && "oc-segmented--block", size === "sm" && "oc-segmented--sm", className)}
      role="radiogroup"
      {...rest}
    >
      {options.map((o) => (
        <label className="oc-segmented-item" key={o.value}>
          <input type="radio" name={group} value={o.value} checked={current === o.value} onChange={() => setCurrent(o.value)} /> {o.label}
        </label>
      ))}
    </div>
  );
});
