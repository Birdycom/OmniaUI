import { forwardRef, useId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import type { BreadcrumbItemData } from "../components/Breadcrumb";

export interface BlockAppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** A `<Sidebar>`; rendered as the first grid child. */
  sidebar: ReactNode;
  /** A `<BlockAppHeader toggleFor={toggleId}>`. */
  header?: ReactNode;
  /** Breadcrumb strip under the header bar. */
  breadcrumbs?: BreadcrumbItemData[];
  /** Id of the collapse checkbox; pass the same value to `BlockAppHeader`'s `toggleFor`. */
  toggleId?: string;
  /** Shell height (`--oc-block-shell-height`, default 100dvh). */
  height?: string;
}

/** `.oc-block-shell`: sidebar, header bar, breadcrumb strip and the scrolling content. */
export const BlockAppShell = forwardRef<HTMLDivElement, BlockAppShellProps>(function BlockAppShell(
  { sidebar, header, breadcrumbs, toggleId, height, className, style, children, ...rest },
  ref,
) {
  const auto = useId();
  const id = toggleId ?? `oc-shell-toggle-${auto.replace(/:/g, "")}`;
  return (
    <div
      ref={ref}
      className={cx("oc-block-shell", className)}
      style={height ? ({ "--oc-block-shell-height": height, ...style } as CSSProperties) : style}
      {...rest}
    >
      <input className="oc-block-shell-toggle" type="checkbox" id={id} aria-label="Collapse sidebar" />
      {sidebar}
      <div className="oc-block-shell-main">
        {header}
        {breadcrumbs && (
          <div className="oc-block-shell-breadcrumbs">
            <nav aria-label="Breadcrumb">
              <ol className="oc-breadcrumb">
                {breadcrumbs.map((item, i) =>
                  item.href && i < breadcrumbs.length - 1 ? (
                    <li className="oc-breadcrumb-item" key={i}><a href={item.href}>{item.label}</a></li>
                  ) : (
                    <li className="oc-breadcrumb-item" aria-current="page" key={i}>{item.label}</li>
                  ),
                )}
              </ol>
            </nav>
          </div>
        )}
        <main className="oc-block-shell-content">{children}</main>
      </div>
    </div>
  );
});
