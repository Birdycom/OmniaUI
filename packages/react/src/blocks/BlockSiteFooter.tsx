// File: packages/react/src/blocks/BlockSiteFooter.tsx | Map: footer (variant) -> about (brand | brand mark, text, newsletter, social) -> columns (links, more, address) | centred row + social -> bottom (copyright, legal + build, credit)
import { Fragment, forwardRef, useId } from "react";
import type { FormEventHandler, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import type { FooterLink } from "./BlockFooter";
import { BrandMark } from "../components/BrandMark";
import type { BrandMarkProps } from "../components/BrandMark";
import { webiconNode } from "../components/Webicon";

export interface SiteFooterColumn {
  title: ReactNode;
  /** Link list column. */
  links?: FooterLink[];
  /** Address column: children are rendered in an `<address class="oc-site-footer__list">`. */
  address?: ReactNode;
  /** More lists in the same column, each under a second title (`.oc-site-footer__subtitle`). */
  more?: { title: ReactNode; links: FooterLink[] }[];
}

export interface SiteFooterSocial {
  /** Accessible name of the link ("LinkedIn"). */
  label: string;
  href: string;
  /** Webicon name ("mdi:linkedin") or a node. */
  icon: ReactNode;
}

export interface SiteFooterNewsletter {
  /** Form action (default none: handle it with onSubmit). */
  action?: string;
  method?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** Hidden label of the e-mail field (default "E-mail"). */
  label?: string;
  placeholder?: string;
  /** Name of the e-mail field (default "email"). */
  name?: string;
  /** Text of the submit button (default "Subscribe"). */
  button?: ReactNode;
}

export interface BlockSiteFooterProps extends Omit<HTMLAttributes<HTMLElement>, "about"> {
  /** Brand link content, e.g. icon tile + name (rendered in `oc-site-header__brand`). Not needed with `brandMark`. */
  brand?: ReactNode;
  brandHref?: string;
  /** A brand mark (`.oc-brand-mark`, small) as the logo link; its href is `brandHref`. */
  brandMark?: Omit<BrandMarkProps, "href">;
  about?: ReactNode;
  /** Link columns. Optional with `variant="center"` (that one uses `row`). */
  columns?: SiteFooterColumn[];
  /** Social icons (`.oc-site-footer__social`): in the brand column, or centred under the row with `variant="center"`. */
  social?: SiteFooterSocial[];
  socialLabel?: string;
  /** Sign-up field (`.oc-site-footer__signup`) in the brand column. */
  newsletter?: SiteFooterNewsletter;
  /** `center`: brand, one row of links, social icons and the bottom line, centred. `dark`: a dark footer. */
  variant?: "center" | "dark";
  /** The single row of links of `variant="center"` (`.oc-site-footer__row`). */
  row?: FooterLink[];
  copyright?: ReactNode;
  /** Legal links in the bottom bar (`.oc-site-footer__legal`). */
  legal?: FooterLink[];
  /** Build number or version at the end of the legal list (`.oc-site-footer__build`). */
  build?: ReactNode;
  credit?: ReactNode;
}

/** `.oc-site-footer`: brand column, link columns and a bottom bar. */
export const BlockSiteFooter = forwardRef<HTMLElement, BlockSiteFooterProps>(function BlockSiteFooter(
  { brand, brandHref = "/", brandMark, about, columns = [], social, socialLabel = "Social media", newsletter, variant, row, copyright, legal, build, credit, className, ...rest },
  ref,
) {
  const center = variant === "center";
  const mailId = `oc-ft-mail-${useId().replace(/[^\w-]/g, "")}`;
  const brandLink = brandMark
    ? <BrandMark href={brandHref} size="sm" {...brandMark} />
    : <a className="oc-site-header__brand" href={brandHref}>{brand}</a>;
  const socialList = social && social.length > 0 && (
    <ul className="oc-site-footer__social" aria-label={socialLabel}>
      {social.map((s, i) => (
        <li key={i}><a href={s.href} aria-label={s.label}>{webiconNode(s.icon)}</a></li>
      ))}
    </ul>
  );
  const signup = newsletter && (
    <form className="oc-site-footer__signup" action={newsletter.action} method={newsletter.method} onSubmit={newsletter.onSubmit}>
      <label className="oc-visually-hidden" htmlFor={mailId}>{newsletter.label ?? "E-mail"}</label>
      <input className="oc-input" id={mailId} type="email" name={newsletter.name ?? "email"} placeholder={newsletter.placeholder} autoComplete="email" required />
      <button className="oc-btn" type="submit">{newsletter.button ?? "Subscribe"}</button>
    </form>
  );
  const hasLegal = (legal && legal.length > 0) || build != null;
  return (
    <footer ref={ref} className={cx("oc-site-footer", variant && `oc-site-footer--${variant}`, className)} {...rest}>
      <div className="oc-container">
        {center ? (
          <>
            <div className="oc-site-footer__about">
              {brandLink}
              {about != null && <p>{about}</p>}
            </div>
            {row && row.length > 0 && (
              <ul className="oc-site-footer__row">
                {row.map((l, i) => <li key={i}><a href={l.href}>{l.label}</a></li>)}
              </ul>
            )}
            {socialList}
          </>
        ) : (
          <div className="oc-site-footer__grid">
            <div className="oc-site-footer__about">
              {brandLink}
              {about != null && <p>{about}</p>}
              {signup}
              {socialList && (signup ? <div style={{ marginBlockStart: "1.25rem" }}>{socialList}</div> : socialList)}
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
                {col.more?.map((m, j) => (
                  <Fragment key={j}>
                    <h2 className="oc-site-footer__title oc-site-footer__subtitle">{m.title}</h2>
                    <ul className="oc-site-footer__list">
                      {m.links.map((l, k) => <li key={k}><a href={l.href}>{l.label}</a></li>)}
                    </ul>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
        {(copyright != null || credit != null || hasLegal) && (
          <div className="oc-site-footer__bottom">
            <span>{copyright}</span>
            {hasLegal && (
              <ul className="oc-site-footer__legal">
                {legal?.map((l, i) => <li key={i}><a href={l.href}>{l.label}</a></li>)}
                {build != null && <li className="oc-site-footer__build">{build}</li>}
              </ul>
            )}
            {(credit != null || (!hasLegal && !center)) && <span>{credit}</span>}
          </div>
        )}
      </div>
    </footer>
  );
});
