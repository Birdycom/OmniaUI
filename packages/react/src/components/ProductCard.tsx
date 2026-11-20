// File: packages/react/src/components/ProductCard.tsx
// Map: types -> ProductCard (a or article.oc-product-card -> top -> name + badge -> tagline -> summary -> more) -> fly-in (fly.js)
// Same markup as the product cards in packages/ui/snippets/fly-in.html.
"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useMergedRef } from "../hooks";
import { initFly } from "../../../ui/src/fly.js";

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  name: ReactNode;
  /** The card is a link (<a>); without it an <article>. */
  href?: string;
  /** Short line in the accent color under the name. */
  tagline?: ReactNode;
  /** Muted text; children are used when this is left out. */
  summary?: ReactNode;
  /** "Read more" line with an arrow at the bottom; leave out for none. */
  more?: ReactNode;
  /** A small label after the name ("New"), `.oc-product-card__badge.oc-pill.oc-pill--accent`. */
  badge?: ReactNode;
  /** Accent preset (blue, green, violet …): `oc-accent--{accent}`. */
  accent?: string;
  /** Row above the name (`__top`): a product mark, a tile or a status pill. */
  top?: ReactNode;
  /** Heading level of the name (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** Fly in from the middle of its row when it scrolls into view (`.oc-reveal--fly`, started with fly.js). */
  fly?: boolean;
  /** Own start offset of the fly-in ("-120px"); fly.js sets one per card when left out. */
  flyX?: string;
}

/** `.oc-product-card`: product or service card with a hover lift and an accent glow; optional fly-in. */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard(
  { name, href, tagline, summary, more, badge, accent, top, headingLevel = 3, fly, flyX, className, style, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLElement>(null);
  const ref = useMergedRef(inner, forwardedRef);

  useEffect(() => {
    const el = inner.current;
    if (!fly || !el) return;
    // A scope with only this card: fly.js still reads its row from the parent, and no card is watched twice.
    const scope = { ownerDocument: el.ownerDocument, querySelectorAll: (sel: string) => (el.matches(sel) ? [el] : []) } as unknown as ParentNode;
    return initFly(scope);
  }, [fly]);

  const H = `h${headingLevel}` as "h3";
  const cls = cx("oc-product-card", fly && "oc-reveal--fly", accent && `oc-accent--${accent}`, className);
  const vars = flyX ? ({ "--oc-fly-x": flyX } as CSSProperties) : undefined;
  const body = (
    <>
      {top != null && <div className="oc-product-card__top">{top}</div>}
      <H className="oc-product-card__name">
        {name}
        {badge != null && <> <span className="oc-product-card__badge oc-pill oc-pill--accent">{badge}</span></>}
      </H>
      {tagline != null && <p className="oc-product-card__tagline">{tagline}</p>}
      {(summary ?? children) != null && <p className="oc-product-card__summary">{summary ?? children}</p>}
      {more != null && <span className="oc-product-card__more">{more}</span>}
    </>
  );
  if (href !== undefined) {
    return <a ref={ref as never} className={cls} href={href} style={{ ...vars, ...style }} {...rest}>{body}</a>;
  }
  return <article ref={ref as never} className={cls} style={{ ...vars, ...style }} {...rest}>{body}</article>;
});
