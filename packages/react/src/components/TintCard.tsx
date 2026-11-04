// Same markup as packages/ui/snippets/tint-card.html.
import { createElement, forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "../utils";

export type TintCardTone = "primary" | "success" | "warning" | "destructive" | "info" | "muted";

export interface TintCardProps extends Omit<AnchorHTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Large outline webicon in the corner: a name (`"mdi-light:truck"`) or any node. */
  icon?: ReactNode;
  /** Color of the card (default primary). For your own color set `style={{ "--oc-tint": "#e8590c" }}`. */
  tone?: TintCardTone;
  /** Line at the bottom in the tint (12 modules, New). */
  meta?: ReactNode;
  /** Larger card for a row of two or three. */
  size?: "md" | "lg";
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** Hide the arrow chip. */
  noArrow?: boolean;
  /** Pro shape (`.oc-tint-card--fill`, needs OmniaUI Pro CSS): the icon inside the card fills up on hover. */
  fill?: boolean;
}

const webicon = (icon: ReactNode, className?: string) =>
  typeof icon === "string" ? createElement("iconify-icon", { icon, className, "aria-hidden": "true" }) : icon;

/** Link card tinted in one color, with a large drifting webicon in the corner (`.oc-tint-card`); children = the text.
 *  With `href` the card is an `<a>`, without it an `<article>`. */
export const TintCard = forwardRef<HTMLElement, TintCardProps>(function TintCard(
  { title, icon, tone, meta, size, headingLevel = 3, noArrow, fill, href, className, children, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as "h3";
  const classes = cx("oc-tint-card", tone && tone !== "primary" && `oc-tint-card--${tone}`, size === "lg" && "oc-tint-card--lg", fill && "oc-tint-card--fill", className);
  const body = (
    <>
      {icon != null && (typeof icon === "string" ? webicon(icon, "oc-tint-card__art") : <span className="oc-tint-card__art" aria-hidden="true">{icon}</span>)}
      <div className="oc-tint-card__head">
        <H className="oc-tint-card__title">{title}</H>
        {!noArrow && <span className="oc-tint-card__go" aria-hidden="true">{webicon("material-symbols:arrow-outward-rounded")}</span>}
      </div>
      {children != null && <p className="oc-tint-card__text">{children}</p>}
      {meta != null && <p className="oc-tint-card__meta">{meta}</p>}
    </>
  );
  return href != null ? (
    <a ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} {...rest}>{body}</a>
  ) : (
    <article ref={ref} className={classes} {...(rest as object)}>{body}</article>
  );
});
