import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface Stat {
  value: ReactNode;
  label: ReactNode;
}

export interface BlockStatsProps extends HTMLAttributes<HTMLDivElement> {
  stats: Stat[];
}

/** `.oc-block-stats`: key figures row. */
export const BlockStats = forwardRef<HTMLDivElement, BlockStatsProps>(function BlockStats({ stats, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("oc-block-stats", className)} {...rest}>
      {stats.map((s, i) => (
        <div className="oc-block-stat" key={i}>
          <div className="oc-block-stat-value">{s.value}</div>
          <div className="oc-block-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
});
