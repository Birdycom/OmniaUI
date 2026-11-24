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
  /** Round close button (`oc-close--round`). */
  closeRound?: boolean;
  /** Extra class on the close button. */
  closeClassName?: string;
  /** Glass panel over a live view: see-through (blurred) panel, light scrim without blur (`oc-sheet--glass`). */
  glass?: boolean;
  /** A strip of the page stays free beside the panel on a narrow screen (`oc-sheet--inset`). */
  inset?: boolean;
  /** The footer is a block of content on its own background, not a row of buttons (`oc-sheet-footer--panel`). */
  footerPanel?: boolean;
  /** 0.18.0: the panel floats free of the edge: margin on every side, all corners rounded (`oc-sheet--floating`). */
  floating?: boolean;
  /** 0.18.0: the corners that face the page are rounded (`oc-sheet--rounded`). */
  rounded?: boolean;
}

/** Side panel on `<dialog class="oc-sheet">`. */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(function Sheet(
  { open, defaultOpen, onOpenChange, side = "right", wide, title, description, footer, closeLabel = "Close", closeRound, closeClassName, glass, inset, footerPanel, floating, rounded, className, children, ...rest },
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
      className={cx("oc-sheet", side !== "right" && `oc-sheet--${side}`, glass && "oc-sheet--glass", inset && "oc-sheet--inset", floating && "oc-sheet--floating", rounded && "oc-sheet--rounded", className)}
      aria-labelledby={title != null ? titleId : undefined}
      {...attrs({ closedby: "any" })}
      {...rest}
      onClick={onClick}
      onClose={dlg.onClose}
    >
      <DialogContext.Provider value={{ close: dlg.close }}>
        <div className={cx("oc-sheet-content", wide && "oc-sheet-content--wide")}>
          <button className={cx("oc-sheet-close", closeRound && "oc-close--round", closeClassName)} type="button" aria-label={closeLabel} onClick={dlg.close}>&times;</button>
          {(title != null || description != null) && (
            <div className="oc-sheet-header">
              {title != null && <h2 className="oc-sheet-title" id={titleId}>{title}</h2>}
              {description != null && <p className="oc-sheet-description">{description}</p>}
            </div>
          )}
          <div className="oc-sheet-body">{children}</div>
          {footer != null && <div className={cx("oc-sheet-footer", footerPanel && "oc-sheet-footer--panel")}>{footer}</div>}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
});
