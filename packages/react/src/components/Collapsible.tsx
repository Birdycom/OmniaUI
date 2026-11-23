"use client";

import { forwardRef } from "react";
import type { DetailsHTMLAttributes, ReactNode, SyntheticEvent } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";
import { useControllable } from "../hooks";

export interface CollapsibleProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "open" | "onToggle"> {
  /** Summary text (`oc-collapsible-title`). */
  title: ReactNode;
  /** Optional leading icon, e.g. an inline `<svg className="oc-collapsible-icon">`. */
  icon?: ReactNode;
  /** Compact paddings. */
  dense?: boolean;
  /** No card: for a list of sections inside a panel (`oc-collapsible--plain`). */
  plain?: boolean;
  /** A tip the user opens on purpose (`oc-collapsible--hint`, a lightbulb unless you pass `icon`). */
  hint?: boolean;
  /** A pill in the header before the chevron ("−5 points", a count). */
  meta?: ReactNode;
  /** Once opened it stays open (a seen hint stays seen). */
  once?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** `<details class="oc-collapsible">` card-style section. */
export const Collapsible = forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible(
  { title, icon, dense, plain, hint, meta, once, open, defaultOpen, onOpenChange, className, children, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  return (
    <details
      ref={ref}
      className={cx("oc-collapsible", dense && "oc-collapsible--dense", plain && "oc-collapsible--plain", hint && "oc-collapsible--hint", className)}
      open={isOpen}
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => {
        if (once && isOpen && !e.currentTarget.open) { e.currentTarget.open = true; return; }
        if (e.currentTarget.open !== isOpen) setOpen(e.currentTarget.open);
      }}
      {...rest}
    >
      <summary>
        {icon != null ? webiconNode(icon) : hint ? <span className="oc-collapsible-icon" aria-hidden="true">{webiconNode("mdi:lightbulb-on-outline")}</span> : null}
        <span className="oc-collapsible-title">{title}</span>
        {meta != null && <span className="oc-collapsible-meta">{meta}</span>}
      </summary>
      <div className="oc-collapsible-content">{children}</div>
    </details>
  );
});
