// File: packages/react/src/components/Toc.tsx
// Map: types -> list of links (sub items, current) -> Toc (nav.oc-toc -> title -> groups or one list) -> scroll-spy (toc.js)
// Same markup as packages/ui/snippets/toc.html (groups as in doc-layout.html).
"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useMergedRef } from "../hooks";
import { initToc } from "../../../ui/src/toc.js";

export interface TocItem {
  /** "#install": the id of the heading. */
  href: string;
  label: ReactNode;
  /** Sub heading: indented, smaller (`li.oc-toc-item--sub`). */
  sub?: boolean;
  /** The heading you are reading (`aria-current="true"`); toc.js moves it while scrolling. */
  current?: boolean;
}

export interface TocGroup {
  /** Label above the group (`.oc-toc-group-label`). */
  label: ReactNode;
  items: TocItem[];
}

export interface TocProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** One list of links. */
  items?: TocItem[];
  /** Several lists, each with a label (articles, annexes …). */
  groups?: TocGroup[];
  /** Small heading above the list (`.oc-toc-title`). */
  title?: ReactNode;
  /** Accessible name of the nav (default "On this page"). */
  label?: string;
  /** Run the scroll-spy of toc.js (aria-current follows the heading you read). Default true. */
  spy?: boolean;
  /** Reading line for the scroll-spy, as a part of the window height (default 0.35). */
  line?: number;
}

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul className="oc-toc-list">
      {items.map((item, i) => (
        <li key={i} className={item.sub ? "oc-toc-item--sub" : undefined}>
          <a className="oc-toc-link" href={item.href} aria-current={item.current ? "true" : undefined}>{item.label}</a>
        </li>
      ))}
    </ul>
  );
}

/** `nav.oc-toc`: "On this page" list of heading links, sticky in a side column from 64rem. */
export const Toc = forwardRef<HTMLElement, TocProps>(function Toc(
  { items, groups, title, label = "On this page", spy = true, line, className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLElement>(null);
  const ref = useMergedRef(inner, forwardedRef);

  useEffect(() => {
    const el = inner.current;
    if (!spy || !el) return;
    // A scope that holds only this nav, so a second table of contents on the page is not started twice.
    const scope = { ownerDocument: el.ownerDocument, querySelectorAll: () => [el] } as unknown as ParentNode;
    return initToc(scope);
  }, [spy]);

  return (
    <nav ref={ref} className={cx("oc-toc", className)} aria-label={label} data-oc-toc-line={line} {...rest}>
      {title != null && <p className="oc-toc-title">{title}</p>}
      {groups?.map((g, i) => (
        <GroupBlock key={i} group={g} />
      ))}
      {items && <TocList items={items} />}
      {children}
    </nav>
  );
});

function GroupBlock({ group }: { group: TocGroup }) {
  return (
    <>
      <p className="oc-toc-group-label">{group.label}</p>
      <TocList items={group.items} />
    </>
  );
}
