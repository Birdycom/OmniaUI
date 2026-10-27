// File: packages/react/src/components/PageHeader.tsx
// Map: PageHeader = header -> back row -> main (text: title, subtitle, meta | actions)
// The header is a size container: the actions move next to the title from a 36rem header width.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Meta row items (owner, updated, ...). */
  meta?: ReactNode;
  /** Back link, e.g. `<BackLink href="/projects">Projects</BackLink>`. */
  back?: ReactNode;
  actions?: ReactNode;
  /** Heading level of the title (default 1). */
  level?: 1 | 2 | 3;
  bordered?: boolean;
  sticky?: boolean;
  size?: "sm";
}

/** `.oc-page-header`: title row of an app page. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, subtitle, meta, back, actions, level = 1, bordered, sticky, size, className, ...rest },
  ref,
) {
  const Heading = `h${level}` as "h1";
  const cls = cx("oc-page-header", bordered && "oc-page-header--bordered", sticky && "oc-page-header--sticky", size && `oc-page-header--${size}`, className);
  return (
    <header ref={ref} className={cls} {...rest}>
      {back != null && <div className="oc-page-header-back">{back}</div>}
      <div className="oc-page-header-main">
        <div className="oc-page-header-text">
          <Heading className="oc-page-header-title">{title}</Heading>
          {subtitle != null && <p className="oc-page-header-subtitle">{subtitle}</p>}
          {meta != null && <div className="oc-page-header-meta">{meta}</div>}
        </div>
        {actions != null && <div className="oc-page-header-actions">{actions}</div>}
      </div>
    </header>
  );
});
