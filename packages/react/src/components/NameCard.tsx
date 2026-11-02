"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { DetailsHTMLAttributes, ReactNode } from "react";
import { bindNameCard } from "../../../ui/src/form-extras.js";
import { cx } from "../utils";
import { Icon } from "./Icon";

export interface NameCardProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  name: string;
  /** Amount on the right (already formatted, e.g. "€ 1.940,00"). */
  amount?: ReactNode;
  /** Quiet extra after the name ("6 articles"). */
  meta?: ReactNode;
  /** Buttons on the right (e.g. a soft destructive delete). */
  actions?: ReactNode;
  /** Show the rename pencil; onRename gets the new name. */
  onRename?: (name: string) => void;
  /** Amount in the primary color (a total). */
  total?: boolean;
}

/** `<details class="oc-name-card">`: name, rename pencil, amount and actions in the header; children are the content. */
export const NameCard = forwardRef<HTMLDetailsElement, NameCardProps>(function NameCard(
  { name, amount, meta, actions, onRename, total, className, children, ...rest },
  ref,
) {
  const own = useRef<HTMLDetailsElement | null>(null);
  const renameRef = useRef(onRename);
  renameRef.current = onRename;
  useEffect(() => {
    const el = own.current;
    if (!el || !onRename) return;
    bindNameCard(el);
    const handler = (event: Event) => renameRef.current?.((event as CustomEvent<{ name: string }>).detail.name);
    el.addEventListener("oc-namecard-rename", handler);
    return () => el.removeEventListener("oc-namecard-rename", handler);
  }, [Boolean(onRename)]);
  return (
    <details
      ref={(node) => { own.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
      className={cx("oc-name-card", total && "oc-name-card--total", className)}
      {...rest}
    >
      <summary className="oc-name-card__head">
        <span className="oc-name-card__title">{name}</span>
        {onRename && (
          <button type="button" className="oc-btn oc-btn--plain" data-oc-rename="" aria-label={`Rename ${name}`} title="Rename">
            <Icon d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z" />
          </button>
        )}
        {meta != null && <span className="oc-name-card__meta">{meta}</span>}
        {amount != null && <span className="oc-name-card__amount">{amount}</span>}
        {actions && <span className="oc-name-card__actions">{actions}</span>}
      </summary>
      <div className="oc-name-card__body">{children}</div>
    </details>
  );
});
