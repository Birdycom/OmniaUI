// File: packages/react/src/components/MediaRow.tsx
// Map: MediaRowList (ul / ol, numbered) -> MediaRow (MediaThumb -> title link + meta -> menu button + popover)
// Same markup as packages/ui/snippets/media-row.html.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { MediaThumb } from "./MediaThumb";
import type { MediaThumbProps } from "./MediaThumb";

export interface MediaRowListProps extends HTMLAttributes<HTMLElement> {
  /** Numbered playlist: renders an <ol> with a counter column. */
  numbered?: boolean;
}

/** `ul.oc-media-row-list` or `ol.oc-media-row-list--numbered`. */
export const MediaRowList = forwardRef<HTMLElement, MediaRowListProps>(function MediaRowList({ numbered, className, ...rest }, ref) {
  const Tag = (numbered ? "ol" : "ul") as "ul";
  return <Tag ref={ref as React.Ref<HTMLUListElement>} className={cx("oc-media-row-list", numbered && "oc-media-row-list--numbered", className)} {...(rest as HTMLAttributes<HTMLUListElement>)} />;
});

export interface MediaRowProps extends Omit<HTMLAttributes<HTMLLIElement>, "title"> {
  title: ReactNode;
  href: string;
  meta?: ReactNode;
  thumb?: MediaThumbProps;
  /** Now playing (`aria-current="true"`). */
  current?: boolean;
  /** Items of the ⋮ menu. No menu button when empty. */
  menu?: ReactNode;
}

/** `li.oc-media-row`: thumb | title + meta | menu. */
export const MediaRow = forwardRef<HTMLLIElement, MediaRowProps>(function MediaRow(
  { title, href, meta, thumb, current, menu, className, ...rest },
  ref,
) {
  const menuId = `oc-media-row-menu-${useId().replace(/:/g, "")}`;
  return (
    <li ref={ref} className={cx("oc-media-row", className)} aria-current={current ? "true" : undefined} {...rest}>
      <MediaThumb {...thumb} />
      <div className="oc-media-row__text">
        <h3 className="oc-media-row__title"><a href={href}>{title}</a></h3>
        {meta != null && <p className="oc-media-row__meta">{meta}</p>}
      </div>
      {menu != null && (
        <>
          <button type="button" className="oc-media-row__menu" aria-label="More actions" {...attrs({ popovertarget: menuId })}>&#8942;</button>
          <div className="oc-dropdown-menu" id={menuId} {...attrs({ popover: "" })}>{menu}</div>
        </>
      )}
    </li>
  );
});
