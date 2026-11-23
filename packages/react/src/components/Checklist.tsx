import { forwardRef } from "react";
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ChecklistProps extends HTMLAttributes<HTMLUListElement> {
  /** Bordered rows with an action slot. */
  card?: boolean;
  /**
   * default: rules / steps with a met and unmet state (`ul.oc-checklist`). check (0.17.0): the short showcase list with a
   * check mark before every line (`ul.oc-check-list`), for selling points; pass the lines as `items` or as `<li>` children.
   */
  variant?: "default" | "check";
  /** Check variant: the lines. */
  items?: ReactNode[];
}

/** `<ul class="oc-checklist">`, or `<ul class="oc-check-list">` with `variant="check"`. */
export const Checklist = forwardRef<HTMLUListElement, ChecklistProps>(function Checklist({ card, variant = "default", items, className, children, ...rest }, ref) {
  if (variant === "check") {
    return (
      <ul ref={ref} className={cx("oc-check-list", className)} {...rest}>
        {items?.map((item, i) => <li key={i}>{item}</li>)}
        {children}
      </ul>
    );
  }
  return <ul ref={ref} className={cx("oc-checklist", card && "oc-checklist--card", className)} {...rest}>{children}</ul>;
});

export interface ChecklistItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Rule is met / step is done (`is-done`). */
  done?: boolean;
  /** Card variant: title + hint text column. Without it `children` are the row content. */
  title?: ReactNode;
  hint?: ReactNode;
  /** Card variant: trailing action (usually a button or link). */
  action?: ReactNode;
}

/** `<li class="oc-checklist-item is-done">` */
export const ChecklistItem = forwardRef<HTMLLIElement, ChecklistItemProps>(function ChecklistItem(
  { done, title, hint, action, className, children, ...rest },
  ref,
) {
  return (
    <li ref={ref} className={cx("oc-checklist-item", done && "is-done", className)} {...rest}>
      {title != null ? (
        <>
          <span className="oc-checklist-text">
            <span className="oc-checklist-title">{title}</span>
            {hint != null && <span className="oc-checklist-hint">{hint}</span>}
          </span>
          {action}
        </>
      ) : (
        children
      )}
    </li>
  );
});
