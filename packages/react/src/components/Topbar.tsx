// File: packages/react/src/components/Topbar.tsx | Map: optional strip -> header.oc-topbar (variant, center, plain, fixed) -> brand (logo + name) -> checkbox toggle + burger -> nav (navmenu links) -> actions
import { Fragment, forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

export interface TopbarLink {
  label: ReactNode;
  href: string;
  current?: boolean;
  /** Icon-only link: a webicon name ("mdi:github") or a node, drawn as `.oc-navmenu-icon`; a text `label` becomes its aria-label. */
  icon?: ReactNode;
  ariaLabel?: string;
}

export interface TopbarProps extends HTMLAttributes<HTMLElement> {
  /** Brand link text (and other content after the logo). */
  brand: ReactNode;
  brandHref?: string;
  /** Logo before the brand text in `.oc-topbar-logo`: a webicon name ("mdi:lightning-bolt") or a node. */
  logo?: ReactNode;
  links?: TopbarLink[];
  /** Right zone `.oc-topbar-actions` (buttons, theme switch). */
  actions?: ReactNode;
  /** Content of the strip above the bar (`.oc-topbar-strip`), e.g. two spans with links. */
  strip?: ReactNode;
  /** Colour: `dark`, `brand` (with an `oc-accent--*` class) or `floating` (rounded card). */
  variant?: "dark" | "brand" | "floating";
  /** Menu in the middle (`--center`). */
  center?: boolean;
  /** Plain links without a pill (`--plain`). */
  plain?: boolean;
  /** Fixed to the top of the window (`--fixed`). */
  fixed?: boolean;
  /** Burger menu on narrow screens (checkbox, no JavaScript). Default true. */
  collapsible?: boolean;
  /** Accessible name of the menu checkbox. */
  menuLabel?: string;
  /** Accessible name of the nav. */
  navLabel?: string;
}

/** `.oc-topbar`: site bar with brand, menu (`.oc-navmenu--site`), actions and a burger menu without JavaScript. */
export const Topbar = forwardRef<HTMLElement, TopbarProps>(function Topbar(
  { brand, brandHref = "/", logo, links = [], actions, strip, variant, center, plain, fixed, collapsible = true, menuLabel = "Toggle menu", navLabel = "Main", className, children, ...rest },
  ref,
) {
  const toggleId = `oc-topbar-${useId().replace(/[^\w-]/g, "")}`;
  const bar = (
    <header
      ref={ref}
      className={cx("oc-topbar", collapsible && "oc-topbar--collapsible", variant && `oc-topbar--${variant}`, center && "oc-topbar--center", plain && "oc-topbar--plain", fixed && "oc-topbar--fixed", className)}
      {...rest}
    >
      <a className="oc-topbar-brand" href={brandHref}>
        {logo != null && <span className="oc-topbar-logo" aria-hidden="true">{typeof logo === "string" && logo.includes(":") ? <Webicon name={logo} bare fallback="iconify" /> : logo}</span>}
        {brand}
      </a>
      {collapsible && (
        <>
          <input type="checkbox" id={toggleId} className="oc-topbar-toggle" aria-label={menuLabel} />
          <label className="oc-topbar-burger" htmlFor={toggleId} aria-hidden="true">{"☰"}</label>
        </>
      )}
      <nav className="oc-topbar-nav" aria-label={navLabel}>
        {children ?? (
          <ul className="oc-navmenu oc-navmenu--site">
            {links.map((l, i) => (
              <li key={i}>
                <a className="oc-navmenu-link" href={l.href} aria-current={l.current ? "page" : undefined} aria-label={l.ariaLabel ?? (l.icon != null && typeof l.label === "string" ? l.label : undefined)}>
                  {l.icon != null
                    ? (typeof l.icon === "string" && l.icon.includes(":") ? <Webicon name={l.icon} className="oc-navmenu-icon" bare fallback="iconify" /> : l.icon)
                    : l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
      {actions != null && <div className="oc-topbar-actions">{actions}</div>}
    </header>
  );
  if (strip == null) return bar;
  return (
    <Fragment>
      <div className="oc-topbar-strip">{strip}</div>
      {bar}
    </Fragment>
  );
});
