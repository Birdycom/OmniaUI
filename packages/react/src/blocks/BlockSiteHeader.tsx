import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface SiteHeaderLink {
  label: ReactNode;
  href: string;
  current?: boolean;
}

export interface BlockSiteHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Brand link content, e.g. icon tile + name. */
  brand: ReactNode;
  brandHref?: string;
  links: SiteHeaderLink[];
  /** Trailing call to action inside the nav (e.g. a `ButtonLink` with `variant="gradient"`). */
  cta?: ReactNode;
  /** Accessible name of the mobile menu button. */
  menuLabel?: string;
}

/** `.oc-site-header`: sticky header, mobile menu on a native popover (no JavaScript). */
export const BlockSiteHeader = forwardRef<HTMLElement, BlockSiteHeaderProps>(function BlockSiteHeader(
  { brand, brandHref = "/", links, cta, menuLabel = "Menu", className, ...rest },
  ref,
) {
  const navId = `oc-site-nav-${useId().replace(/:/g, "")}`;
  return (
    <header ref={ref} className={cx("oc-site-header", className)} {...rest}>
      <div className="oc-container oc-site-header__inner">
        <a className="oc-site-header__brand" href={brandHref}>{brand}</a>
        <button className="oc-site-header__toggle" type="button" aria-label={menuLabel} {...attrs({ popovertarget: navId })}>&#9776;</button>
        <nav className="oc-site-header__nav" id={navId} aria-label="Main" {...attrs({ popover: "" })}>
          {links.map((l, i) => (
            <a key={i} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>
          ))}
          {cta}
        </nav>
      </div>
    </header>
  );
});
