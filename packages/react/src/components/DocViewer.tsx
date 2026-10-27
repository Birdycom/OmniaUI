// File: packages/react/src/components/DocViewer.tsx
// Map: types + demo items -> media (iframe / video / img / placeholder art) -> DocViewer (grid of cards -> one <dialog> per card)
// Same markup as packages/ui/snippets/doc-viewer.html. No JavaScript: the buttons open the full-screen dialog with
// invoker commands (command="show-modal" commandfor), closedby="any" closes it on Esc or a click on the backdrop.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface DocViewerItem {
  /** Name in the bar and the dialog title; also used in the aria-labels. */
  label: string;
  /** Small text next to the label, e.g. "PDF · 2.4 MB" or "1:42". */
  meta?: ReactNode;
  /** File URL. Leave empty to show placeholder art (`.oc-media-art`). */
  src?: string;
  /** Default "pdf" (A4 frame). "video" = 16/9 dark frame, "image" = natural height. */
  type?: "pdf" | "video" | "image";
  /** Dialog id (generated when empty). */
  id?: string;
  /** Text for the inline preview (aria-label / alt / iframe title). Defaults to the label. */
  alt?: string;
  /** Placeholder art variant (`oc-media-art--N`) when there is no src. */
  art?: number;
  /** Download link in the dialog bar. */
  download?: string;
  /** Where the preview opens: "bar" (expand button) or "frame" (the whole preview). Default: "frame" for video. */
  open?: "bar" | "frame";
  /** Set false for a plain card without full-screen dialog. Default true. */
  fullscreen?: boolean;
}

export interface DocViewerProps extends HTMLAttributes<HTMLDivElement> {
  items?: DocViewerItem[];
  /** Text of the frame button (default "Click for full screen"). */
  openText?: ReactNode;
  downloadText?: ReactNode;
  /** Prefix for generated dialog ids. */
  idPrefix?: string;
}

const DEMO: DocViewerItem[] = [
  { label: "Brochure 2026", meta: "PDF · 2.4 MB", alt: "First page of Brochure 2026", art: 2, download: "#brochure.pdf" },
  { label: "Site visit", meta: "1:42", type: "video", alt: "Video still: site visit", art: 5 },
];

const media = (doc: DocViewerItem, alt: string) => {
  const type = doc.type ?? "pdf";
  if (!doc.src) return <div className={cx("oc-media-art", doc.art != null && `oc-media-art--${doc.art}`)} role="img" aria-label={alt} />;
  if (type === "video") return <video src={doc.src} controls preload="metadata" aria-label={alt} />;
  if (type === "image") return <img src={doc.src} alt={alt} />;
  return <iframe src={`${doc.src}#toolbar=0&view=FitH`} title={alt} loading="lazy" />;
};

/** `.oc-doc-viewer-grid` of `figure.oc-doc-viewer` cards, each with its `dialog.oc-doc-viewer-dialog`. */
export const DocViewer = forwardRef<HTMLDivElement, DocViewerProps>(function DocViewer(
  { items = DEMO, openText = "Click for full screen", downloadText = "Download", idPrefix, className, ...rest },
  ref,
) {
  const auto = useId().replace(/[^\w-]/g, "");
  const base = idPrefix ?? `oc-doc-viewer-${auto}`;
  const idOf = (doc: DocViewerItem, i: number) => doc.id ?? `${base}-${i + 1}`;

  const cards = items.map((doc, i) => {
    const id = idOf(doc, i);
    const full = doc.fullscreen !== false;
    const frame = full && (doc.open ?? (doc.type === "video" ? "frame" : "bar")) === "frame";
    return (
      <figure key={i} className={cx("oc-doc-viewer", doc.type === "video" && "oc-doc-viewer--video", doc.type === "image" && "oc-doc-viewer--image")}>
        <figcaption className="oc-doc-viewer__bar">
          <span className="oc-doc-viewer__label">{doc.label}</span>
          {doc.meta != null && <span className="oc-doc-viewer__meta">{doc.meta}</span>}
          {full && !frame && (
            <button type="button" className="oc-doc-viewer__expand" {...attrs({ command: "show-modal", commandfor: id })} aria-label={`Open ${doc.label} full screen`}>&#10530;</button>
          )}
        </figcaption>
        <div className="oc-doc-viewer__frame">
          {media(doc, doc.alt ?? doc.label)}
          {frame && <button type="button" className="oc-doc-viewer__open" {...attrs({ command: "show-modal", commandfor: id })}>{openText}</button>}
        </div>
      </figure>
    );
  });

  const dialogs = items.map((doc, i) => {
    if (doc.fullscreen === false) return null;
    const id = idOf(doc, i);
    const close = <button type="button" className="oc-doc-viewer-dialog__close" {...attrs({ command: "close", commandfor: id })} aria-label="Close">&#10005;</button>;
    return (
      <dialog key={i} className={cx("oc-doc-viewer-dialog", doc.type === "video" && "oc-doc-viewer-dialog--video")} id={id} {...attrs({ closedby: "any" })} aria-labelledby={`${id}-title`}>
        <div className="oc-doc-viewer-dialog__bar">
          <h2 className="oc-doc-viewer-dialog__title" id={`${id}-title`}>{doc.label}</h2>
          {doc.download ? (
            <div className="oc-doc-viewer-dialog__actions">
              <a className="oc-btn oc-btn--outline oc-btn--sm" href={doc.download} download>{downloadText}</a>
              {close}
            </div>
          ) : close}
        </div>
        <div className="oc-doc-viewer-dialog__body">{media(doc, doc.type === "video" ? `${doc.label} video` : doc.label)}</div>
      </dialog>
    );
  });

  return (
    <>
      <div ref={ref} className={cx("oc-doc-viewer-grid", className)} {...rest}>{cards}</div>
      {dialogs}
    </>
  );
});
