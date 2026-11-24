import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value (default 0); not used with `segments`. */
  value?: number;
  /** Maximum (default 100). With `segments`: the total (default the sum of the parts). */
  max?: number;
  /** Bar color. Wins over `levels`. */
  variant?: "default" | "success" | "warning" | "danger";
  /** Height: 4 px (xs), 6 px (sm) or 8 px (default). */
  size?: "xs" | "sm" | "md";
  /** Light top edge and a soft glow in the bar color. */
  glow?: boolean;
  /** Color by the value: warning from 70 %, danger from 90 %; or your own [warning, danger] limits in percent. */
  levels?: boolean | [number, number];
  /** A target or schedule point, in the unit of `value`: an upright line on the track. */
  marker?: number;
  /** 0.18.0: `"striped"` hatches the part still to do with flat stripes (`.oc-progress--striped`). */
  track?: "plain" | "striped";
  /** 0.18.0: a split bar (`.oc-progress--split`): parts side by side in their tones; `value` is then ignored. */
  segments?: ProgressSegment[];
}

/** One part of a split bar (0.18.0). `value` is in the unit of `max` (default: the sum of all parts). */
export interface ProgressSegment {
  value: number;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  label?: string;
}

/** Width in percent of every part of a split bar, against `max` (or the sum when there is no max). */
export function splitPercents(segments: ProgressSegment[], max?: number): number[] {
  const total = max && max > 0 ? max : segments.reduce((s, p) => s + Math.max(0, p.value), 0);
  return segments.map((p) => (total > 0 ? Math.round((Math.max(0, p.value) / total) * 10000) / 100 : 0));
}

/** Accessible text of a split bar: "Right 12, Wrong 4". */
export function splitLabel(segments: ProgressSegment[]): string {
  return segments.map((p, i) => `${p.label ?? `Part ${i + 1}`} ${p.value}`).join(", ");
}

/** The bar color for `levels` at a percentage. */
export function progressLevel(pct: number, levels: true | [number, number]): "default" | "warning" | "danger" {
  const [warn, danger] = levels === true ? [70, 90] : levels;
  return pct >= danger ? "danger" : pct >= warn ? "warning" : "default";
}

/** `<div class="oc-progress" role="progressbar">` with an `oc-progress-bar` sized in percent. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max: maxProp, variant = "default", size = "md", glow, levels, marker, track = "plain", segments, className, ...rest },
  ref,
) {
  const max = maxProp ?? 100;
  const sizeClass = size !== "md" && `oc-progress--${size}`;
  if (segments) {
    const widths = splitPercents(segments, maxProp);
    return (
      <div
        ref={ref}
        className={cx("oc-progress", "oc-progress--split", sizeClass, track === "striped" && "oc-progress--striped", className)}
        role="img"
        aria-label={splitLabel(segments)}
        {...rest}
      >
        {segments.map((p, i) => (
          <span
            key={i}
            className={cx("oc-progress-segment", p.tone && p.tone !== "default" && `oc-progress-segment--${p.tone}`)}
            style={{ inlineSize: `${widths[i]}%` }}
            title={p.label ? `${p.label}: ${p.value}` : undefined}
          />
        ))}
      </div>
    );
  }
  const percent = (v: number) => (max > 0 ? Math.min(100, Math.max(0, (v / max) * 100)) : 0);
  const pct = Math.round(percent(value));
  const tone = variant === "default" && levels ? progressLevel(pct, levels) : variant;
  return (
    <div
      ref={ref}
      className={cx("oc-progress", sizeClass, glow && "oc-progress--glow", track === "striped" && "oc-progress--striped", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...rest}
    >
      <div className={cx("oc-progress-bar", tone !== "default" && `oc-progress-bar--${tone}`)} style={{ width: `${pct}%` }} />
      {marker != null && <span className="oc-progress-marker" style={{ left: `${percent(marker)}%` }} />}
    </div>
  );
});
export interface SplitBarProps extends Omit<ProgressProps, "value" | "segments" | "variant" | "levels" | "marker" | "glow"> {
  segments: ProgressSegment[];
  /** 0.18.0: a legend under the bar (dot, label and value per part). */
  legend?: boolean;
}

/** 0.18.0: a split bar (right / wrong, done / open): `<Progress segments>` with an optional legend. */
export const SplitBar = forwardRef<HTMLDivElement, SplitBarProps>(function SplitBar({ segments, legend, className, style, ...rest }, ref) {
  const bar = <Progress ref={ref} value={0} segments={segments} className={legend ? undefined : className} style={legend ? undefined : style} {...rest} />;
  if (!legend) return bar;
  return (
    <div className={className} style={style}>
      {bar}
      <ul className="oc-progress-legend">
        {segments.map((p, i) => (
          <li key={i} className={cx(p.tone && p.tone !== "default" && `oc-progress-segment--${p.tone}`)}>
            {p.label ?? `Part ${i + 1}`} {p.value}
          </li>
        ))}
      </ul>
    </div>
  );
});
