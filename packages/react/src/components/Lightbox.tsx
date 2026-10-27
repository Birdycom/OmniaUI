// File: packages/react/src/components/Lightbox.tsx
// Map: types -> Lightbox (thumbnails + <dialog> with a snap track of slides) -> jump-to-slide effect
// Same markup as packages/ui/snippets/lightbox.html. Prev / next stay plain anchor links (no JS needed);
// React only opens the dialog and scrolls to the clicked photo.
"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";

export interface LightboxImage {
  /** Image URL. Leave empty to show placeholder art (`.oc-media-art`). */
  src?: string;
  alt: string;
  caption?: ReactNode;
  /** Smaller image for the thumbnail (defaults to `src`). */
  thumb?: string;
}

export interface LightboxProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  images: LightboxImage[];
  /** Text in the top bar (`oc-lightbox__title`). */
  title?: ReactNode;
  /** Render the thumbnail grid that opens the viewer. Default true. */
  thumbnails?: boolean;
}

const media = (img: LightboxImage, src?: string) =>
  src ? <img src={src} alt={img.alt} /> : <span className="oc-media-art" role="img" aria-label={img.alt} />;

/** `.oc-lightbox-thumbs` + `<dialog class="oc-lightbox">`. Controlled with `open` / `onOpenChange`, or uncontrolled. */
export const Lightbox = forwardRef<HTMLDialogElement, LightboxProps>(function Lightbox(
  { images, title, thumbnails = true, open, defaultOpen, onOpenChange, className, "aria-label": label = "Photo viewer", ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const base = `oc-lightbox-${useId().replace(/:/g, "")}`;
  const [start, setStart] = useState(0);
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const single = images.length === 1;
  const slideId = (i: number) => `${base}-${((i % images.length) + images.length) % images.length + 1}`;

  // After opening: jump (without animation) to the photo that was clicked.
  useEffect(() => {
    if (dlg.open) document.getElementById(slideId(start))?.scrollIntoView?.({ behavior: "instant" as ScrollBehavior, block: "nearest", inline: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dlg.open, start]);

  return (
    <>
      {thumbnails && (
        <div className="oc-lightbox-thumbs">
          {images.map((img, i) => (
            <button key={i} type="button" className="oc-lightbox-thumb" aria-label={`Open photo ${i + 1}: ${img.alt}`} onClick={() => { setStart(i); dlg.setOpen(true); }}>
              {media(img, img.thumb ?? img.src)}
            </button>
          ))}
        </div>
      )}
      <dialog ref={ref} className={cx("oc-lightbox", single && "oc-lightbox--single", className)} aria-label={label} {...attrs({ closedby: "any" })} {...rest} onClose={dlg.onClose}>
        <div className="oc-lightbox__bar">
          {title != null ? <h2 className="oc-lightbox__title">{title}</h2> : <span />}
          <button type="button" className="oc-lightbox__close" aria-label="Close" onClick={dlg.close}>&#10005;</button>
        </div>
        <div className="oc-lightbox__track" tabIndex={0} aria-label="Photos, use the arrow keys">
          {images.map((img, i) => (
            <figure key={i} className="oc-lightbox__slide" id={slideId(i)}>
              <div className="oc-lightbox__media">{media(img, img.src)}</div>
              {!single && <a className="oc-lightbox__nav oc-lightbox__nav--prev" href={`#${slideId(i - 1)}`} aria-label="Previous photo">&#8592;</a>}
              {!single && <a className="oc-lightbox__nav oc-lightbox__nav--next" href={`#${slideId(i + 1)}`} aria-label="Next photo">&#8594;</a>}
              <figcaption className="oc-lightbox__caption">
                {!single && <span className="oc-lightbox__counter">{i + 1} / {images.length}</span>} {img.caption ?? img.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </dialog>
    </>
  );
});
