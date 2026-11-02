// Same markup as packages/ui/snippets/price.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

/** Format an amount with Intl (locale and currency), or pass a string through. */
export function formatPrice(amount: number | string, currency = "EUR", locale = "nl-BE"): string {
  return typeof amount === "number" ? new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount) : amount;
}

export interface PriceProps extends HTMLAttributes<HTMLDivElement> {
  amount: number | string;
  /** Old price (struck through). */
  old?: number | string;
  /** Discount badge text ("-20%"). */
  discount?: ReactNode;
  /** Quiet note: "excl. VAT". */
  note?: ReactNode;
  /** The other amount: "€ 180,29 incl. VAT". */
  alt?: ReactNode;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  sale?: boolean;
  inline?: boolean;
  end?: boolean;
}

/** A price with old price, discount, VAT note and the other amount (`.oc-price`). */
export const Price = forwardRef<HTMLDivElement, PriceProps>(function Price(
  { amount, old, discount, note, alt, currency = "EUR", locale = "nl-BE", size = "md", sale, inline, end, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-price", size !== "md" && `oc-price--${size}`, sale && "oc-price--sale", inline && "oc-price--inline", end && "oc-price--end", className)} {...rest}>
      <div className="oc-price__main">
        <span className="oc-price__amount">{formatPrice(amount, currency, locale)}</span>
        {old != null && <s className="oc-price__old">{formatPrice(old, currency, locale)}</s>}
        {discount != null && <span className="oc-badge oc-badge--destructive">{discount}</span>}
      </div>
      {note != null && <span className="oc-price__note">{note}</span>}
      {alt != null && <span className="oc-price__alt">{alt}</span>}
    </div>
  );
});
