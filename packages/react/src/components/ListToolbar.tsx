// File: packages/react/src/components/ListToolbar.tsx
// Map: ListToolbar = toolbar row -> search -> count -> spacer -> view radios -> actions
// The view toggle is a radio group. In React you usually render only the active view yourself
// (use `view` + `onViewChange`); the CSS-only `.oc-list-toolbar-scope` switch also works.
"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface ListToolbarView {
  /** "cards", "table" or "list" (matches `.oc-list-toolbar-panel[data-view]`). */
  value: string;
  label: string;
  icon: ReactNode;
}

export interface ListToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Search area content, e.g. `<input class="oc-input" type="search">`. */
  search?: ReactNode;
  /** Result count text, e.g. "3 items". */
  count?: ReactNode;
  views?: ListToolbarView[];
  view?: string;
  defaultView?: string;
  onViewChange?: (view: string) => void;
  viewsLabel?: string;
  actions?: ReactNode;
  sticky?: boolean;
  bordered?: boolean;
}

/** `.oc-list-toolbar`: search, count, view toggle and actions above a list. */
export const ListToolbar = forwardRef<HTMLDivElement, ListToolbarProps>(function ListToolbar(
  { search, count, views, view, defaultView, onViewChange, viewsLabel = "View", actions, sticky, bordered, className, ...rest },
  ref,
) {
  const name = `oc-list-view-${useId().replace(/:/g, "")}`;
  const [current, setCurrent] = useControllable(view, defaultView ?? views?.[0]?.value ?? "", onViewChange);
  const cls = cx("oc-list-toolbar", sticky && "oc-list-toolbar--sticky", bordered && "oc-list-toolbar--bordered", className);
  return (
    <div ref={ref} className={cls} role="toolbar" {...rest}>
      {search != null && <div className="oc-list-toolbar-search">{search}</div>}
      {count != null && <span className="oc-list-toolbar-count">{count}</span>}
      <span className="oc-list-toolbar-spacer" />
      {views && views.length > 0 && (
        <div className="oc-list-toolbar-views" role="radiogroup" aria-label={viewsLabel}>
          {views.map((v) => (
            <label className="oc-list-toolbar-view" title={v.label} key={v.value}>
              <input
                type="radio"
                name={name}
                value={v.value}
                aria-label={v.label}
                checked={current === v.value}
                onChange={() => setCurrent(v.value)}
              />
              {v.icon}
            </label>
          ))}
        </div>
      )}
      {actions != null && <div className="oc-list-toolbar-actions">{actions}</div>}
    </div>
  );
});
