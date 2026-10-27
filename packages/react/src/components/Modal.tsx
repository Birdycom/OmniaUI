"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useDialog, useDialogContext, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  /** Heading (`oc-modal-title`). */
  title?: ReactNode;
  /** Muted text under the title (`oc-modal-description`). */
  description?: ReactNode;
  /** Button row (`oc-modal-footer`). Use `<ModalClose>` for buttons that close the dialog. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Close when the backdrop is clicked (native `closedby="any"`). Default true. */
  closeOnBackdrop?: boolean;
}

/**
 * `<dialog class="oc-modal">`. The `open` prop is synced to showModal() / close() in an effect;
 * Escape and backdrop clicks are reported through `onOpenChange(false)`.
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, defaultOpen, onOpenChange, title, description, footer, size = "md", closeOnBackdrop = true, className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const titleId = useId();
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    rest.onClick?.(e);
    if (closeOnBackdrop && e.target === e.currentTarget) dlg.close();
  };
  return (
    <dialog
      ref={ref}
      className={cx("oc-modal", className)}
      aria-labelledby={title != null ? titleId : undefined}
      {...attrs({ closedby: closeOnBackdrop ? "any" : "closerequest" })}
      {...rest}
      onClick={onClick}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className={cx("oc-modal-content", size !== "md" && `oc-modal-content--${size}`)}>
          {(title != null || description != null) && (
            <div className="oc-modal-header">
              {title != null && <h2 className="oc-modal-title" id={titleId}>{title}</h2>}
              {description != null && <p className="oc-modal-description">{description}</p>}
            </div>
          )}
          {children}
          {footer != null && <div className="oc-modal-footer">{footer}</div>}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});

/** A button that closes the surrounding Modal / AlertDialog / Sheet. */
export const ModalClose = forwardRef<HTMLButtonElement, ButtonProps>(function ModalClose({ onClick, ...rest }, ref) {
  const ctx = useDialogContext();
  return (
    <Button
      ref={ref}
      type="button"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.close();
      }}
    />
  );
});
