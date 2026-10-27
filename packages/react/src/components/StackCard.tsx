// File: packages/react/src/components/StackCard.tsx
// Map: props -> StackCard (deck: MediaThumb cover + count badge -> title link + meta)
// Same markup as packages/ui/snippets/stack-card.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { MediaThumb } from "./MediaThumb";
import type { MediaThumbProps } from "./MediaThumb";

export interface StackCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Link of the title; it covers the whole card. */
  href: string;
  meta?: ReactNode;
  /** Badge text, e.g. "12 videos". */
  count?: ReactNode;
  /** Show the count as a side panel (`--panel`). */
  panel?: boolean;
  /** Props for the cover (MediaThumb). */
  thumb?: MediaThumbProps;
}

/** `article.oc-stack-card`: cover with two layers behind it and a count badge. */
export const StackCard = forwardRef<HTMLElement, StackCardProps>(function StackCard(
  { title, href, meta, count, panel, thumb, className, ...rest },
  ref,
) {
  return (
    <article ref={ref} className={cx("oc-stack-card", panel && "oc-stack-card--panel", className)} {...rest}>
      <div className="oc-stack-card__deck">
        <MediaThumb {...thumb} />
        {count != null && <span className="oc-stack-card__count">{count}</span>}
      </div>
      <div>
        <h3 className="oc-stack-card__title"><a href={href}>{title}</a></h3>
        {meta != null && <p className="oc-stack-card__meta">{meta}</p>}
      </div>
    </article>
  );
});
