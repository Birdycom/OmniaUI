// File: packages/react/src/components/ShotGrid.tsx
// Map: types -> Shot (figure.oc-shot -> link, lightbox button or plain image -> caption; + Lightbox) -> ShotGrid (div.oc-shot-grid -> shots or children)
// Same markup as packages/ui/snippets/shot-grid.html. A link around the image opens it; with `lightbox` the image is a button
// that opens it large in a single-image Lightbox (a <dialog> next to the figure).
"use client";

import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Lightbox } from "./Lightbox";

export interface ShotItem {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** Link around the image (zoom cursor); default the image itself. `false` = no link. */
  href?: string | false;
  width?: number;
  height?: number;
  /** The image is a button that opens it large in a Lightbox (0.17.0); `href` is then ignored. */
  lightbox?: boolean;
}

export interface ShotProps extends Omit<HTMLAttributes<HTMLElement>, "children">, ShotItem {}

/** `figure.oc-shot`: a screenshot with object-fit contain and a caption. */
export const Shot = forwardRef<HTMLElement, ShotProps>(function Shot(
  { src, alt, caption, href, width = 640, height = 400, lightbox, className, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false);
  const img = <img src={src} alt={alt} loading="lazy" width={width} height={height} />;
  const link = href === false ? null : href ?? src;
  const figure = (
    <figure ref={ref} className={cx("oc-shot", className)} {...rest}>
      {lightbox
        ? <button type="button" aria-label={`Open the screenshot: ${alt}`} onClick={() => setOpen(true)}>{img}</button>
        : link ? <a href={link}>{img}</a> : img}
      {caption != null && <figcaption>{caption}</figcaption>}
    </figure>
  );
  if (!lightbox) return figure;
  // The dialog sits next to the figure, not in it, so the .oc-shot image rules (ratio, crop) do not reach the large view.
  return (
    <>
      {figure}
      <Lightbox images={[{ src, alt, caption }]} title={caption} aria-label={alt} thumbnails={false} open={open} onOpenChange={setOpen} />
    </>
  );
});

export interface ShotGridProps extends HTMLAttributes<HTMLDivElement> {
  items?: ShotItem[];
  /** Minimum column width (--oc-shot-min, default 18rem). */
  min?: string;
  /** Image ratio of every shot (--oc-shot-ratio, default 16 / 10). */
  ratio?: string;
  /** Every shot of `items` opens in a Lightbox (0.17.0). */
  lightbox?: boolean;
}

/** `.oc-shot-grid`: an auto-fit grid of screenshots with captions. */
export const ShotGrid = forwardRef<HTMLDivElement, ShotGridProps>(function ShotGrid(
  { items, min, ratio, lightbox, className, style, children, ...rest },
  ref,
) {
  const vars = { ...(min ? { "--oc-shot-min": min } : {}), ...(ratio ? { "--oc-shot-ratio": ratio } : {}) } as CSSProperties;
  return (
    <div ref={ref} className={cx("oc-shot-grid", className)} style={{ ...vars, ...style }} {...rest}>
      {items?.map((item, i) => <Shot key={i} lightbox={lightbox} {...item} />)}
      {children}
    </div>
  );
});
