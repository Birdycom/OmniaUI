// File: packages/react/src/components/ImageZoom.tsx
// Map: props -> ImageZoom (toolbar of radio levels -> viewport -> canvas with the image)
// Same markup as packages/ui/snippets/image-zoom.html. The chosen level is also written to --oc-zoom,
// so any number works (the CSS-only :has() rules cover 1, 1.5, 2, 3 and 4).
"use client";

import { forwardRef, useId, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ImageZoomProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  /** Zoom levels for the toolbar. Empty array = no toolbar. Default [1, 1.5, 2, 3]. */
  levels?: number[];
  /** Starting level. Default 1. */
  defaultZoom?: number;
  /** Window ratio: "square", "photo" or a CSS ratio such as "21 / 9". Default 16 / 9. */
  ratio?: "square" | "photo" | string;
  /** Replaces the <img> inside the canvas (svg, video, placeholder art). */
  media?: ReactNode;
}

/** `.oc-image-zoom`: zoom by making the canvas wider than the viewport; pan by scrolling. */
export const ImageZoom = forwardRef<HTMLDivElement, ImageZoomProps>(function ImageZoom(
  { src, alt = "", levels = [1, 1.5, 2, 3], defaultZoom = 1, ratio, media, className, style, ...rest },
  ref,
) {
  const name = `oc-zoom-${useId().replace(/:/g, "")}`;
  const [zoom, setZoom] = useState(defaultZoom);
  const preset = ratio === "square" || ratio === "photo" ? ratio : undefined;
  const vars = { "--oc-zoom": String(zoom), ...(ratio && !preset ? { "--oc-image-zoom-ratio": ratio } : {}) } as CSSProperties;
  return (
    <div ref={ref} className={cx("oc-image-zoom", preset && `oc-image-zoom--${preset}`, className)} style={{ ...vars, ...style }} {...rest}>
      {levels.length > 0 && (
        <div className="oc-image-zoom__toolbar" role="radiogroup" aria-label="Zoom level">
          <span className="oc-image-zoom__label">Zoom</span>
          {levels.map((l) => (
            <label key={l} className="oc-image-zoom__level">
              <input type="radio" name={name} value={String(l)} checked={zoom === l} onChange={() => setZoom(l)} />
              {Math.round(l * 100)}%
            </label>
          ))}
        </div>
      )}
      <div className="oc-image-zoom__viewport" tabIndex={0} role="region" aria-label={alt ? `${alt}, scroll to pan` : "Scroll to pan"}>
        <div className="oc-image-zoom__canvas">{media ?? (src ? <img src={src} alt={alt} /> : <div className="oc-media-art" role="img" aria-label={alt} />)}</div>
      </div>
    </div>
  );
});
