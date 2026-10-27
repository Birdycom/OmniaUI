"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useDialog, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";

export type SheetSide = "right" | "left" | "top" | "bottom";

export interface SheetProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  /** Edge the panel slides from (default `right`). */
  side?: SheetSide;
  /** Wider panel (`oc-sheet-content--wide`). */
  wide?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  /** Action row (`oc-sheet-footer`). */
  footer?: ReactNode;
  /** Accessible name of the close button. */
  closeLabel?: string;
}

/** Side panel on `<dialog class="oc-sheet">`. */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(function Sheet(
  { open, defaultOpen, onOpenChange, side = "right", wide, title, description, footer, closeLabel = "Close", className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const titleId = useId();
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    rest.onClick?.(e);
    if (e.target === e.currentTarget) dlg.close();
  };
  return (
    <dialog
      ref={ref}
      className={cx("oc-sheet", side !== "right" && `oc-sheet--${side}`, className)}
      aria-labelledby={title != null ? titleId : undefined}
      {...attrs({ closedby: "any" })}
      {...rest}
      onClick={onClick}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className={cx("oc-sheet-content", wide && "oc-sheet-content--wide")}>
          <button className="oc-sheet-close" type="button" aria-label={closeLabel} onClick={dlg.close}>&times;</button>
          {(title != null || description != null) && (
            <div className="oc-sheet-header">
              {title != null && <h2 className="oc-sheet-title" id={titleId}>{title}</h2>}
              {description != null && <p className="oc-sheet-description">{description}</p>}
            </div>
          )}
          <div className="oc-sheet-body">{children}</div>
          {footer != null && <div className="oc-sheet-footer">{footer}</div>}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});
