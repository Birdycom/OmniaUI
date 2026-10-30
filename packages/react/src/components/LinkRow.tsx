// File: packages/react/src/components/LinkRow.tsx | Map: types -> LinkRow (ul.oc-link-row -> li > a per link, or children)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LinkRowLink {
  href: string;
  label: ReactNode;
}

export interface LinkRowProps extends HTMLAttributes<HTMLUListElement> {
  /** The links; external ones get an arrow and github.com links the GitHub mark (CSS, by the href). Or pass <li> children. */
  links?: LinkRowLink[];
  tone?: "default" | "accent" | "muted";
  size?: "sm" | "default" | "lg";
  children?: ReactNode;
}

const external = (href: string) => /^https?:\/\//.test(href);

/** `<ul class="oc-link-row">`: a row of links under a card, icons by the href. */
export const LinkRow = forwardRef<HTMLUListElement, LinkRowProps>(function LinkRow(
  { links, tone = "default", size = "default", className, children, ...rest },
  ref,
) {
  const classes = cx("oc-link-row", tone !== "default" && `oc-link-row--${tone}`, size !== "default" && `oc-link-row--${size}`, className);
  return (
    <ul ref={ref} className={classes} {...rest}>
      {links
        ? links.map((l, i) => <li key={i}><a href={l.href} rel={external(l.href) ? "noopener" : undefined}>{l.label}</a></li>)
        : children}
    </ul>
  );
});
