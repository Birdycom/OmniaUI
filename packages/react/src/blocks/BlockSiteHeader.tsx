// File: packages/react/src/blocks/BlockSiteHeader.tsx | Map: header (variant, container) -> brand link | brand mark -> menu button -> nav (links, cta) -> actions -> reading progress
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { BrandMark } from "../components/BrandMark";
import type { BrandMarkProps } from "../components/BrandMark";
import { webiconNode } from "../components/Webicon";

export interface SiteHeaderLink {
  label: ReactNode;
  href: string;
  current?: boolean;
}

export interface BlockSiteHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Brand link content, e.g. icon tile + name. Not needed with `brandMark`. */
  brand?: ReactNode;
  brandHref?: string;
  /** A brand mark (`.oc-brand-mark`) as the logo link instead of `.oc-site-header__brand`; its href is `brandHref`. */
  brandMark?: Omit<BrandMarkProps, "href">;
  links: SiteHeaderLink[];
  /** Trailing call to action inside the nav (e.g. a `ButtonLink` with `className="oc-site-header__cta"`). */
  cta?: ReactNode;
  /** Right zone `.oc-site-header__actions` (sign in, a call to action), outside the menu. */
  actions?: ReactNode;
  /** Thin reading-progress line at the bottom (`.oc-site-header__progress`, scroll-driven, no JavaScript). */
  progress?: boolean;
  /** Look: `center` (menu in the middle), `dark`, `floating` or `glass`. */
  variant?: "center" | "dark" | "floating" | "glass";
  /** Content of the menu button: a webicon name ("mdi:menu") or a node. Default the menu character. */
  menuIcon?: ReactNode;
  /** Accessible name of the mobile menu button. */
  menuLabel?: string;
  /** Accessible name of the nav. */
  navLabel?: string;
  /** Fold the menu at the width of the header itself, not of the window (`.oc-site-header--container`, 0.17.0). */
  container?: boolean;
}

/** `.oc-site-header`: sticky header, mobile menu on a native popover (no JavaScript). */
export const BlockSiteHeader = forwardRef<HTMLElement, BlockSiteHeaderProps>(function BlockSiteHeader(
  { brand, brandHref = "/", brandMark, links, cta, actions, progress, variant, menuIcon, menuLabel = "Menu", navLabel = "Main", container, className, ...rest },
  ref,
) {
  const navId = `oc-site-nav-${useId().replace(/:/g, "")}`;
  return (
    <header ref={ref} className={cx("oc-site-header", variant && `oc-site-header--${variant}`, container && "oc-site-header--container", className)} {...rest}>
      <div className="oc-container oc-site-header__inner">
        {brandMark ? <BrandMark href={brandHref} {...brandMark} /> : <a className="oc-site-header__brand" href={brandHref}>{brand}</a>}
        <button className="oc-site-header__toggle" type="button" aria-label={menuLabel} popoverTarget={navId}>{menuIcon != null ? webiconNode(menuIcon) : "☰"}</button>
        <nav className="oc-site-header__nav" id={navId} aria-label={navLabel} {...attrs({ popover: "" })}>
          {links.map((l, i) => (
            <a key={i} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>
          ))}
          {cta}
        </nav>
        {actions != null && <div className="oc-site-header__actions">{actions}</div>}
      </div>
      {progress && <span className="oc-site-header__progress" aria-hidden="true" />}
    </header>
  );
});
