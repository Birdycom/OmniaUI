"use client";

import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode, RefObject } from "react";
import { attrs, cx } from "../utils";
import { Icon } from "../components/Icon";
import { Navmenu, NavmenuItem, NavmenuLink } from "../components/Navmenu";

export interface AppHeaderNavItem {
  label: ReactNode;
  href: string;
  current?: boolean;
}

export interface BlockAppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Id of the sidebar toggle checkbox (see BlockAppShell). Omit to hide the toggle button. */
  toggleFor?: string;
  toggleLabel?: string;
  /** Module navigation links. */
  nav?: AppHeaderNavItem[];
  navLabel?: string;
  /** Right-aligned actions: theme switch, switchers, user menu. */
  actions?: ReactNode;
  /** Optional page title (`oc-block-appbar-title`). */
  title?: ReactNode;
  /** Links that do not fit move into a "More" menu at the end of the nav (measured with a ResizeObserver) instead of
   *  scrolling sideways. When the current page is in that menu, the More button is marked current. */
  overflow?: boolean;
  /** Label of the More button (default "More"). */
  moreLabel?: string;
  /** Search field between the nav and the actions (`.oc-block-appbar-search`), e.g. an Input type="search". */
  search?: ReactNode;
  /** 0.18.0: on a narrow bar (below 40rem) the search shrinks to a magnifier and opens over the bar on focus. */
  searchCollapse?: boolean;
  /** Module color (`data-module` on the bar). */
  module?: string;
}

const DOTS = "M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2";

/**
 * How many items fit: all of them when their widths (plus gaps) fit in `available`, otherwise as many as fit next to
 * the More button (`moreWidth`). Same rule as nav-overflow.js and the Vue composable.
 */
export function fitNavItems(widths: number[], available: number, moreWidth: number, gap = 0): number {
  const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
  if (total <= available) return widths.length;
  let used = moreWidth;
  let n = 0;
  for (const w of widths) {
    const next = used + gap + w;
    if (next > available) break;
    used = next;
    n++;
  }
  return n;
}

/**
 * Measures the `<ul>` of a nav: its `<li>` items (all rendered; hidden ones keep their width through
 * `[data-oc-hidden]`) against the width of the parent nav, the `[data-oc-nav-more]` item excluded. Returns how many
 * items are visible; re-measures on resize (ResizeObserver) and when `count` changes. `enabled=false` returns `count`.
 */
export function useNavOverflow(listRef: RefObject<HTMLElement | null>, count: number, enabled = true): number {
  const [visible, setVisible] = useState(count);
  useLayoutEffect(() => {
    const list = listRef.current;
    const box = list?.parentElement;
    if (!enabled || !list || !box) return;
    const measure = () => {
      const items = [...list.children].filter((el) => !el.hasAttribute("data-oc-nav-more")) as HTMLElement[];
      const more = list.querySelector<HTMLElement>("[data-oc-nav-more]");
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      setVisible(fitNavItems(items.map((el) => el.offsetWidth), box.clientWidth, more?.offsetWidth ?? 0, gap));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [listRef, count, enabled]);
  return enabled ? Math.min(visible, count) : count;
}

/** `.oc-block-appbar`: top bar with sidebar toggle, module navigation, search and actions. */
export const BlockAppHeader = forwardRef<HTMLElement, BlockAppHeaderProps>(function BlockAppHeader(
  { toggleFor, toggleLabel = "Toggle sidebar", nav, navLabel = "Module navigation", actions, title, overflow, moreLabel = "More", search, searchCollapse, module, className, ...rest },
  ref,
) {
  const listRef = useRef<HTMLUListElement>(null);
  const items = nav ?? [];
  const visible = useNavOverflow(listRef, items.length, !!overflow);
  const menuId = `oc-appbar-more-${useId().replace(/:/g, "")}`;
  const hidden = overflow ? items.slice(visible) : [];
  const moreCurrent = hidden.some((item) => item.current);
  const off = (i: number) => !!overflow && i >= visible;
  return (
    <header ref={ref} className={cx("oc-block-appbar", className)} data-module={module} {...rest}>
      {toggleFor && (
        <label className="oc-btn oc-btn--ghost oc-btn--icon" htmlFor={toggleFor} title={toggleLabel}>
          <Icon d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          <span className="oc-visually-hidden">{toggleLabel}</span>
        </label>
      )}
      {title != null && <span className="oc-block-appbar-title">{title}</span>}
      {nav && (
        <Navmenu ref={listRef} label={navLabel} navClassName={cx("oc-block-appbar-nav", overflow && "oc-block-appbar-nav--overflow")}>
          {nav.map((item, i) => (
            <NavmenuItem key={i} {...(off(i) ? { "data-oc-hidden": "", "aria-hidden": true } : {})}>
              <NavmenuLink href={item.href} current={item.current} tabIndex={off(i) ? -1 : undefined}>{item.label}</NavmenuLink>
            </NavmenuItem>
          ))}
          {overflow && (
            <li data-oc-nav-more="" {...(hidden.length === 0 ? { "data-oc-hidden": "", "aria-hidden": true } : {})}>
              <button
                className="oc-navmenu-link oc-block-appbar-more"
                type="button"
                popoverTarget={menuId}
                aria-haspopup="menu"
                aria-current={moreCurrent ? "page" : undefined}
                tabIndex={hidden.length === 0 ? -1 : undefined}
              >
                <Icon d={DOTS} data-icon="mdi:dots-horizontal" />
                {moreLabel}
              </button>
              <div className="oc-dropdown-menu" id={menuId} role="menu" {...attrs({ popover: "" })}>
                {hidden.map((item, i) => (
                  <a key={i} className="oc-dropdown-item" role="menuitem" href={item.href} aria-current={item.current ? "page" : undefined}>{item.label}</a>
                ))}
              </div>
            </li>
          )}
        </Navmenu>
      )}
      {search != null && <div className={cx("oc-block-appbar-search", searchCollapse && "oc-block-appbar-search--collapse")}>{search}</div>}
      {actions != null && <div className="oc-block-appbar-actions">{actions}</div>}
    </header>
  );
});
