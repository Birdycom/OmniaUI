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
}

/** `.oc-block-modulehead`: page header with icon tile, title, intro, meta badges and actions. */
export const BlockModuleHeader = forwardRef<HTMLElement, BlockModuleHeaderProps>(function BlockModuleHeader(
  { icon, title, headingLevel = 1, intro, meta, actions, className, ...rest },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <header ref={ref} className={cx("oc-block-modulehead", className)} {...rest}>
      <div className="oc-block-modulehead-band">
        {icon != null && <span className="oc-block-modulehead-icon" aria-hidden="true">{icon}</span>}
        <div className="oc-block-modulehead-body">
          <Heading className="oc-block-modulehead-title">{title}</Heading>
          {intro != null && <p className="oc-block-modulehead-intro">{intro}</p>}
          {meta != null && <div className="oc-block-modulehead-meta">{meta}</div>}
        </div>
      </div>
      {actions != null && <div className="oc-block-modulehead-actions">{actions}</div>}
    </header>
  );
});
