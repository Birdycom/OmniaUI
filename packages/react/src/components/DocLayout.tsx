// Same markup as packages/ui/snippets/doc-layout.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface DocLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Side column: a table of contents (`<nav className="oc-toc">`). Sticky from 64rem. */
  aside?: ReactNode;
  /** Side column on the right on a wide screen. */
  end?: boolean;
}

/** Document page with a side column next to the text (`.oc-doc-layout`); children = the text. */
export const DocLayout = forwardRef<HTMLDivElement, DocLayoutProps>(function DocLayout({ aside, end, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("oc-doc-layout", end && "oc-doc-layout--end", className)} {...rest}>
      {aside != null && <aside className="oc-doc-layout__aside">{aside}</aside>}
      <div className="oc-doc-layout__main">{children}</div>
    </div>
  );
});
