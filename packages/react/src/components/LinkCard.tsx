// Same markup as packages/ui/snippets/feature-card.html (link cards).
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LinkCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  title: ReactNode;
  icon?: ReactNode;
  /** Accent preset: the tile and the hover border (violet …). */
  accent?: string;
  /** The "more" line with an arrow. */
  more?: ReactNode;
}

/** A card that is a whole link (`.oc-link-card`): tile, title, text (children), more. */
export const LinkCard = forwardRef<HTMLAnchorElement, LinkCardProps>(function LinkCard(
  { title, icon, accent, more, className, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx("oc-link-card", accent && `oc-accent--${accent}`, className)} {...rest}>
      {icon != null && <span className="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">{icon}</span>}
      <span className="oc-link-card__title">{title}</span>
      {children != null && <span className="oc-link-card__text">{children}</span>}
      {more != null && <span className="oc-link-card__more">{more}</span>}
    </a>
  );
});
