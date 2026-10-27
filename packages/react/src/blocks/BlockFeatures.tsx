import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface Feature {
  /** Glyph, emoji or inline SVG. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}

export interface BlockFeaturesProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  features: Feature[];
}

/** `.oc-block-features`: heading plus a grid of feature cards. */
export const BlockFeatures = forwardRef<HTMLDivElement, BlockFeaturesProps>(function BlockFeatures(
  { title, description, features, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-features", className)} {...rest}>
      {title != null && <h2>{title}</h2>}
      {description != null && <p>{description}</p>}
      <div className="oc-block-features-grid">
        {features.map((f, i) => (
          <div className="oc-block-feature-card" key={i}>
            {f.icon != null && <div className="oc-block-feature-icon">{f.icon}</div>}
            <h3>{f.title}</h3>
            {f.description != null && <p>{f.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
});
