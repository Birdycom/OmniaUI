// File: packages/react/src/components/Logo.tsx
// Map: types -> measuring (packages/ui/src/logo.js, the same script as plain HTML) -> useLogoPlate
//      -> Logo (span.oc-logo[data-plate] + img)
// A customer logo as it was uploaded: own colors and ratio, never filtered. With plate="auto" the image is measured once
// in the browser and gets a neutral plate only in the theme where it would disappear (CSS: media-logo.css). The image
// must be same-origin or send CORS headers; otherwise it stays without a plate.
"use client";

import { forwardRef, useEffect, useState } from "react";
import type { CSSProperties, HTMLAttributes, ImgHTMLAttributes } from "react";
import { cx } from "../utils";
import { measureLogo } from "../../../ui/src/logo.js";

export type LogoPlate = "light" | "dark" | "both" | "none";

/** Which theme needs a plate, from RGBA pixel data; measures an image URL once (cached). Shared with oc-logo.js. */
export { plateFromPixels as logoPlateFromPixels, measureLogo } from "../../../ui/src/logo.js";

/** The plate of a logo: the given one, or "auto" measured once. */
export function useLogoPlate(src: string | undefined, plate: LogoPlate | "auto" = "auto"): LogoPlate | "auto" {
  const [found, setFound] = useState<LogoPlate | "auto">(plate);
  useEffect(() => {
    if (plate !== "auto" || !src) { setFound(plate); return; }
    let live = true;
    void measureLogo(src).then((p: LogoPlate) => { if (live) setFound(p); });
    return () => { live = false; };
  }, [src, plate]);
  return found;
}

export interface LogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src: string;
  alt: string;
  /** "contain" (default): its own ratio at the height, up to the maximum width. "box": every logo in the same box. */
  fit?: "contain" | "box";
  /** "auto" (default) measures the image; or set it: "light", "dark", "both", "none". */
  plate?: LogoPlate | "auto";
  /** Height of the logo (CSS length, --oc-logo-h). */
  height?: string;
  /** Maximum width (CSS length, --oc-logo-w). */
  maxWidth?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

/** `.oc-logo`: a logo in its own colors, with a neutral plate only where it would disappear. */
export const Logo = forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  { src, alt, fit = "contain", plate = "auto", height, maxWidth, imgProps, className, style, ...rest },
  ref,
) {
  const found = useLogoPlate(src, plate);
  const size = { ...(height ? { "--oc-logo-h": height } : {}), ...(maxWidth ? { "--oc-logo-w": maxWidth } : {}) } as CSSProperties;
  return (
    <span ref={ref} className={cx("oc-logo", fit === "box" && "oc-logo--box", className)} data-plate={found} style={{ ...size, ...style }} {...rest}>
      <img src={src} alt={alt} {...imgProps} />
    </span>
  );
});
