import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Button, ButtonLink } from "../components/Button";

export interface PricingPlan {
  name: ReactNode;
  description?: ReactNode;
  price: ReactNode;
  /** e.g. `/month` */
  period?: ReactNode;
  features: ReactNode[];
  /** Highlighted plan (`oc-block-pricing-card--featured`, primary button). */
  featured?: boolean;
  /** Button label. */
  action: ReactNode;
  /** Renders the action as a link when set. */
  href?: string;
  onAction?: () => void;
}

export interface BlockPricingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  plans: PricingPlan[];
}

/** `.oc-block-pricing`: pricing cards with a featured plan. */
export const BlockPricing = forwardRef<HTMLDivElement, BlockPricingProps>(function BlockPricing(
  { title, description, plans, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-pricing", className)} {...rest}>
      {title != null && <h2>{title}</h2>}
      {description != null && <p>{description}</p>}
      <div className="oc-block-pricing-grid">
        {plans.map((plan, i) => {
          const variant = plan.featured ? "default" : "outline";
          return (
            <div className={cx("oc-block-pricing-card", plan.featured && "oc-block-pricing-card--featured")} key={i}>
              <p className="oc-block-pricing-name">{plan.name}</p>
              {plan.description != null && <p className="oc-block-pricing-desc">{plan.description}</p>}
              <p className="oc-block-pricing-price">
                {plan.price}
                {plan.period != null && <> <span>{plan.period}</span></>}
              </p>
              <ul className="oc-block-pricing-features">
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              {plan.href ? (
                <ButtonLink variant={variant} href={plan.href} style={{ width: "100%" }}>{plan.action}</ButtonLink>
              ) : (
                <Button variant={variant} style={{ width: "100%" }} onClick={plan.onAction}>{plan.action}</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
