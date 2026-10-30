// File: packages/react/src/components/PriceCard.tsx | Map: types -> PriceCard (head -> toggle (radios) -> prices -> features -> cta)
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface PriceCardFeature {
  label: ReactNode;
  /** Shown with a cross and muted text. */
  excluded?: boolean;
}

export interface PriceCardPrice {
  amount: ReactNode;
  period?: ReactNode;
  /** Old price (struck through). */
  was?: ReactNode;
  note?: ReactNode;
}

export interface PriceCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  name: ReactNode;
  description?: ReactNode;
  /** Badge such as "Save 20%". */
  discount?: ReactNode;
  monthly: PriceCardPrice;
  /** Without a yearly price the toggle is not rendered. */
  yearly?: PriceCardPrice;
  /** Optional third option, e.g. a one-time price. Needs `yearly`. */
  lifetime?: PriceCardPrice;
  /** Period that is selected first (uncontrolled radio). */
  defaultPeriod?: "monthly" | "yearly" | "lifetime";
  features?: PriceCardFeature[];
  /** Call to action, e.g. <a className="oc-btn oc-price-card__cta">. */
  cta?: ReactNode;
  featured?: boolean;
  /** Labels of the toggle. */
  monthlyLabel?: ReactNode;
  yearlyLabel?: ReactNode;
  lifetimeLabel?: ReactNode;
}

function Price({ kind, price }: { kind: "monthly" | "yearly" | "lifetime"; price: PriceCardPrice }) {
  return (
    <p className={`oc-price-card__price oc-price-card__price--${kind}`}>
      <span className="oc-price-card__amount">{price.amount}</span>
      {price.period != null && <span className="oc-price-card__period">{price.period}</span>}
      {price.was != null && <s className="oc-price-card__was">{price.was}</s>}
      {price.note != null && <span className="oc-price-card__note">{price.note}</span>}
    </p>
  );
}

/** `<article class="oc-price-card">`: plan card with a CSS-only monthly / yearly (/ lifetime) switch. */
export const PriceCard = forwardRef<HTMLElement, PriceCardProps>(function PriceCard(
  { name, description, discount, monthly, yearly, lifetime, defaultPeriod = "monthly", features = [], cta, featured = false,
    monthlyLabel = "Monthly", yearlyLabel = "Yearly", lifetimeLabel = "Lifetime", className, ...rest },
  ref,
) {
  // Every card needs its own radio group name.
  const group = `oc-price-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <article ref={ref} className={cx("oc-price-card", featured && "oc-price-card--featured", className)} {...rest}>
      <div className="oc-price-card__head">
        <h3 className="oc-price-card__name">{name}</h3>
        {discount != null && <span className="oc-price-card__discount">{discount}</span>}
      </div>
      {description != null && <p className="oc-price-card__desc">{description}</p>}
      {yearly && (
        <div className="oc-segmented oc-price-card__toggle" role="radiogroup" aria-label="Billing period">
          <label className="oc-segmented-item"><input type="radio" name={group} value="monthly" defaultChecked={defaultPeriod === "monthly"} /> {monthlyLabel}</label>
          <label className="oc-segmented-item"><input type="radio" name={group} value="yearly" defaultChecked={defaultPeriod === "yearly"} /> {yearlyLabel}</label>
          {lifetime && <label className="oc-segmented-item"><input type="radio" name={group} value="lifetime" defaultChecked={defaultPeriod === "lifetime"} /> {lifetimeLabel}</label>}
        </div>
      )}
      <Price kind="monthly" price={monthly} />
      {yearly && <Price kind="yearly" price={yearly} />}
      {yearly && lifetime && <Price kind="lifetime" price={lifetime} />}
      {features.length > 0 && (
        <ul className="oc-price-card__features">
          {features.map((f, i) => (
            <li key={i} className={cx("oc-price-card__feature", f.excluded && "oc-price-card__feature--excluded")}>{f.label}</li>
          ))}
        </ul>
      )}
      {cta}
    </article>
  );
});
