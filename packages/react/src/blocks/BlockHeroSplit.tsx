import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockHeroSplitProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** 0.17.0: heading level of the title (default 1; 2 for a hero lower on the page, same look). */
  headingLevel?: 1 | 2;
  description?: ReactNode;
  actions?: ReactNode;
  /** Right column (image, screenshot, placeholder). */
  visual?: ReactNode;
}

/** `.oc-block-hero-split`: text on the left, visual on the right. */
export const BlockHeroSplit = forwardRef<HTMLDivElement, BlockHeroSplitProps>(function BlockHeroSplit(
  { title, headingLevel = 1, description, actions, visual, className, ...rest },
  ref,
) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <div ref={ref} className={cx("oc-block-hero-split", className)} {...rest}>
      <div>
        <Heading>{title}</Heading>
        {description != null && <p>{description}</p>}
        {actions != null && <div className="oc-block-hero-actions justify-start">{actions}</div>}
      </div>
      <div className="oc-block-hero-visual">{visual}</div>
    </div>
  );
});
