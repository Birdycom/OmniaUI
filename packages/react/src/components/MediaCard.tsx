// File: packages/react/src/components/MediaCard.tsx
// Map: props -> MediaCard (MediaThumb -> body: avatar, title link + meta, menu button -> popover menu)
// Same markup as packages/ui/snippets/media-card.html.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { MediaThumb } from "./MediaThumb";
import type { MediaThumbProps } from "./MediaThumb";

export interface MediaCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Link of the title; it covers the whole card. */
  href: string;
  /** "Channel · 24K views · 3 days ago". */
  meta?: ReactNode;
  /** Initials, an <img>, or any node. Leave out for no avatar. */
  avatar?: ReactNode;
  /** Props for the MediaThumb on top (src, duration, progress, …). */
  thumb?: MediaThumbProps;
  /** Items of the ⋮ menu (`.oc-dropdown-item` elements). No menu button when empty. */
  menu?: ReactNode;
  compact?: boolean;
}

/** `article.oc-media-card`. */
export const MediaCard = forwardRef<HTMLElement, MediaCardProps>(function MediaCard(
  { title, href, meta, avatar, thumb, menu, compact, className, ...rest },
  ref,
) {
  const menuId = `oc-media-card-menu-${useId().replace(/:/g, "")}`;
  return (
    <article ref={ref} className={cx("oc-media-card", compact && "oc-media-card--compact", className)} {...rest}>
      <MediaThumb {...thumb} />
      <div className="oc-media-card__body">
        {avatar != null && <span className="oc-media-card__avatar" aria-hidden="true">{avatar}</span>}
        <div className="oc-media-card__text">
          <h3 className="oc-media-card__title"><a href={href}>{title}</a></h3>
          {meta != null && <p className="oc-media-card__meta">{meta}</p>}
        </div>
        {menu != null && (
          <button type="button" className="oc-media-card__menu" aria-label="More actions" {...attrs({ popovertarget: menuId })}>&#8942;</button>
        )}
      </div>
      {menu != null && <div className="oc-dropdown-menu" id={menuId} {...attrs({ popover: "" })}>{menu}</div>}
    </article>
  );
});
