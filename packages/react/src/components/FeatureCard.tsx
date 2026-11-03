// Same markup as packages/ui/snippets/feature-card.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FeatureCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Icon in the tile: an <iconify-icon>, an <Icon> or any node. */
  icon?: ReactNode;
  /** Accent preset of the tile (green, violet …). */
  accent?: string;
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4;
}

/** Service or feature card (`.oc-feature-card`): tile, title, text (children). */
export const FeatureCard = forwardRef<HTMLElement, FeatureCardProps>(function FeatureCard(
  { title, icon, accent, headingLevel = 3, className, children, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as "h3";
  return (
    <article ref={ref} className={cx("oc-feature-card", className)} {...rest}>
      {icon != null && <span className={cx("oc-icon-tile oc-icon-tile--sm", accent && `oc-accent--${accent}`)} aria-hidden="true">{icon}</span>}
      <H className="oc-feature-card__title">{title}</H>
      {children != null && <p className="oc-feature-card__text">{children}</p>}
    </article>
  );
});
