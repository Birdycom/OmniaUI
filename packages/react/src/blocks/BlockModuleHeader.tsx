import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockModuleHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Inline SVG in the icon tile. */
  icon?: ReactNode;
  title: ReactNode;
  /** 0.17.0: heading level of the title (default 1; 2 for a block lower on the page, same look). */
  headingLevel?: 1 | 2;
  intro?: ReactNode;
  /** Badges under the title. */
  meta?: ReactNode;
  /** Buttons below the band (back link, primary action). */
  actions?: ReactNode;
  /** 0.17.0: small line above the title (section or parent module), `.oc-block-modulehead-eyebrow`. */
  eyebrow?: ReactNode;
  /** 0.17.0: module colour on the header (`data-module`): band tint and icon tile. Names as on Badge / Button, or your own. */
  module?: string;
  /** 0.17.0: one band height (`--oc-modulehead-height`, default 7.5rem) with or without intro and meta, so it does not jump between pages. */
  fixedHeight?: boolean;
}

/** `.oc-block-modulehead`: page header with icon tile, title, intro, meta badges and actions. */
export const BlockModuleHeader = forwardRef<HTMLElement, BlockModuleHeaderProps>(function BlockModuleHeader(
  { icon, title, headingLevel = 1, intro, meta, actions, eyebrow, module, fixedHeight, className, ...rest },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <header ref={ref} className={cx("oc-block-modulehead", fixedHeight && "oc-block-modulehead--fixed", className)} data-module={module || undefined} {...rest}>
      <div className="oc-block-modulehead-band">
        {icon != null && <span className="oc-block-modulehead-icon" aria-hidden="true">{icon}</span>}
        <div className="oc-block-modulehead-body">
          {eyebrow != null && <p className="oc-block-modulehead-eyebrow">{eyebrow}</p>}
          <Heading className="oc-block-modulehead-title">{title}</Heading>
          {intro != null && <p className="oc-block-modulehead-intro">{intro}</p>}
          {meta != null && <div className="oc-block-modulehead-meta">{meta}</div>}
        </div>
      </div>
      {actions != null && <div className="oc-block-modulehead-actions">{actions}</div>}
    </header>
  );
});
