"use client";

import { createContext, forwardRef, useContext, useId, useRef } from "react";
import type { DialogHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useControllable, useDialog, useDialogContext, useMergedRef } from "../hooks";
import { mergeIntoChild } from "../asChild";
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
  /** A close button (×) in the corner; on by itself when `closeRound` or `closeClassName` is set. */
  closeButton?: boolean;
  /** Accessible name of the close button (default "Close"). */
  closeLabel?: string;
  /** Round close button (`oc-close--round`). */
  closeRound?: boolean;
  /** Extra class on the close button. */
  closeClassName?: string;
}

/**
 * `<dialog class="oc-modal">`. The `open` prop is synced to showModal() / close() in an effect;
 * Escape and backdrop clicks are reported through `onOpenChange(false)`.
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, defaultOpen, onOpenChange, title, description, footer, size = "md", closeOnBackdrop = true, closeButton, closeLabel = "Close", closeRound, closeClassName, className, children, ...rest },
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
          {(closeButton ?? (closeRound || closeClassName != null)) && (
            <button className={cx("oc-modal-close", closeRound && "oc-close--round", closeClassName)} type="button" aria-label={closeLabel} onClick={dlg.close}>&times;</button>
          )}
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

/* ---------------------------------------------------------------------------------------------
 * Compound Dialog (0.17.0): <Dialog open onOpenChange><DialogTrigger>Open</DialogTrigger><DialogContent>
 * <DialogHeader><DialogTitle/><DialogDescription/></DialogHeader>...<DialogFooter><DialogClose/></DialogFooter>
 * </DialogContent></Dialog>. Same <dialog class="oc-modal"> markup as Modal; Modal itself stays prop-driven.
 * ------------------------------------------------------------------------------------------- */

interface DialogRootContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
}
const DialogRoot = createContext<DialogRootContext | null>(null);

function useDialogRoot(part: string): DialogRootContext {
  const ctx = useContext(DialogRoot);
  if (!ctx) throw new Error(`<${part}> must be used inside <Dialog>.`);
  return ctx;
}

export interface DialogProps extends DialogState {
  children?: ReactNode;
}

/** Root of the compound Dialog: holds the open state (controlled with `open` + `onOpenChange`, or `defaultOpen`). No markup. */
export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const base = `oc-dialog-${useId().replace(/:/g, "")}`;
  return (
    <DialogRoot.Provider value={{ open: isOpen, setOpen, contentId: base, titleId: `${base}-title`, descriptionId: `${base}-description` }}>
      {children}
    </DialogRoot.Provider>
  );
}

export interface DialogTriggerProps extends ButtonProps {
  /** Merge the trigger behaviour into the only child (your own button or link) instead of rendering a Button. */
  asChild?: boolean;
}

/** Opens the Dialog: a Button (default variant), or its only child with `asChild`. */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger({ asChild, onClick, children, ...rest }, ref) {
  const ctx = useDialogRoot("DialogTrigger");
  const props = {
    "aria-haspopup": "dialog" as const,
    "aria-expanded": ctx.open,
    "aria-controls": ctx.contentId,
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    },
  };
  if (asChild) {
    const merged = mergeIntoChild(children, { ...rest, ...props }, ref);
    if (merged) return merged;
  }
  return <Button ref={ref} type="button" {...rest} {...props}>{children}</Button>;
});

export interface DialogContentProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose"> {
  size?: ModalSize;
  /** Close when the backdrop is clicked (native `closedby="any"`). Default true. */
  closeOnBackdrop?: boolean;
  /** A close button (×) in the corner. Default true. */
  closeButton?: boolean;
  /** Accessible name of the close button (default "Close"). */
  closeLabel?: string;
  /** Round close button (`oc-close--round`). */
  closeRound?: boolean;
  /** Header and footer stay put, only the body (`DialogBody`) scrolls (`.oc-modal-content--scroll`). */
  scroll?: boolean;
  /** Class of the inner `.oc-modal-content` (`className` goes to the <dialog>). */
  contentClassName?: string;
}

/** `<dialog class="oc-modal">` of the compound Dialog, synced to the root's open state. */
export const DialogContent = forwardRef<HTMLDialogElement, DialogContentProps>(function DialogContent(
  { size = "md", closeOnBackdrop = true, closeButton = true, closeLabel = "Close", closeRound, scroll, contentClassName, className, children, ...rest },
  forwardedRef,
) {
  const ctx = useDialogRoot("DialogContent");
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const dlg = useDialog(inner, { open: ctx.open, onOpenChange: ctx.setOpen });
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    rest.onClick?.(e);
    if (closeOnBackdrop && e.target === e.currentTarget) dlg.close();
  };
  return (
    <dialog
      ref={ref}
      id={ctx.contentId}
      className={cx("oc-modal", className)}
      aria-labelledby={ctx.titleId}
      aria-describedby={ctx.descriptionId}
      {...attrs({ closedby: closeOnBackdrop ? "any" : "closerequest" })}
      {...rest}
      onClick={onClick}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className={cx("oc-modal-content", size !== "md" && `oc-modal-content--${size}`, scroll && "oc-modal-content--scroll", contentClassName)}>
          {closeButton && (
            <button className={cx("oc-modal-close", closeRound && "oc-close--round")} type="button" aria-label={closeLabel} onClick={dlg.close}>&times;</button>
          )}
          {children}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});

/** DialogContent with `scroll`: header and footer stay, the body scrolls. */
export const DialogScrollContent = forwardRef<HTMLDialogElement, DialogContentProps>(function DialogScrollContent(props, ref) {
  return <DialogContent ref={ref} scroll {...props} />;
});

/** `.oc-modal-header`: wraps DialogTitle and DialogDescription. */
export function DialogHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-modal-header", className)} {...rest} />;
}

/** `h2.oc-modal-title`: the accessible name of the dialog. */
export function DialogTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const ctx = useDialogRoot("DialogTitle");
  return <h2 className={cx("oc-modal-title", className)} id={ctx.titleId} {...rest} />;
}

/** `p.oc-modal-description`: the accessible description of the dialog. */
export function DialogDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const ctx = useDialogRoot("DialogDescription");
  return <p className={cx("oc-modal-description", className)} id={ctx.descriptionId} {...rest} />;
}

/** `.oc-modal-body`: the content between header and footer (the part that scrolls). */
export function DialogBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-modal-body", className)} {...rest} />;
}

/** `.oc-modal-footer`: the button row. */
export function DialogFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-modal-footer", className)} {...rest} />;
}

export interface DialogCloseProps extends ButtonProps {
  /** Merge the close behaviour into the only child instead of rendering a Button. */
  asChild?: boolean;
}

/** Closes the Dialog: a Button, or its only child with `asChild`. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose({ asChild, onClick, children, ...rest }, ref) {
  const ctx = useDialogRoot("DialogClose");
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) ctx.setOpen(false);
  };
  if (asChild) {
    const merged = mergeIntoChild(children, { ...rest, onClick: handle }, ref);
    if (merged) return merged;
  }
  return <Button ref={ref} type="button" {...rest} onClick={handle}>{children}</Button>;
});
