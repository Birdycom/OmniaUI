import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ShowcaseProject {
  href: string;
  accent?: string;
  /** CSS `background` of the browser frame body (e.g. a gradient of palette variables) or an image URL via `image`. */
  background?: string;
  image?: string;
  imageAlt?: string;
  pill?: ReactNode;
  name: ReactNode;
  summary?: ReactNode;
  more?: ReactNode;
}

export interface BlockShowcaseProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  /** Display title; wrap a word in `<span className="oc-text-gradient">`. */
  title: ReactNode;
  projects: ShowcaseProject[];
  /** Minimum card width (`--oc-card-min`, default 26rem). */
  cardMin?: string;
}

/** Portfolio grid: project cards with a browser frame around the screenshot. */
export const BlockShowcase = forwardRef<HTMLElement, BlockShowcaseProps>(function BlockShowcase(
  { eyebrow, title, projects, cardMin = "26rem", className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-section-pad", className)} {...rest}>
      <div className="oc-container">
        {eyebrow != null && <p className="oc-eyebrow">{eyebrow}</p>}
        <h2 className="oc-display oc-display--md">{title}</h2>
        <div className="oc-card-grid" style={{ "--oc-card-min": cardMin } as CSSProperties}>
          {projects.map((p, i) => (
            <a className={cx("oc-product-card", p.accent && `oc-accent--${p.accent}`, "p-0 overflow-hidden")} href={p.href} key={i}>
              <span className="oc-browser-frame m-1">
                <span className="oc-browser-frame__bar"><i /><i /><i /></span>
                <span className="oc-browser-frame__body" style={p.background ? { background: p.background } : undefined}>
                  {p.image && <img src={p.image} alt={p.imageAlt ?? ""} />}
                </span>
              </span>
              <span className="grid gap-0.5 p-1.5 pt-0">
                {p.pill != null && <span className="oc-pill oc-pill--accent">{p.pill}</span>}
                <span className="oc-product-card__name">{p.name}</span>
                {p.summary != null && <span className="oc-product-card__summary">{p.summary}</span>}
                {p.more != null && <span className="oc-product-card__more">{p.more}</span>}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
