"use client";

import { forwardRef, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { barsToSvg, encodeBarcode } from "../../../ui/src/barcode.js";
import { cx } from "../utils";

export interface BarcodeProps extends HTMLAttributes<HTMLElement> {
  value: string;
  format?: "auto" | "EAN13" | "EAN8" | "UPC" | "CODE128";
  /** Digits under the bars. Default true. */
  digits?: boolean;
  size?: "md" | "hero" | "compact";
}

/** EAN-13, EAN-8, UPC-A or Code 128 as SVG (`figure.oc-barcode`); shows the reason when the value cannot be encoded. */
export const Barcode = forwardRef<HTMLElement, BarcodeProps>(function Barcode(
  { value, format = "auto", digits = true, size = "md", className, ...rest },
  ref,
) {
  const result = useMemo(() => {
    try {
      const { bits, text } = encodeBarcode(value, format);
      return { svg: barsToSvg(bits, `Barcode ${text}`), text, error: "" };
    } catch (err) {
      return { svg: "", text: value, error: (err as Error).message };
    }
  }, [value, format]);
  return (
    <figure
      ref={ref}
      className={cx("oc-barcode", size !== "md" && `oc-barcode--${size}`, className)}
      data-error={result.error ? "" : undefined}
      {...rest}
    >
      {result.svg && <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: result.svg }} />}
      {(digits || result.error) && (
        <figcaption className="oc-barcode__digits">{result.error ? `${value}: ${result.error}` : result.text}</figcaption>
      )}
    </figure>
  );
});
