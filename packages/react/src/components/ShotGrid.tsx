// File: packages/react/src/components/ShotGrid.tsx
// Map: types -> Shot (figure.oc-shot -> link or plain image -> caption) -> ShotGrid (div.oc-shot-grid -> shots or children)
// Same markup as packages/ui/snippets/shot-grid.html. A link around the image opens it (a lightbox script can take it over).
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ShotItem {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** Link around the image (zoom cursor); default the image itself. `false` = no link. */
  href?: string | false;
  width?: number;
  height?: number;
}

export interface ShotProps extends Omit<HTMLAttributes<HTMLElement>, "children">, ShotItem {}

/** `figure.oc-shot`: a screenshot with object-fit contain and a caption. */
export const Shot = forwardRef<HTMLElement, ShotProps>(function Shot(
  { src, alt, caption, href, width = 640, height = 400, className, ...rest },
  ref,
) {
  const img = <img src={src} alt={alt} loading="lazy" width={width} height={height} />;
  const link = href === false ? null : href ?? src;
  return (
    <figure ref={ref} className={cx("oc-shot", className)} {...rest}>
      {link ? <a href={link}>{img}</a> : img}
      {caption != null && <figcaption>{caption}</figcaption>}
    </figure>
  );
});

export interface ShotGridProps extends HTMLAttributes<HTMLDivElement> {
  items?: ShotItem[];
  /** Minimum column width (--oc-shot-min, default 18rem). */
  min?: string;
  /** Image ratio of every shot (--oc-shot-ratio, default 16 / 10). */
  ratio?: string;
}

/** `.oc-shot-grid`: an auto-fit grid of screenshots with captions. */
export const ShotGrid = forwardRef<HTMLDivElement, ShotGridProps>(function ShotGrid(
  { items, min, ratio, className, style, children, ...rest },
  ref,
) {
  const vars = { ...(min ? { "--oc-shot-min": min } : {}), ...(ratio ? { "--oc-shot-ratio": ratio } : {}) } as CSSProperties;
  return (
    <div ref={ref} className={cx("oc-shot-grid", className)} style={{ ...vars, ...style }} {...rest}>
      {items?.map((item, i) => <Shot key={i} {...item} />)}
      {children}
    </div>
  );
});
