// File: packages/react/src/components/Drawer.tsx
// Map: props (title, description, footer, trigger) -> trigger button (invoker command + state) -> dialog.oc-drawer
//      (handle, header, body, footer) -> DrawerClose
// Same markup as packages/ui/snippets/drawer.html.
"use client";

import { forwardRef, useId, useRef } from "react";
import type { DialogHTMLAttributes, MouseEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { DialogContext, useDialog, useDialogContext, useMergedRef } from "../hooks";
import type { DialogState } from "../hooks";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface DrawerProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose">, DialogState {
  /** Heading (`oc-drawer-title`). */
  title?: ReactNode;
  /** Muted text under the title (`oc-drawer-description`). */
  description?: ReactNode;
  /** Stacked actions (`oc-drawer-footer`). Use `<DrawerClose>` for buttons that close the drawer. */
  footer?: ReactNode;
  /** Centered panel from 40rem up (`oc-drawer--center`). */
  center?: boolean;
  /** Close when the backdrop is clicked (native `closedby="any"`). Default true. */
  closeOnBackdrop?: boolean;
  /** Content of a trigger button rendered before the dialog (`command="show-modal"`). */
  trigger?: ReactNode;
  /** Props for the trigger button (default variant `outline`). */
  triggerProps?: ButtonProps;
}

/**
 * Bottom sheet on a native `<dialog class="oc-drawer">`. The `open` prop is synced to showModal() / close();
 * the optional trigger also carries the invoker command (`command="show-modal"`), so it opens before hydration too.
 */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(function Drawer(
  { open, defaultOpen, onOpenChange, title, description, footer, center, closeOnBackdrop = true, trigger, triggerProps, id, className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const auto = useId().replace(/:/g, "");
  const dialogId = id ?? `oc-drawer-${auto}`;
  const titleId = `${dialogId}-title`;
  const dlg = useDialog(inner, { open, defaultOpen, onOpenChange });
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    rest.onClick?.(e);
    if (closeOnBackdrop && e.target === e.currentTarget) dlg.close();
  };
  return (
    <>
      {trigger != null && (
        <Button
          variant="outline"
          type="button"
          {...attrs({ command: "show-modal", commandfor: dialogId })}
          {...triggerProps}
          onClick={(e) => {
            triggerProps?.onClick?.(e);
            if (!e.defaultPrevented) dlg.setOpen(true);
          }}
        >
          {trigger}
        </Button>
      )}
      <dialog
        ref={ref}
        id={dialogId}
        className={cx("oc-drawer", center && "oc-drawer--center", className)}
        aria-labelledby={title != null ? titleId : undefined}
        {...attrs({ closedby: closeOnBackdrop ? "any" : "closerequest" })}
        {...rest}
        onClick={onClick}
        onClose={dlg.onClose}
      >
        <DialogContext.Provider value={{ close: dlg.close }}>
          <div className="oc-drawer-content">
            <div className="oc-drawer-handle" aria-hidden="true" />
            {(title != null || description != null) && (
              <div className="oc-drawer-header">
                {title != null && <h2 className="oc-drawer-title" id={titleId}>{title}</h2>}
                {description != null && <p className="oc-drawer-description">{description}</p>}
              </div>
            )}
            {children != null && <div className="oc-drawer-body">{children}</div>}
            {footer != null && <div className="oc-drawer-footer">{footer}</div>}
          </div>
        </DialogContext.Provider>
      </dialog>
    </>
  );
});

/** A button that closes the surrounding Drawer. */
export const DrawerClose = forwardRef<HTMLButtonElement, ButtonProps>(function DrawerClose({ onClick, ...rest }, ref) {
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
