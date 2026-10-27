import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockCtaProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** `.oc-block-cta`: call to action banner. */
export const BlockCta = forwardRef<HTMLDivElement, BlockCtaProps>(function BlockCta(
  { title, description, actions, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-cta", className)} {...rest}>
      <h2>{title}</h2>
      {description != null && <p>{description}</p>}
      {actions != null && <div className="oc-block-hero-actions">{actions}</div>}
    </div>
  );
});
