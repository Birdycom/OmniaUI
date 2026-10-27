// File: packages/react/src/components/BusyOverlay.tsx
// Map: types -> BusyOverlay (<dialog closedby="none">: spinner or progress, title, text)
// Same markup as packages/ui/snippets/busy-overlay.html. Open it with `open` while a long submit or upload runs;
// the dialog is modal (the page is inert) and Esc does not close it. The 300ms delay before it shows is CSS.
"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";
import { Progress } from "./Progress";

export interface BusyOverlayProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  title?: ReactNode;
  text?: ReactNode;
  /** Known percentage: shows `.oc-progress` instead of the spinner. */
  progress?: number;
  /** aria-label of the spinner / progress bar (default "Busy"). */
  label?: string;
}

/** `dialog.oc-busy-overlay[closedby=none]`. Controlled with `open` / `onOpenChange`, or uncontrolled. */
export const BusyOverlay = forwardRef<HTMLDialogElement, BusyOverlayProps>(function BusyOverlay(
  {
    title = "Saving…", text = "The photos are being processed. This can take a minute; please keep this page open.",
    progress, label = "Busy", open, defaultOpen, onOpenChange, id, className, ...rest
  },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const auto = useId().replace(/[^\w-]/g, "");
  const base = id ?? `oc-busy-overlay-${auto}`;
  return (
    <dialog
      ref={ref}
      className={cx("oc-busy-overlay", className)}
      id={base}
      {...attrs({ closedby: "none" })}
      aria-labelledby={`${base}-title`}
      aria-describedby={text != null ? `${base}-text` : undefined}
      {...rest}
      onClose={dlg.onClose}
    >
      {progress == null ? <span className="oc-spinner" role="status" aria-label={label} /> : <Progress value={progress} aria-label={label} />}
      <h2 className="oc-busy-overlay__title" id={`${base}-title`}>{title}</h2>
      {text != null && <p className="oc-busy-overlay__text" id={`${base}-text`}>{text}</p>}
    </dialog>
  );
});
