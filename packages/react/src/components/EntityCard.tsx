// File: packages/react/src/components/EntityCard.tsx
// Map: props -> EntityCard (grid: frame (img / glyph / media) | body (eyebrow, title, description, facts, children) -> footer)
// Same markup as packages/ui/snippets/entity-card.html.
import { Fragment, forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface EntityCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Picture in the frame. */
  src?: string;
  alt?: string;
  /** Large character or icon in the frame (when there is no `src`). */
  glyph?: ReactNode;
  /** Anything else for the frame (svg, placeholder art). Wins over src / glyph. */
  media?: ReactNode;
  /** Keep a margin around a logo / symbol picture (`__frame--contain`). */
  contain?: boolean;
  /** Key / value facts, rendered as a <dl>. */
  facts?: Array<[ReactNode, ReactNode]>;
  /** Tags or actions under a divider. */
  footer?: ReactNode;
  stacked?: boolean;
  size?: "sm" | "md";
}

/** `article.oc-entity-card`: framed media cell + detail column. */
export const EntityCard = forwardRef<HTMLElement, EntityCardProps>(function EntityCard(
  { title, eyebrow, description, src, alt = "", glyph, media, contain, facts, footer, stacked, size = "md", className, children, ...rest },
  ref,
) {
  const frame = media ?? (src ? <img src={src} alt={alt} /> : glyph != null ? <span className="oc-entity-card__glyph" aria-hidden="true">{glyph}</span> : null);
  return (
    <article ref={ref} className={cx("oc-entity-card", stacked && "oc-entity-card--stacked", size === "sm" && "oc-entity-card--sm", className)} {...rest}>
      <div className="oc-entity-card__grid">
        <div className={cx("oc-entity-card__frame", contain && "oc-entity-card__frame--contain")}>{frame}</div>
        <div className="oc-entity-card__body">
          {eyebrow != null && <p className="oc-entity-card__eyebrow">{eyebrow}</p>}
          <h3 className="oc-entity-card__title">{title}</h3>
          {description != null && <p className="oc-entity-card__description">{description}</p>}
          {facts && facts.length > 0 && (
            <dl className="oc-entity-card__facts">
              {facts.map(([k, v], i) => (
                <Fragment key={i}><dt>{k}</dt><dd>{v}</dd></Fragment>
              ))}
            </dl>
          )}
          {children}
        </div>
      </div>
      {footer != null && <div className="oc-entity-card__footer">{footer}</div>}
    </article>
  );
});
