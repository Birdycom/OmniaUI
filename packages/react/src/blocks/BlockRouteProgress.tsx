// File: packages/react/src/blocks/BlockRouteProgress.tsx | Map: types -> BlockRouteProgress (head -> progress -> next-step button -> ol of steps)
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "../components/Webicon";

export type RouteProgressState = "todo" | "done" | "wrong" | "current" | "locked";

export interface RouteProgressStep {
  name: ReactNode;
  sub?: ReactNode;
  /** Right column: a distance ("240 m") or points ("+20"). */
  value?: ReactNode;
  /** Marker content: the number, or a webicon name ("mdi:flag-checkered") / node for steps without a number. */
  marker?: ReactNode;
  /** Label for an icon marker (screen readers). */
  markerLabel?: string;
  state?: RouteProgressState;
  onClick?: () => void;
}

export interface RouteProgressNext {
  label?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Right side: the distance. */
  meta?: ReactNode;
  /** Webicon name or node (default mdi:walk). */
  icon?: ReactNode;
  tone?: "default" | "finish" | "over";
  onClick?: () => void;
}

export interface BlockRouteProgressProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
  score?: ReactNode;
  scoreLabel?: ReactNode;
  /** Steps done and the total, for the bar. */
  done: number;
  total: number;
  /** Text left above the bar (default "3 of 6 steps done"). */
  progressLabel?: ReactNode;
  next?: RouteProgressNext;
  steps: RouteProgressStep[];
  listLabel?: string;
}

const node = (i: ReactNode, label?: string) =>
  webiconNode(i, label);

/** `.oc-block-route-progress`: progress, the next step and every step of a route with its state. */
export const BlockRouteProgress = forwardRef<HTMLElement, BlockRouteProgressProps>(function BlockRouteProgress(
  { title, meta, score, scoreLabel = "points", done, total, progressLabel, next, steps, listLabel = "Steps", className, ...rest },
  ref,
) {
  const titleId = `oc-rprogress-${useId().replace(/[^\w-]/g, "")}`;
  const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : 0;
  return (
    <section ref={ref} className={cx("oc-block-route-progress", className)} aria-labelledby={titleId} {...rest}>
      <div className="oc-block-route-progress-head">
        <div>
          <h2 className="oc-block-route-progress-title" id={titleId}>{title}</h2>
          {meta != null && <p className="oc-block-route-progress-meta">{meta}</p>}
        </div>
        {score != null && <div className="oc-block-route-progress-score"><b>{score}</b><span>{scoreLabel}</span></div>}
      </div>
      <div className="oc-block-route-progress-bar">
        <div className="oc-block-route-progress-bar-label"><span>{progressLabel ?? `${done} of ${total} steps done`}</span><span>{pct}%</span></div>
        <div className="oc-progress" role="progressbar" aria-label="Steps done" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
          <div className="oc-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {next && (
        <button type="button" className={cx("oc-block-route-progress-next", next.tone && next.tone !== "default" && `oc-block-route-progress-next--${next.tone}`)} onClick={next.onClick}>
          <span className="oc-block-route-progress-next-icon" aria-hidden="true">{node(next.icon ?? "mdi:walk")}</span>
          <span className="oc-block-route-progress-next-text">
            <span className="oc-block-route-progress-next-label">{next.label ?? "Now"}</span>
            <span className="oc-block-route-progress-next-title">{next.title}</span>
            {next.sub != null && <span className="oc-block-route-progress-next-sub">{next.sub}</span>}
          </span>
          {next.meta != null && <span className="oc-block-route-progress-next-meta">{next.meta}</span>}
        </button>
      )}
      <ol className="oc-block-route-progress-list" aria-label={listLabel}>
        {steps.map((s, i) => {
          const st = s.state ?? "todo";
          return (
            <li key={i} className={cx(
              "oc-block-route-progress-item",
              (st === "done" || st === "wrong") && "oc-block-route-progress-item--done",
              st === "wrong" && "oc-block-route-progress-item--wrong",
              st === "current" && "oc-block-route-progress-item--current",
              st === "locked" && "oc-block-route-progress-item--locked",
            )}>
              <button className="oc-block-route-progress-link" type="button" aria-current={st === "current" ? "step" : undefined} onClick={s.onClick}>
                <span className="oc-block-route-progress-marker">{node(s.marker ?? i + 1, s.markerLabel)}</span>
                <span className="oc-block-route-progress-text">
                  <span className="oc-block-route-progress-name">{s.name}</span>
                  {s.sub != null && <span className="oc-block-route-progress-sub">{s.sub}</span>}
                </span>
                {s.value != null && <span className="oc-block-route-progress-value">{s.value}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
});
