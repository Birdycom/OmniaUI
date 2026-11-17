// File: packages/react/src/components/SidebarMeta.tsx
// Map: types -> SidebarMeta (brand, version, copyright; the whole line as data-tooltip for the collapsed sidebar)
// A ready-made meta line for the footer of an app sidebar: "App 1 2.4.0 · © 2026 Company 1". In a collapsed sidebar only
// the version stays visible and the line shows as a tooltip (CSS: app-sidebar-meta.css).

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface SidebarMetaProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  brand?: string;
  version?: string;
  /** Copyright text, e.g. "© 2026 Company 1". */
  copyright?: string;
  /** Two lines: brand + version, then the copyright (for a narrow rail). */
  wrap?: boolean;
  /** The collapsed look (only the version, the line as a tooltip) outside a collapsed `.oc-sidebar`. */
  collapsed?: boolean;
}

/** `.oc-sidebar-meta` in `<Sidebar footer={…}>`. */
export const SidebarMeta = forwardRef<HTMLDivElement, SidebarMetaProps>(function SidebarMeta(
  { brand, version, copyright, wrap, collapsed, className, ...rest },
  ref,
) {
  const line = [[brand, version].filter(Boolean).join(" "), copyright].filter(Boolean).join(" · ");
  return (
    <div ref={ref} className={cx("oc-sidebar-meta oc-tooltip oc-tooltip--right", wrap && "oc-sidebar-meta--wrap", collapsed && "oc-sidebar-meta--collapsed", className)} data-tooltip={line} tabIndex={0} {...rest}>
      {brand && <span className="oc-sidebar-meta__brand">{brand}</span>}
      {version && <span className="oc-sidebar-meta__version">{version}</span>}
      {copyright && <span className="oc-sidebar-meta__copy">{copyright}</span>}
    </div>
  );
});
