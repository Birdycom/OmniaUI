"use client";

import { forwardRef, useState } from "react";
import type { DragEvent, InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface DropzoneProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "children"> {
  /** Icon in `oc-dropzone-icon` (inline SVG or glyph). */
  icon?: ReactNode;
  /** Main text, e.g. `<strong>Drop invoices here</strong> or click to choose`. */
  children?: ReactNode;
  /** Small hint (`oc-dropzone-hint`), e.g. accepted types and size. */
  hint?: ReactNode;
  /** Called with the chosen or dropped files. */
  onFiles?: (files: File[]) => void;
}

/** `<label class="oc-dropzone">` around a real file input; `is-dragover` while dragging. */
export const Dropzone = forwardRef<HTMLInputElement, DropzoneProps>(function Dropzone(
  { icon, children, hint, onFiles, className, ...rest },
  ref,
) {
  const [over, setOver] = useState(false);
  const stop = (e: DragEvent) => {
    e.preventDefault();
    setOver(e.type === "dragover" || e.type === "dragenter");
  };
  return (
    <label
      className={cx("oc-dropzone", over && "is-dragover", className)}
      onDragEnter={stop}
      onDragOver={stop}
      onDragLeave={stop}
      onDrop={(e) => {
        stop(e);
        const files = Array.from(e.dataTransfer?.files ?? []);
        if (files.length && !rest.disabled) onFiles?.(files);
      }}
    >
      <input ref={ref} type="file" onChange={(e) => onFiles?.(Array.from(e.target.files ?? []))} {...rest} />
      {icon != null && <span className="oc-dropzone-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {hint != null && <span className="oc-dropzone-hint">{hint}</span>}
    </label>
  );
});
