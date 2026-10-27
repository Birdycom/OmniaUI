import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import type { FooterLink } from "./BlockFooter";

export interface SiteFooterColumn {
  title: ReactNode;
  /** Link list column. */
  links?: FooterLink[];
  /** Address column: children are rendered in an `<address class="oc-site-footer__list">`. */
  address?: ReactNode;
}

export interface BlockSiteFooterProps extends Omit<HTMLAttributes<HTMLElement>, "about"> {
  /** Brand link content, e.g. icon tile + name (rendered in `oc-site-header__brand`). */
  brand: ReactNode;
  brandHref?: string;
  about?: ReactNode;
  columns: SiteFooterColumn[];
  copyright?: ReactNode;
  credit?: ReactNode;
}

/** `.oc-site-footer`: brand column, link columns and a bottom bar. */
export const BlockSiteFooter = forwardRef<HTMLElement, BlockSiteFooterProps>(function BlockSiteFooter(
  { brand, brandHref = "/", about, columns, copyright, credit, className, ...rest },
  ref,
) {
  return (
    <footer ref={ref} className={cx("oc-site-footer", className)} {...rest}>
      <div className="oc-container">
        <div className="oc-site-footer__grid">
          <div className="oc-site-footer__about">
            <a className="oc-site-header__brand" href={brandHref}>{brand}</a>
            {about != null && <p>{about}</p>}
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h2 className="oc-site-footer__title">{col.title}</h2>
              {col.links && (
                <ul className="oc-site-footer__list">
                  {col.links.map((l, j) => (
                    <li key={j}><a href={l.href}>{l.label}</a></li>
                  ))}
                </ul>
              )}
              {col.address != null && <address className="oc-site-footer__list">{col.address}</address>}
            </div>
          ))}
        </div>
        {(copyright != null || credit != null) && (
          <div className="oc-site-footer__bottom">
            <span>{copyright}</span>
            <span>{credit}</span>
          </div>
        )}
      </div>
    </footer>
  );
});
