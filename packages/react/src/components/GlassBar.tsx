// File: packages/react/src/components/GlassBar.tsx | Map: types -> GlassBar (liquid glass menu bar: items with icon and label, the current one raised)
// Same markup as the "Liquid glass menu bar" demo of packages/ui (parts/media-glass-liquid.css).
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface GlassBarItem {
  label: string;
  /** An <Icon>, an <iconify-icon> or an inline SVG. */
  icon?: ReactNode;
  href?: string;
  current?: boolean;
  onClick?: () => void;
}

export interface GlassBarProps extends HTMLAttributes<HTMLElement> {
  items: GlassBarItem[];
  /** Icons only (the label becomes the accessible name). */
  icons?: boolean;
  /** Accessible name of the bar. */
  label?: string;
}

/** `.oc-glass-bar`: a floating liquid glass menu bar; the current item sits in a raised bubble. */
export const GlassBar = forwardRef<HTMLElement, GlassBarProps>(function GlassBar(
  { items, icons, label = "Main", className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx("oc-glass-bar", icons && "oc-glass-bar--icons", className)} aria-label={label} {...rest}>
      {items.map((item, i) => {
        const content = <>{item.icon}{!icons && <span>{item.label}</span>}</>;
        const common = { className: "oc-glass-bar__item", "aria-label": icons ? item.label : undefined };
        return item.href != null ? (
          <a key={i} {...common} href={item.href} aria-current={item.current ? "page" : undefined} onClick={item.onClick}>{content}</a>
        ) : (
          <button key={i} {...common} type="button" aria-pressed={item.current ?? false} onClick={item.onClick}>{content}</button>
        );
      })}
    </nav>
  );
});
