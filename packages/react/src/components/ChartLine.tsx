// File: packages/react/src/components/ChartLine.tsx
// Map: types + demo data -> geometry (smooth path, area, percentages) -> ChartLine (head -> y axis -> plot: svg series + hover columns -> x axis -> legend)
// Same markup as packages/ui/snippets/chart-line.html. The paths are computed here; tooltips open on :hover / :focus-visible (CSS only).
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface ChartLineSeries {
  name: string;
  values: number[];
  dashed?: boolean;
}

export interface ChartLineProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  sub?: ReactNode;
  /** Big number in the head (`oc-chart-line__value`). */
  value?: ReactNode;
  series?: ChartLineSeries[];
  /** One label per point, used in the tooltips (e.g. "January"). */
  labels?: string[];
  /** Short x axis labels (default: labels; "Jan"… for the demo months). */
  xLabels?: string[];
  /** Top of the y axis (default: a round number above the highest value). */
  max?: number;
  /** Gridline rows (default 4). */
  rows?: number;
  /** "area" fills the series, "spark" hides axes and grid. */
  variant?: "line" | "area" | "spark";
  /** Dots always visible. */
  dots?: boolean;
  /** aria-label of the point columns. */
  label?: string;
  format?: (value: number) => string;
}

const DEMO: ChartLineSeries[] = [
  { name: "Desktop", values: [186, 305, 237, 73, 209, 214] },
  { name: "Mobile", values: [80, 200, 120, 190, 130, 140] },
];
const MONTHS = ["January", "February", "March", "April", "May", "June"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

/** Number with at most 2 decimals and no trailing zeros ("75", "37.5", "4.69"). */
const n2 = (n: number) => String(parseFloat(n.toFixed(2)));
/** Round axis maximum: step = max / rows rounded up to 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 or 10 x 10^k. */
export function niceMax(value: number, rows = 4) {
  if (value <= 0) return rows;
  const raw = value / rows, pow = 10 ** Math.floor(Math.log10(raw));
  return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * pow >= raw) ?? 10) * pow * rows;
}
/** Smooth path through the points (x 0-100, y = 100 - value / max * 100); control points stay between their two ends. */
export function chartLinePath(values: number[], max: number) {
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * 100 : 50, 100 - (v / max) * 100]);
  if (!pts.length) return "";
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
  let d = `M${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clamp(p1[1] + (p2[1] - p0[1]) / 6, p1[1], p2[1])];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clamp(p2[1] - (p3[1] - p1[1]) / 6, p1[1], p2[1])];
    d += ` C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d;
}

/** `figure.oc-chart-line`: line / area chart in inline SVG with axes, legend and tooltips. */
export const ChartLine = forwardRef<HTMLElement, ChartLineProps>(function ChartLine(
  { title = "Visitors", sub = "January – June 2026", value, series = DEMO, labels: labelsProp, xLabels, max, rows = 4, variant = "line", dots = true,
    label = "Visitors per month", format = String, className, ...rest },
  ref,
) {
  const top = max ?? niceMax(Math.max(0, ...series.flatMap((s) => s.values)), rows);
  const count = Math.max(0, ...series.map((s) => s.values.length));
  const labels = labelsProp ?? MONTHS;
  const axis = xLabels ?? labelsProp ?? SHORT;
  return (
    <figure ref={ref} className={cx("oc-chart-line", variant !== "line" && `oc-chart-line--${variant}`, dots && "oc-chart-line--dots", className)} {...rest}>
      {(title != null || sub != null || value != null) && (
        <figcaption className="oc-chart-line__head">
          {title != null && <span className="oc-chart-line__title">{title}</span>}
          {sub != null && <span className="oc-chart-line__sub">{sub}</span>}
          {value != null && <span className="oc-chart-line__value">{value}</span>}
        </figcaption>
      )}
      <div className="oc-chart-line__body">
        <ul className="oc-chart-line__y" aria-hidden="true">
          {Array.from({ length: rows + 1 }, (_, i) => <li key={i}>{format(top - (top / rows) * i)}</li>)}
        </ul>
        <div className="oc-chart-line__plot" style={rows !== 4 ? ({ "--oc-chart-line-rows": rows } as CSSProperties) : undefined}>
          <svg className="oc-chart-line__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {series.map((s, i) => {
              const d = chartLinePath(s.values, top);
              return (
                <g key={i} className="oc-chart-line__series">
                  <path className="oc-chart-line__area" d={`${d} L100 100 L0 100 Z`} />
                  <path className={cx("oc-chart-line__path", s.dashed && "oc-chart-line__path--dashed")} d={d} />
                </g>
              );
            })}
          </svg>
          <ul className="oc-chart-line__cols" style={{ "--n": count } as CSSProperties} aria-label={label}>
            {Array.from({ length: count }, (_, i) => (
              <li key={i} className="oc-chart-line__col" style={{ "--x": i } as CSSProperties} tabIndex={0} aria-label={`${labels[i] ?? i + 1}: ${series.map((s) => `${s.name} ${format(s.values[i])}`).join(", ")}`}>
                {series.map((s, j) => <i key={j} className="oc-chart-line__dot" style={{ "--y": `${n2((s.values[i] / top) * 100)}%` } as CSSProperties} />)}
                <span className="oc-chart-line__tip" aria-hidden="true">
                  <strong>{labels[i] ?? i + 1}</strong>
                  {series.map((s, j) => <span key={j} className="oc-chart-line__row">{s.name}<b>{format(s.values[i])}</b></span>)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ol className="oc-chart-line__x" aria-hidden="true">{axis.map((l, i) => <li key={i}>{l}</li>)}</ol>
      </div>
      <ul className="oc-chart-legend">{series.map((s, i) => <li key={i}><span className="oc-chart-swatch" />{s.name}</li>)}</ul>
    </figure>
  );
});
