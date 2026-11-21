// File: packages/react/src/components/GlassBar.tsx | Map: types -> GlassBar (liquid glass menu bar: items with icon and label, the current one raised, { sep: true } for a divider)
// Same markup as the "Liquid glass menu bar" demo of packages/ui (parts/media-glass-liquid.css).
import { forwardRef, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { useMergedRef } from "../hooks";
import { cx } from "../utils";
import { useGlassLens } from "./Glass";
import { webiconNode } from "./Webicon";

export interface GlassBarItem {
  label: string;
  /** A webicon name ("mdi:home-outline", drawn as inline SVG), an <Icon> or any node. */
  icon?: ReactNode;
  href?: string;
  current?: boolean;
  onClick?: () => void;
}

/** A thin divider between two groups of items (`.oc-glass-bar__sep`). */
export interface GlassBarSep {
  sep: true;
}

export interface GlassBarProps extends HTMLAttributes<HTMLElement> {
  /** Items, and `{ sep: true }` where a divider goes. */
  items: (GlassBarItem | GlassBarSep)[];
  /** Icons only (the label becomes the accessible name). */
  icons?: boolean;
  /** Accessible name of the bar. */
  label?: string;
  /** The lens: in Chromium the backdrop bends at the edge (glass-lens.js); elsewhere frosted glass. Default true. */
  lens?: boolean;
}

/** `.oc-glass-bar`: a floating liquid glass menu bar; the current item sits in a raised bubble. */
export const GlassBar = forwardRef<HTMLElement, GlassBarProps>(function GlassBar(
  { items, icons, label = "Main", lens = true, className, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  useGlassLens(inner, lens, [className]);
  return (
    <nav ref={ref} className={cx("oc-glass-bar", icons && "oc-glass-bar--icons", className)} aria-label={label} data-oc-glass-lens={lens ? undefined : "off"} {...rest}>
      {items.map((item, i) => {
        if ("sep" in item) return <span key={i} className="oc-glass-bar__sep" aria-hidden="true" />;
        const content = <>{webiconNode(item.icon)}{!icons && <span>{item.label}</span>}</>;
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
