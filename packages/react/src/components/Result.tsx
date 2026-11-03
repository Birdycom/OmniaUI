// Same markup as packages/ui/snippets/result.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Icon in the tile: an <iconify-icon>, an <Icon> or any node. */
  icon?: ReactNode;
  /** Accent preset of the tile (green, orange, red …). */
  accent?: string;
  /** Buttons under the text. */
  actions?: ReactNode;
  center?: boolean;
}

/** Outcome of an action in place of the form (`.oc-result`, role="status"); children = the text. */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  { title, icon, accent, actions, center = false, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-result", center && "oc-result--center", className)} role="status" tabIndex={-1} {...rest}>
      {icon != null && <span className={cx("oc-icon-tile oc-icon-tile--sm", accent && `oc-accent--${accent}`)} aria-hidden="true">{icon}</span>}
      <h2 className="oc-result__title">{title}</h2>
      {children != null && <p className="oc-result__text">{children}</p>}
      {actions != null && <div className="oc-result__actions">{actions}</div>}
    </div>
  );
});
