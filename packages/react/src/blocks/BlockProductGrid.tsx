import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface Product {
  href: string;
  /** Accent name (`green`, `orange`, `violet`, `cyan`, ...), applied as `oc-accent--{accent}`. */
  accent?: string;
  /** Glyph or inline SVG in the icon tile. */
  icon?: ReactNode;
  /** Pill label (`Own product`, `Tool`...). */
  pill?: ReactNode;
  name: ReactNode;
  tagline?: ReactNode;
  summary?: ReactNode;
  /** "Discover ..." link text. */
  more?: ReactNode;
}

export interface BlockProductGridProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  products: Product[];
}

/** Section title plus a grid of accent-colored product cards. */
export const BlockProductGrid = forwardRef<HTMLElement, BlockProductGridProps>(function BlockProductGrid(
  { eyebrow, title, products, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container">
        {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
        <h2 className="oc-display oc-display--md">{title}</h2>
        <div className="oc-card-grid">
          {products.map((p, i) => (
            <a className={cx("oc-product-card", p.accent && `oc-accent--${p.accent}`)} href={p.href} key={i}>
              <div className="oc-product-card__top">
                {p.icon != null && <span className="oc-icon-tile" aria-hidden="true">{p.icon}</span>}
                {p.pill != null && <span className="oc-pill">{p.pill}</span>}
              </div>
              <h3 className="oc-product-card__name">{p.name}</h3>
              {p.tagline != null && <p className="oc-product-card__tagline">{p.tagline}</p>}
              {p.summary != null && <p className="oc-product-card__summary">{p.summary}</p>}
              {p.more != null && <span className="oc-product-card__more">{p.more}</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
