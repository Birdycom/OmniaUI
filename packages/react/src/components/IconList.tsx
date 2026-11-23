// File: packages/react/src/components/IconList.tsx
// Map: types -> IconList (pills + tagline -> ul.oc-icon-list: icon rows | --points: tile + title + text | ul.oc-list--accent: plain points -> note)
// Same markup as packages/ui/snippets/icon-list.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";

export interface IconListItem {
  /** Webicon name ("mdi:shield-lock-outline", inline SVG) or any node. Not used by the accent list. */
  icon?: ReactNode;
  /** Row text; with `points` the muted line under the title. */
  text?: ReactNode;
  /** Title of a point (`points` only). */
  title?: ReactNode;
  /** Accent preset of the tile of a point (green, violet …); the list's `accent` when left out. */
  accent?: string;
}

export interface IconListProps extends HTMLAttributes<HTMLUListElement> {
  items: IconListItem[];
  /** icons = rows with an icon in a frame; points = icon tile, title and text; accent = disc list with accent markers. */
  variant?: "icons" | "points" | "accent";
  /** Accent preset for every tile of a points list. */
  accent?: string;
  /** Pills above the list (`div.oc-badge-row` of `span.oc-pill`). */
  pills?: ReactNode[];
  /** Tagline above the list, in the accent color (`p.oc-tagline--accent`). */
  tagline?: ReactNode;
  /** Small muted note under the list (`p.oc-note`). */
  note?: ReactNode;
}

/** `ul.oc-icon-list` (rows or points) or `ul.oc-list--accent`: lists for a company site. */
export const IconList = forwardRef<HTMLUListElement, IconListProps>(function IconList(
  { items, variant = "icons", accent, pills, tagline, note, className, ...rest },
  ref,
) {
  const points = variant === "points";
  const list = variant === "accent" ? (
    <ul ref={ref} className={cx("oc-list--accent", className)} {...rest}>
      {items.map((item, i) => <li key={i}>{item.text}</li>)}
    </ul>
  ) : (
    <ul ref={ref} className={cx("oc-icon-list", points && "oc-icon-list--points", className)} {...rest}>
      {items.map((item, i) => {
        const tone = item.accent ?? accent;
        if (!points) {
          // The icon is a direct child of the li (the CSS frames li > svg / iconify-icon); a webicon is aria-hidden itself.
          return <li key={i}>{item.icon != null && webiconNode(item.icon)}{item.text}</li>;
        }
        return (
          <li key={i}>
            <span className={cx("oc-icon-tile oc-icon-tile--sm", tone && `oc-accent--${tone}`)} aria-hidden="true">{webiconNode(item.icon)}</span>
            {item.title != null && <span className="oc-icon-list__title">{item.title}</span>}
            {item.text != null && <span className="oc-icon-list__text">{item.text}</span>}
          </li>
        );
      })}
    </ul>
  );
  // Pills and tagline above the list, a note under it (0.17.0); without them the list stands alone as before.
  if (!pills?.length && tagline == null && note == null) return list;
  return (
    <>
      {pills?.length ? <div className="oc-badge-row">{pills.map((pill, i) => <span key={i} className="oc-pill">{pill}</span>)}</div> : null}
      {tagline != null && <p className="oc-tagline--accent">{tagline}</p>}
      {list}
      {note != null && <p className="oc-note">{note}</p>}
    </>
  );
});
