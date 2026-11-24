import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface MeterListProps extends HTMLAttributes<HTMLDivElement> {
  /** compact: tighter list and thinner bar; dense: for a small widget or tray window (5px bar, no transition);
   *  live: no width transition (a value every few seconds). */
  variant?: "compact" | "dense" | "live";
  /** Also add `--live` next to another variant (e.g. compact + live). */
  live?: boolean;
}

/** Stack of meter rows (`.oc-meter-list`, `--compact`, `--dense`, `--live`). Put `<MeterRow>` inside. */
export const MeterList = forwardRef<HTMLDivElement, MeterListProps>(function MeterList(
  { variant, live, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("oc-meter-list", variant && `oc-meter-list--${variant}`, live && variant !== "live" && "oc-meter-list--live", className)}
      {...rest}
    />
  );
});

export interface MeterRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** 0–100. */
  percent: number;
  /** The amount as text after the percentage ("31k / 50k tokens"). */
  value?: ReactNode;
  /** When it resets ("Resets in 2 h"). */
  reset?: ReactNode;
  /** Color; default from the percentage: warn from 75, critical from 90. */
  level?: "ok" | "warn" | "critical";
  /** Muted second reading under the bar ("VRAM 2.7 / 8.0 GB"). */
  sub?: ReactNode;
  /** 0–100: a thin bar after the sub-line text. */
  subPercent?: number;
  /** Color of the thin bar (default muted). */
  subLevel?: "warn" | "critical";
}

/** Usage line: label, percentage and amount, a colored bar and the reset line (`.oc-meter-row`). */
export const MeterRow = forwardRef<HTMLDivElement, MeterRowProps>(function MeterRow(
  { label, percent, value, reset, level, sub, subPercent, subLevel, className, style, ...rest },
  ref,
) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const tone = level ?? (pct >= 90 ? "critical" : pct >= 75 ? "warn" : "ok");
  return (
    <div
      ref={ref}
      className={cx("oc-meter-row", className)}
      data-level={tone === "ok" ? undefined : tone}
      style={{ ...style, ["--oc-meter" as string]: `${pct}%` } as CSSProperties}
      {...rest}
    >
      <span className="oc-meter-row__label">{label}</span>
      <span className="oc-meter-row__value"><strong>{pct}%</strong>{value != null && <> · {value}</>}</span>
      <span className="oc-meter-row__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={typeof label === "string" ? label : undefined} />
      {sub != null && (
        <span className="oc-meter-row__sub">
          {sub}
          {subPercent != null && (
            <span className="oc-meter-row__subbar" data-level={subLevel} style={{ ["--oc-meter" as string]: `${Math.max(0, Math.min(100, subPercent))}%` } as CSSProperties} />
          )}
        </span>
      )}
      {reset != null && <span className="oc-meter-row__reset">{reset}</span>}
    </div>
  );
});
