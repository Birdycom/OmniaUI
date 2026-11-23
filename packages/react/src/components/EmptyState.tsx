import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  /** Explanation (`oc-empty-text`). */
  description?: ReactNode;
  /** Buttons row (`oc-empty-actions`). */
  actions?: ReactNode;
  /** Content that opens later (a zone, a code, a time): dashed frame and a lock icon (unless you pass `icon`). */
  locked?: boolean;
  /** A short line of what is left ("120 m to go"), in a pill. */
  meta?: ReactNode;
}

/** `<div class="oc-empty">` for lists without data. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, actions, locked, meta, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-empty", locked && "oc-empty--locked", className)} {...rest}>
      {(icon ?? (locked ? "mdi:lock-outline" : null)) != null && <span className="oc-empty-icon" aria-hidden="true">{webiconNode(icon ?? "mdi:lock-outline")}</span>}
      <h3 className="oc-empty-title">{title}</h3>
      {description != null && <p className="oc-empty-text">{description}</p>}
      {meta != null && <span className="oc-empty-meta">{meta}</span>}
      {actions != null && <div className="oc-empty-actions">{actions}</div>}
    </div>
  );
});
