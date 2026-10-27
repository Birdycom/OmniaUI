import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockHeroSplitProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Right column (image, screenshot, placeholder). */
  visual?: ReactNode;
}

/** `.oc-block-hero-split`: text on the left, visual on the right. */
export const BlockHeroSplit = forwardRef<HTMLDivElement, BlockHeroSplitProps>(function BlockHeroSplit(
  { title, description, actions, visual, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-hero-split", className)} {...rest}>
      <div>
        <h1>{title}</h1>
        {description != null && <p>{description}</p>}
        {actions != null && <div className="oc-block-hero-actions justify-start">{actions}</div>}
      </div>
      <div className="oc-block-hero-visual">{visual}</div>
    </div>
  );
});
