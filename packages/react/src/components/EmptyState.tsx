import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  /** Explanation (`oc-empty-text`). */
  description?: ReactNode;
  /** Buttons row (`oc-empty-actions`). */
  actions?: ReactNode;
}

/** `<div class="oc-empty">` for lists without data. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, actions, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-empty", className)} {...rest}>
      {icon != null && <span className="oc-empty-icon" aria-hidden="true">{icon}</span>}
      <h3 className="oc-empty-title">{title}</h3>
      {description != null && <p className="oc-empty-text">{description}</p>}
      {actions != null && <div className="oc-empty-actions">{actions}</div>}
    </div>
  );
});
