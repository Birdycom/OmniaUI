// File: packages/react/src/components/AlphaTabs.tsx
// Map: AlphaTabs = nav -> "All" item -> one item per letter (current / disabled)
// With `href` the items are links (server filtering); without it they are buttons that call onChange.
"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface AlphaTabsProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Letters to show (default A-Z). */
  letters?: string[];
  /** Letters that have entries; the others are disabled. Default: all letters. */
  available?: string[];
  /** Current letter, or "all". */
  value?: string;
  defaultValue?: string;
  onChange?: (letter: string) => void;
  /** Build a link per letter, e.g. `(l) => "?letter=" + l`. */
  href?: (letter: string) => string;
  allLabel?: string;
  wrap?: boolean;
  size?: "sm";
  plain?: boolean;
}

/** `nav.oc-alpha-tabs`: All + A-Z letter filter. */
export const AlphaTabs = forwardRef<HTMLElement, AlphaTabsProps>(function AlphaTabs(
  { letters = AZ, available, value, defaultValue = "all", onChange, href, allLabel = "All", wrap, size, plain, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllable(value, defaultValue, onChange);
  const cls = cx("oc-alpha-tabs", wrap && "oc-alpha-tabs--wrap", size && `oc-alpha-tabs--${size}`, plain && "oc-alpha-tabs--plain", className);

  const item = (key: string, label: string, extra?: string) => {
    const isCurrent = current === key;
    const disabled = key !== "all" && available !== undefined && !available.includes(key);
    const itemCls = cx("oc-alpha-tabs-item", extra);
    if (href) {
      // A disabled link has no href, so it cannot be followed.
      return (
        <a key={key} className={itemCls} href={disabled ? undefined : href(key)} aria-current={isCurrent ? "true" : undefined} aria-disabled={disabled ? "true" : undefined}>
          {label}
        </a>
      );
    }
    return (
      <button key={key} type="button" className={itemCls} aria-current={isCurrent ? "true" : undefined} disabled={disabled} onClick={() => setCurrent(key)}>
        {label}
      </button>
    );
  };

  return (
    <nav ref={ref} className={cls} aria-label="Filter by letter" {...rest}>
      {item("all", allLabel, "oc-alpha-tabs-item--all")}
      {letters.map((l) => item(l, l))}
    </nav>
  );
});
