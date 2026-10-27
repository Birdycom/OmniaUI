import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockHeroProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small badge above the headline. */
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons row (`oc-block-hero-actions`). */
  actions?: ReactNode;
}

/** `.oc-block-hero`: centered hero with badge, headline, text and actions. */
export const BlockHero = forwardRef<HTMLDivElement, BlockHeroProps>(function BlockHero(
  { badge, title, description, actions, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-hero", className)} {...rest}>
      {badge != null && <span className="oc-block-hero-badge">{badge}</span>}
      <h1>{title}</h1>
      {description != null && <p>{description}</p>}
      {actions != null && <div className="oc-block-hero-actions">{actions}</div>}
    </div>
  );
});
