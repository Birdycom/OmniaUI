// File: packages/react/src/components/Footerbar.tsx
// Map: types -> Footerbar (footer.oc-footerbar -> text -> optional link list)
// Same markup as packages/ui/snippets/site-footer.html (and the split / dark variants on the site-footer page).
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FooterbarLink {
  href: string;
  label: ReactNode;
}

export interface FooterbarProps extends HTMLAttributes<HTMLElement> {
  /** Links in a `ul.oc-footerbar-links` after the text. */
  links?: FooterbarLink[];
  /** Accessible name of the link list. */
  linksLabel?: string;
  /** Pinned to the bottom of the viewport (`--fixed`); reserve room with padding-bottom: var(--ocm-footer-height). */
  fixed?: boolean;
  /** Text left, links right (`--split`). */
  split?: boolean;
  /** Grows and wraps on a phone (`--tall`). */
  tall?: boolean;
  /** Dark band (`--dark`). */
  dark?: boolean;
}

/** `footer.oc-footerbar`: slim footer bar with a version or copyright line and optional links. */
export const Footerbar = forwardRef<HTMLElement, FooterbarProps>(function Footerbar(
  { links, linksLabel, fixed, split, tall, dark, className, children, ...rest },
  ref,
) {
  const cls = cx(
    "oc-footerbar",
    dark && "oc-footerbar--dark",
    split && "oc-footerbar--split",
    tall && "oc-footerbar--tall",
    fixed && "oc-footerbar--fixed",
    className,
  );
  return (
    <footer ref={ref} className={cls} {...rest}>
      {/* With a link list the text gets its own span, so --split can push the two apart. */}
      {links?.length ? <span>{children}</span> : children}
      {links?.length ? (
        <ul className="oc-footerbar-links" aria-label={linksLabel}>
          {links.map((l, i) => (
            <li key={i}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
      ) : null}
    </footer>
  );
});
