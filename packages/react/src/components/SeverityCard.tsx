// File: packages/react/src/components/SeverityCard.tsx
// Map: SeverityCard = details -> summary head (icon, title + tags, level badge) -> body (children) -> actions
// Native <details>: opens without JavaScript. Cards with the same `name` open one at a time.
import { forwardRef } from "react";
import type { DetailsHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

const LEVEL_TEXT: Record<SeverityLevel, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

export interface SeverityCardProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  level: SeverityLevel;
  title: ReactNode;
  /** Small tags under the title, e.g. ["email", "password"]. */
  tags?: ReactNode[];
  /** Badge text; default the level name ("High"). */
  levelLabel?: ReactNode;
  icon?: ReactNode;
  /** Neutral colors (the finding is handled). */
  resolved?: boolean;
  actions?: ReactNode;
  /** Exclusive group: cards with the same name open one at a time. */
  name?: string;
}

/** `details.oc-severity-card`: expandable card colored by risk level. */
export const SeverityCard = forwardRef<HTMLDetailsElement, SeverityCardProps>(function SeverityCard(
  { level, title, tags, levelLabel, icon, resolved, actions, className, children, ...rest },
  ref,
) {
  const cls = cx("oc-severity-card", `oc-severity-card--${level}`, resolved && "is-resolved", className);
  return (
    <details ref={ref} className={cls} {...(rest as object)}>
      <summary className="oc-severity-card-head">
        {icon != null && <span className="oc-severity-card-icon" aria-hidden="true">{icon}</span>}
        <span className="oc-severity-card-main">
          <span className="oc-severity-card-title">{title}</span>
          {tags && tags.length > 0 && (
            <span className="oc-severity-card-tags">
              {tags.map((t, i) => <span className="oc-severity-card-tag" key={i}>{t}</span>)}
            </span>
          )}
        </span>
        <span className="oc-severity-card-level">{levelLabel ?? LEVEL_TEXT[level]}</span>
      </summary>
      <div className="oc-severity-card-body">
        {children}
        {actions != null && <div className="oc-severity-card-actions">{actions}</div>}
      </div>
    </details>
  );
});
