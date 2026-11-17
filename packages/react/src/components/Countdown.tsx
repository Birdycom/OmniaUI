// File: packages/react/src/components/Countdown.tsx
// Map: props -> end time (until or seconds from mount) -> tick (250ms) -> state (left, fraction, low/done) -> markup
// The time left for a task, a round or a reservation (.oc-countdown, app-countdown.css): inline, a pill or large digits,
// optionally with a shrinking bar. role="timer", so a screen reader does not read every second.
"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { countdownState, formatCountdown } from "../../../ui/src/countdown.js";

export { formatCountdown } from "../../../ui/src/countdown.js";

export interface CountdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** End time (a Date, an ISO string or a timestamp in ms). */
  until?: Date | string | number;
  /** Or a duration in seconds, counted from when the component appears. */
  seconds?: number;
  /** Full time in seconds, for the bar (default: the time left at the start). */
  total?: number;
  /** Seconds from which it turns orange (default: 20% of the total, at most 60). */
  low?: number;
  /** Text before the time, also the accessible name ("Time left"). */
  label?: ReactNode;
  variant?: "inline" | "pill" | "display";
  /** A bar under the time that shrinks from full to empty. */
  bar?: boolean;
  /** Stop the clock (the time stays). */
  paused?: boolean;
  onEnd?: () => void;
  /** Your own text for the time. */
  format?: (secondsLeft: number) => string;
}

const toMs = (v: Date | string | number) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v));

/** `.oc-countdown`: time left, ticking every 250ms; `data-state` low / done; `onEnd` once at zero. */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { until, seconds, total, low, label = "Time left", variant = "inline", bar, paused, onEnd, format = formatCountdown, className, style, ...rest },
  ref,
) {
  const [end] = useState(() => (until != null ? toMs(until) : Date.now() + (seconds ?? 0) * 1000));
  const endAt = until != null ? toMs(until) : end;
  const [full] = useState(() => total ?? Math.max(1, (endAt - Date.now()) / 1000));
  const [left, setLeft] = useState(() => (endAt - Date.now()) / 1000);
  const ended = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const l = (endAt - Date.now()) / 1000;
      setLeft(l);
      if (l <= 0 && !ended.current) { ended.current = true; onEndRef.current?.(); }
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [endAt, paused]);

  const s = countdownState(left, total ?? full, low);
  return (
    <div
      ref={ref}
      role="timer"
      aria-label={typeof label === "string" ? label : undefined}
      className={cx("oc-countdown", variant !== "inline" && `oc-countdown--${variant}`, bar && "oc-countdown--bar", className)}
      data-state={s.state || undefined}
      style={{ "--oc-countdown-left": s.fraction, ...style } as CSSProperties}
      {...rest}
    >
      {label != null && <span className="oc-countdown-label">{label}</span>}
      <b className="oc-countdown-time">{format(s.left)}</b>
    </div>
  );
});
