"use client";

import { forwardRef, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { barsToSvg, digitGroups, encodeBarcode } from "../../../ui/src/barcode.js";
import { cx } from "../utils";

export interface BarcodeProps extends HTMLAttributes<HTMLElement> {
  value: string;
  format?: "auto" | "EAN13" | "EAN8" | "UPC" | "CODE128";
  /** Digits under the bars. Default true. */
  digits?: boolean;
  size?: "md" | "hero" | "compact";
  /** `bare`: no white plate and border (inside a card); bars in currentColor. Default `plate`. */
  variant?: "plate" | "bare";
  /** Group the digits like on a product (EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1). Default true. */
  groupDigits?: boolean;
}

/** EAN-13, EAN-8, UPC-A or Code 128 as SVG (`figure.oc-barcode`); shows the reason when the value cannot be encoded. */
export const Barcode = forwardRef<HTMLElement, BarcodeProps>(function Barcode(
  { value, format = "auto", digits = true, size = "md", variant = "plate", groupDigits = true, className, ...rest },
  ref,
) {
  const result = useMemo(() => {
    try {
      const { bits, text, format: used } = encodeBarcode(value, format);
      return { svg: barsToSvg(bits, `Barcode ${text}`), text, groups: groupDigits ? digitGroups(text, used) : [text], error: "" };
    } catch (err) {
      return { svg: "", text: value, groups: [] as string[], error: (err as Error).message };
    }
  }, [value, format, groupDigits]);
  return (
    <figure
      ref={ref}
      className={cx("oc-barcode", size !== "md" && `oc-barcode--${size}`, variant === "bare" && "oc-barcode--bare", className)}
      data-error={result.error ? "" : undefined}
      {...rest}
    >
      {result.svg && <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: result.svg }} />}
      {(digits || result.error) && (
        <figcaption className="oc-barcode__digits">
          {result.error
            ? `${value}: ${result.error}`
            : result.groups.map((g, i) => (
                <span key={i} className="oc-barcode__group">{g}</span>
              ))}
        </figcaption>
      )}
    </figure>
  );
});
