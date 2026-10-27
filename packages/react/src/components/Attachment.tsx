// File: packages/react/src/components/Attachment.tsx
// Map: types + type / extension helpers -> Attachment (file chip) -> AttachmentImage -> AttachmentThumb -> AttachmentList (demo files)
// Same markup as packages/ui/snippets/attachment.html. No JavaScript: onRemove is yours, the upload progress is a custom property.
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type AttachmentType = "pdf" | "doc" | "sheet" | "zip" | "image";

export interface AttachmentFile {
  name: string;
  /** "1.2 MB", or the error text when `state` is "error". */
  size?: ReactNode;
  /** Icon tint. Derived from the extension when empty. */
  type?: AttachmentType;
  /** Text in the icon tile (default: the extension, e.g. "PDF", "XLS"). */
  ext?: string;
  /** Download link (the chip becomes an `<a download>` unless it is removable). */
  href?: string;
  /** Small preview image in the icon tile. */
  image?: string;
  state?: "uploading" | "error";
  /** Upload progress in % (shown while uploading). */
  progress?: number;
  /** Show the remove button (composer). */
  removable?: boolean;
  removeLabel?: string;
}

const TYPES: Record<string, AttachmentType> = {
  pdf: "pdf", doc: "doc", docx: "doc", odt: "doc", rtf: "doc", txt: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", ods: "sheet",
  zip: "zip", rar: "zip", "7z": "zip", gz: "zip", jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image", heic: "image", avif: "image",
};
const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");
/** Icon text and tint of a file name (`Plan.xlsx` -> XLS, sheet). */
export const attachmentMeta = (f: AttachmentFile) => ({
  ext: f.ext ?? extOf(f.name).toUpperCase().replace(/^(DOC|XLS|PPT)X$/, "$1"),
  type: f.type ?? TYPES[extOf(f.name)],
});

export interface AttachmentProps extends Omit<HTMLAttributes<HTMLElement>, "type">, AttachmentFile {
  onRemove?: () => void;
}

/** `.oc-attachment` file chip: icon tile, name, size and an optional remove button. */
export const Attachment = forwardRef<HTMLElement, AttachmentProps>(function Attachment(
  { name, size, type, ext, href, image, state, progress = 0, removable, removeLabel, onRemove, className, style, ...rest },
  ref,
) {
  const meta = attachmentMeta({ name, type, ext });
  const uploading = state === "uploading";
  const props = {
    className: cx("oc-attachment", meta.type && `oc-attachment--${meta.type}`, state && `oc-attachment--${state}`, className),
    style: uploading ? ({ "--oc-attachment-progress": `${progress}%`, ...style } as CSSProperties) : style,
    ...rest,
  };
  const inner = (
    <>
      <span className="oc-attachment__icon" aria-hidden="true">{image ? <img src={image} alt="" /> : meta.ext}</span>
      <span className="oc-attachment__body">
        <span className="oc-attachment__name">{name}</span>
        {uploading ? <span className="oc-attachment__size" role="status">{size ?? `Uploading… ${progress}%`}</span> : size != null && <span className="oc-attachment__size">{size}</span>}
      </span>
      {removable && (
        <button type="button" className="oc-attachment__remove" aria-label={removeLabel ?? (uploading ? `Cancel upload of ${name}` : `Remove ${name}`)} onClick={onRemove}>&#10005;</button>
      )}
    </>
  );
  return href && !removable
    ? <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} download {...props}>{inner}</a>
    : <div ref={ref as React.Ref<HTMLDivElement>} {...props}>{inner}</div>;
});

export interface AttachmentImageProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  /** Image URL. Leave empty to show placeholder art. */
  src?: string;
  alt: string;
  art?: number;
  /** e.g. "worktop-sample.jpg · 2.1 MB". */
  caption?: ReactNode;
}

const art = (n?: number) => cx("oc-media-art", n != null && `oc-media-art--${n}`);

/** `a.oc-attachment-image`: 4:3 image preview inside a message. */
export function AttachmentImage({ href, src, alt, art: n, caption, className, ...rest }: AttachmentImageProps) {
  return (
    <a className={cx("oc-attachment-image", className)} href={href} {...rest}>
      {src ? <img src={src} alt={alt} /> : <span className={art(n)} role="img" aria-label={alt} />}
      {caption != null && <span className="oc-attachment-image__caption">{caption}</span>}
    </a>
  );
}

export interface AttachmentThumbProps extends HTMLAttributes<HTMLElement> {
  src?: string;
  alt: string;
  art?: number;
  /** Remove button label, e.g. "Remove screenshot.png". No label = no button. */
  removeLabel?: string;
  onRemove?: () => void;
  as?: "div" | "span";
}

/** `.oc-attachment-thumb`: square thumbnail of a pasted screenshot. */
export function AttachmentThumb({ src, alt, art: n, removeLabel, onRemove, as: Tag = "div", className, ...rest }: AttachmentThumbProps) {
  return (
    <Tag className={cx("oc-attachment-thumb", className)} {...rest}>
      {src ? <img src={src} alt={alt} /> : <span className={art(n)} role="img" aria-label={alt} />}
      {removeLabel && <button type="button" className="oc-attachment__remove" aria-label={removeLabel} onClick={onRemove}>&#10005;</button>}
    </Tag>
  );
}

export interface AttachmentListProps extends HTMLAttributes<HTMLElement> {
  /** File chips; `children` replace them. */
  items?: AttachmentFile[];
  /** One per line, full width. */
  stack?: boolean;
  /** `ul` (default, items in `li`) or `div`. */
  as?: "ul" | "div";
  onRemove?: (file: AttachmentFile, index: number) => void;
}

const DEMO: AttachmentFile[] = [
  { name: "Quote kitchen Dewitte v2.pdf", size: "1.2 MB", href: "#quote.pdf" },
  { name: "Measurements ground floor.xlsx", size: "86 KB", href: "#measurements.xlsx" },
  { name: "Contract addendum.docx", size: "240 KB", href: "#contract.docx" },
  { name: "Plans architect.zip", size: "14.8 MB", href: "#plans.zip" },
];

/** `.oc-attachment-list`: wrapping row of chips. */
export function AttachmentList({ items = DEMO, stack, as: Tag = "ul", onRemove, className, children, "aria-label": label = "Files in this message", ...rest }: AttachmentListProps) {
  const chips = children ?? items.map((f, i) => {
    const chip = <Attachment key={i} {...f} onRemove={() => onRemove?.(f, i)} />;
    return Tag === "ul" ? <li key={i}>{chip}</li> : chip;
  });
  return <Tag className={cx("oc-attachment-list", stack && "oc-attachment-list--stack", className)} aria-label={label} {...rest}>{chips}</Tag>;
}
