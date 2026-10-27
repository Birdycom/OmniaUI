// File: packages/react/src/components/StatCard.tsx
// Map: StatCardGrid (row of cards) -> StatCard = card (div, a or button) -> icon -> body (value + trend, label)
// With `href` the card is a link, with `onClick` a button; otherwise a plain div.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

/** `.oc-stat-card-grid`: responsive grid for a row of stat cards. */
export const StatCardGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatCardGrid(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("oc-stat-card-grid", className)} {...rest} />;
});

export interface StatCardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  value: ReactNode;
  label: ReactNode;
  icon?: ReactNode;
  /** Trend chip text after the value, e.g. "+12%". */
  trend?: ReactNode;
  trendDirection?: "up" | "down";
  tone?: "default" | "accent" | "success" | "warning";
  /** Colored start edge. */
  stripe?: boolean;
  href?: string;
  onClick?: () => void;
}

/** `.oc-stat-card`: compact KPI tile. */
export function StatCard({ value, label, icon, trend, trendDirection = "up", tone = "default", stripe, href, onClick, className, ...rest }: StatCardProps) {
  const cls = cx("oc-stat-card", tone !== "default" && `oc-stat-card--${tone}`, stripe && "oc-stat-card--stripe", className);
  // Spans only inside the body, so the markup is also valid inside a link or button.
  const content = (
    <>
      {icon != null && <span className="oc-stat-card-icon" aria-hidden="true">{icon}</span>}
      <span className="oc-stat-card-body">
        <span className="oc-stat-card-value">
          {value}
          {trend != null && <span className={`oc-stat-card-trend oc-stat-card-trend--${trendDirection}`}>{trend}</span>}
        </span>
        <span className="oc-stat-card-label">{label}</span>
      </span>
    </>
  );
  if (href !== undefined) return <a className={cls} href={href} {...rest}>{content}</a>;
  if (onClick) return <button className={cls} type="button" onClick={onClick} {...rest}>{content}</button>;
  return <div className={cls} {...rest}>{content}</div>;
}
