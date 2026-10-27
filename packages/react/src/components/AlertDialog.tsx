"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";

export type AlertDialogType = "success" | "error" | "warning" | "info" | "question";

const GLYPHS: Record<AlertDialogType, string> = {
  success: "✓",
  error: "×",
  warning: "!",
  info: "i",
  question: "?",
};

export interface AlertDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  /** Type modifier on the content box (sets the icon color). Default `warning`. */
  type?: AlertDialogType;
  /** Custom icon glyph or SVG (defaults to a glyph for the type). */
  icon?: ReactNode;
  title: ReactNode;
  /** Message (`oc-modal-body`): pass as `message` or as children. */
  message?: ReactNode;
  /** Secondary + primary buttons (`oc-modal-footer`), e.g. `<ModalClose>`s. */
  footer?: ReactNode;
}

/** Confirmation `<dialog class="oc-modal">` with a status icon. */
export const AlertDialog = forwardRef<HTMLDialogElement, AlertDialogProps>(function AlertDialog(
  { open, defaultOpen, onOpenChange, type = "warning", icon, title, message, footer, className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const id = useId();
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  return (
    <dialog
      ref={ref}
      className={cx("oc-modal", className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-text`}
      {...attrs({ closedby: "closerequest" })}
      {...rest}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className={`oc-modal-content oc-modal-content--sm oc-alert-dialog oc-alert-dialog--${type}`}>
          <span className="oc-alert-dialog-icon" aria-hidden="true">{icon ?? GLYPHS[type]}</span>
          <h2 className="oc-modal-title" id={`${id}-title`}>{title}</h2>
          <div className="oc-modal-body" id={`${id}-text`}>{message ?? children}</div>
          {footer != null && <div className="oc-modal-footer">{footer}</div>}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});
