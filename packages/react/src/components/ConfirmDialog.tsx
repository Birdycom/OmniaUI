// File: packages/react/src/components/ConfirmDialog.tsx
// Map: ConfirmDialog = dialog.oc-modal -> confirm content (close X, icon ring, title) -> form (message, typed field, footer: discard, cancel, confirm)
// A variant of AlertDialog with `.oc-alert-dialog--confirm`. The form is submitted with the confirm button;
// with `confirmWord` the browser blocks the submit until the typed value matches (pattern + required).
"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, FormEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";
import type { AlertDialogType } from "./AlertDialog";

const GLYPHS: Record<AlertDialogType, string> = { success: "✓", error: "×", warning: "!", info: "i", question: "?" };

export interface ConfirmDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  /** Icon color; default `error` (destructive confirm). */
  type?: AlertDialogType;
  icon?: ReactNode;
  title: ReactNode;
  /** Message: pass as `message` or as children. */
  message?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Optional third action at the footer start ("Don't save"). */
  discardLabel?: ReactNode;
  /** The user must type this word before confirming, e.g. "DELETE". */
  confirmWord?: string;
  /** Label above the typed field; defaults to "Type WORD to confirm". */
  confirmWordLabel?: ReactNode;
  closeLabel?: string;
  onConfirm?: () => void;
  onDiscard?: () => void;
}

/** Confirm variant of the alert dialog (`.oc-alert-dialog--confirm`). */
export const ConfirmDialog = forwardRef<HTMLDialogElement, ConfirmDialogProps>(function ConfirmDialog(
  {
    open, defaultOpen, onOpenChange, type = "error", icon, title, message, children,
    confirmLabel = "Confirm", cancelLabel = "Cancel", discardLabel, confirmWord, confirmWordLabel,
    closeLabel = "Close", onConfirm, onDiscard, className, ...rest
  },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const id = useId();
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });

  // We close through state (not method="dialog"), so React stays the source of truth.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirm?.();
    dlg.close();
  };
  const destructive = type === "error";

  return (
    <dialog
      ref={ref}
      className={cx("oc-modal", className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-text`}
      {...attrs({ closedby: "any" })}
      {...rest}
      onClose={dlg.onClose}
    >
      <div className={`oc-modal-content oc-alert-dialog oc-alert-dialog--${type} oc-alert-dialog--confirm`}>
        <button className="oc-alert-dialog-close" type="button" aria-label={closeLabel} onClick={dlg.close}>×</button>
        <span className="oc-alert-dialog-icon" aria-hidden="true">{icon ?? GLYPHS[type]}</span>
        <h2 className="oc-modal-title" id={`${id}-title`}>{title}</h2>
        <form className="oc-alert-dialog-form" onSubmit={submit}>
          <div className="oc-modal-body" id={`${id}-text`}>{message ?? children}</div>
          {confirmWord && (
            <label className="oc-alert-dialog-typed">
              <span>{confirmWordLabel ?? <>Type <code>{confirmWord}</code> to confirm</>}</span>
              <input className="oc-input" name="confirm" pattern={confirmWord} required autoComplete="off" />
            </label>
          )}
          <div className="oc-modal-footer">
            {discardLabel != null && (
              <button className="oc-btn oc-btn--ghost oc-alert-dialog-discard" type="button" onClick={() => { onDiscard?.(); dlg.close(); }}>
                {discardLabel}
              </button>
            )}
            <button className="oc-btn oc-btn--outline" type="button" onClick={dlg.close}>{cancelLabel}</button>
            <button className={cx("oc-btn", destructive && "oc-btn--destructive", "oc-alert-dialog-confirm")} type="submit" value="confirm">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
});
