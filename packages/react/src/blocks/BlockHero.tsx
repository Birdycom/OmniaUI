import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockHeroProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small badge above the headline. */
  badge?: ReactNode;
  title: ReactNode;
  /** 0.17.0: heading level of the title (default 1; 2 for a hero lower on the page, same look). */
  headingLevel?: 1 | 2;
  description?: ReactNode;
  /** Buttons row (`oc-block-hero-actions`). */
  actions?: ReactNode;
}

/** `.oc-block-hero`: centered hero with badge, headline, text and actions. */
export const BlockHero = forwardRef<HTMLDivElement, BlockHeroProps>(function BlockHero(
  { badge, title, headingLevel = 1, description, actions, className, ...rest },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <div ref={ref} className={cx("oc-block-hero", className)} {...rest}>
      {badge != null && <span className="oc-block-hero-badge">{badge}</span>}
      <Heading>{title}</Heading>
      {description != null && <p>{description}</p>}
      {actions != null && <div className="oc-block-hero-actions">{actions}</div>}
    </div>
  );
});
