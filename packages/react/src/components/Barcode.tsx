"use client";

import { forwardRef, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { barsToSvg, digitGroups, encodeBarcode, qrToSvg } from "../../../ui/src/barcode.js";
import { cx } from "../utils";

/** 0.17.1: the encoder of the barcode script, for your own checks (which format a scanned value is, whether it encodes). */
export { encodeBarcode, guessFormat } from "../../../ui/src/barcode.js";
/** 0.18.0: the own QR encoder (module matrix) and its SVG, for a canvas, a PDF or a label of your own. */
export { encodeQr, qrToSvg } from "../../../ui/src/barcode.js";

export interface BarcodeProps extends HTMLAttributes<HTMLElement> {
  value: string;
  /** 0.18.0: `"QR"` draws a QR code (own encoder, white quiet zone in every theme; `.oc-barcode--qr`). */
  format?: "auto" | "EAN13" | "EAN8" | "UPC" | "CODE128" | "QR";
  /** 0.18.0: error correction of a QR code: L, M (default), Q or H. */
  level?: "L" | "M" | "Q" | "H";
  /** Digits under the bars. Default true. */
  digits?: boolean;
  size?: "md" | "hero" | "compact";
  /** `bare`: no white plate and border (inside a card); bars in currentColor. Default `plate`. */
  variant?: "plate" | "bare";
  /** Group the digits like on a product (EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1). Default true. */
  groupDigits?: boolean;
  /**
   * 0.17.1: `"code128"`: an EAN/UPC value that cannot be encoded (a wrong check digit) is drawn as Code 128 instead of an
   * error; the figure then gets `data-fallback-used`.
   */
  fallback?: "code128";
}

/** EAN-13, EAN-8, UPC-A, Code 128 or (0.18.0) a QR code as SVG (`figure.oc-barcode`); shows the reason when the value cannot be encoded. */
export const Barcode = forwardRef<HTMLElement, BarcodeProps>(function Barcode(
  { value, format = "auto", level = "M", digits = true, size = "md", variant = "plate", groupDigits = true, fallback, className, ...rest },
  ref,
) {
  const result = useMemo(() => {
    try {
      const { bits, text, format: used, fallback: fell, qr } = encodeBarcode(value, format, { fallback, level });
      if (qr) return { svg: qrToSvg(qr.matrix, `QR code ${text}`), text, groups: [text], error: "", fell: false, qr: true };
      return { svg: barsToSvg(bits, `Barcode ${text}`), text, groups: groupDigits ? digitGroups(text, used) : [text], error: "", fell: !!fell, qr: false };
    } catch (err) {
      return { svg: "", text: value, groups: [] as string[], error: (err as Error).message, fell: false, qr: false };
    }
  }, [value, format, level, groupDigits, fallback]);
  return (
    <figure
      ref={ref}
      className={cx("oc-barcode", result.qr && "oc-barcode--qr", size !== "md" && `oc-barcode--${size}`, variant === "bare" && "oc-barcode--bare", className)}
      data-error={result.error ? "" : undefined}
      data-fallback-used={result.fell ? "" : undefined}
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
