"use client";

// Same markup as packages/ui/snippets/gallery.html.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface GalleryImage {
  src: string;
  alt: string;
  /** Thumbnail image; default the same src. */
  thumb?: string;
  /** Short name of the thumbnail (its radio label); default the alt. */
  thumbAlt?: string;
}

export interface GalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: GalleryImage[];
  /** Name of the photos (thumbnail group legend). */
  label?: string;
  badge?: ReactNode;
  side?: boolean;
  /** Radio name; default generated. */
  name?: string;
}

/** Product photos with thumbnails (`.oc-gallery`), CSS only (radios + :has, up to 8). */
export const Gallery = forwardRef<HTMLDivElement, GalleryProps>(function Gallery(
  { images, label = "Photos", badge, side, name, className, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-gallery-${auto.replace(/:/g, "")}`;
  const list = images.slice(0, 8);
  return (
    <div ref={ref} className={cx("oc-gallery", side && "oc-gallery--side", className)} {...rest}>
      <div className="oc-gallery__stage">
        {badge != null && <span className="oc-badge oc-badge--destructive oc-gallery__badge">{badge}</span>}
        {list.map((img, i) => (
          <figure key={i} className="oc-gallery__slide"><img src={img.src} alt={img.alt} loading={i ? "lazy" : undefined} /></figure>
        ))}
      </div>
      {list.length > 1 && (
        <fieldset className="oc-gallery__thumbs">
          <legend>{label}</legend>
          {list.map((img, i) => (
            <label key={i} className="oc-gallery__thumb">
              <input type="radio" name={group} defaultChecked={i === 0} />
              <img src={img.thumb ?? img.src} alt={img.thumbAlt ?? img.alt} />
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
});
