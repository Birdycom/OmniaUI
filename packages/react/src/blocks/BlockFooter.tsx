import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FooterLink {
  label: ReactNode;
  href: string;
}

export interface FooterColumn {
  title: ReactNode;
  links: FooterLink[];
}

export interface BlockFooterProps extends HTMLAttributes<HTMLDivElement> {
  columns: FooterColumn[];
  /** Left text of the bottom bar. */
  copyright?: ReactNode;
  /** Right text of the bottom bar. */
  credit?: ReactNode;
}

/** `.oc-block-footer`: multi-column site footer. */
export const BlockFooter = forwardRef<HTMLDivElement, BlockFooterProps>(function BlockFooter(
  { columns, copyright, credit, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-footer", className)} {...rest}>
      <div className="oc-block-footer-grid">
        {columns.map((col, i) => (
          <div className="oc-block-footer-col" key={i}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l, j) => (
                <li key={j}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {(copyright != null || credit != null) && (
        <div className="oc-block-footer-bottom">
          <span>{copyright}</span>
          <span>{credit}</span>
        </div>
      )}
    </div>
  );
});
