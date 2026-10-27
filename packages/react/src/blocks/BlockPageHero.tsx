import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockPageHeroProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** `.oc-hero`: page header with eyebrow, title, text and actions. */
export const BlockPageHero = forwardRef<HTMLElement, BlockPageHeroProps>(function BlockPageHero(
  { eyebrow, title, description, actions, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cx("oc-hero", className)} {...rest}>
      {eyebrow != null && <span className="oc-hero-eyebrow">{eyebrow}</span>}
      <h1 className="oc-hero-title">{title}</h1>
      {description != null && <p className="oc-hero-text">{description}</p>}
      {actions != null && <div className="oc-hero-actions">{actions}</div>}
    </section>
  );
});
