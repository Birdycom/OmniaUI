import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
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
}

/** `.oc-block-appbar`: top bar with sidebar toggle, module navigation and actions. */
export const BlockAppHeader = forwardRef<HTMLElement, BlockAppHeaderProps>(function BlockAppHeader(
  { toggleFor, toggleLabel = "Toggle sidebar", nav, navLabel = "Module navigation", actions, title, className, ...rest },
  ref,
) {
  return (
    <header ref={ref} className={cx("oc-block-appbar", className)} {...rest}>
      {toggleFor && (
        <label className="oc-btn oc-btn--ghost oc-btn--icon" htmlFor={toggleFor} title={toggleLabel}>
          <Icon d="M4 6h16M4 12h16M4 18h16" />
          <span className="oc-visually-hidden">{toggleLabel}</span>
        </label>
      )}
      {title != null && <span className="oc-block-appbar-title">{title}</span>}
      {nav && (
        <Navmenu label={navLabel} navClassName="oc-block-appbar-nav">
          {nav.map((item, i) => (
            <NavmenuItem key={i}>
              <NavmenuLink href={item.href} current={item.current}>{item.label}</NavmenuLink>
            </NavmenuItem>
          ))}
        </Navmenu>
      )}
      {actions != null && <div className="oc-block-appbar-actions">{actions}</div>}
    </header>
  );
});
