import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Counter } from "../components/Counter";

export interface CounterStat {
  to: number;
  suffix?: string;
  label: ReactNode;
}

export interface BlockStatsCounterProps extends HTMLAttributes<HTMLDivElement> {
  stats: CounterStat[];
}

/** `.oc-block-stats` whose values count up when scrolled into view (CSS only). */
export const BlockStatsCounter = forwardRef<HTMLDivElement, BlockStatsCounterProps>(function BlockStatsCounter(
  { stats, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-block-stats", className)} {...rest}>
      {stats.map((s, i) => (
        <div className="oc-block-stat" key={i}>
          <Counter className="oc-block-stat-value" to={s.to} suffix={s.suffix} />
          <span className="oc-block-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
});
