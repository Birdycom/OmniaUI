"use client";

import { forwardRef } from "react";
import type { DetailsHTMLAttributes, ReactNode, SyntheticEvent } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface CollapsibleProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "open" | "onToggle"> {
  /** Summary text (`oc-collapsible-title`). */
  title: ReactNode;
  /** Optional leading icon, e.g. an inline `<svg className="oc-collapsible-icon">`. */
  icon?: ReactNode;
  /** Compact paddings. */
  dense?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** `<details class="oc-collapsible">` card-style section. */
export const Collapsible = forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible(
  { title, icon, dense, open, defaultOpen, onOpenChange, className, children, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  return (
    <details
      ref={ref}
      className={cx("oc-collapsible", dense && "oc-collapsible--dense", className)}
      open={isOpen}
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => {
        if (e.currentTarget.open !== isOpen) setOpen(e.currentTarget.open);
      }}
      {...rest}
    >
      <summary>
        {icon}
        <span className="oc-collapsible-title">{title}</span>
      </summary>
      <div className="oc-collapsible-content">{children}</div>
    </details>
  );
});
