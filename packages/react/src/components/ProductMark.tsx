// File: packages/react/src/components/ProductMark.tsx | Map: types -> ProductMark (span.oc-product-mark + modifiers)
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type ProductMarkSize = "sm" | "default" | "lg" | "xl";
export type ProductMarkAccent = "blue" | "cyan" | "green" | "orange" | "red" | "violet" | "yellow";

export interface ProductMarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: ProductMarkSize;
  /** Accent preset (adds .oc-accent--{accent}). */
  accent?: ProductMarkAccent;
  /** Tinted background with an accent glyph. */
  soft?: boolean;
  glow?: boolean;
  /** Full-bleed image inside. */
  cover?: boolean;
}

/** `<span class="oc-product-mark">`: squircle app-icon tile. Decorative by default (aria-hidden). */
export const ProductMark = forwardRef<HTMLSpanElement, ProductMarkProps>(function ProductMark(
  { size = "default", accent, soft = false, glow = false, cover = false, className, ...rest },
  ref,
) {
  const classes = cx(
    "oc-product-mark",
    size !== "default" && `oc-product-mark--${size}`,
    soft && "oc-product-mark--soft",
    glow && "oc-product-mark--glow",
    cover && "oc-product-mark--cover",
    accent && `oc-accent--${accent}`,
    className,
  );
  return <span ref={ref} className={classes} aria-hidden="true" {...rest} />;
});
