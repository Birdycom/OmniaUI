// File: packages/vue/src/composables/chartLine.ts
// Map: number format -> nice axis maximum -> smooth path (same geometry as the chart-line snippet and the React wrapper)

/** Number with at most 2 decimals and no trailing zeros ("75", "37.5", "4.69"). */
export const n2 = (n: number) => String(parseFloat(n.toFixed(2)))

/** Round axis maximum: step = max / rows rounded up to 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 or 10 x 10^k. */
export function niceMax(value: number, rows = 4) {
  if (value <= 0) return rows
  const raw = value / rows
  const pow = 10 ** Math.floor(Math.log10(raw))
  return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * pow >= raw) ?? 10) * pow * rows
}

/** Smooth path through the points (x 0-100, y = 100 - value / max * 100); control points stay between their two ends. */
export function chartLinePath(values: number[], max: number) {
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * 100 : 50, 100 - (v / max) * 100])
  if (!pts.length) return ''
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b))
  let d = `M${n2(pts[0][0])} ${n2(pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clamp(p1[1] + (p2[1] - p0[1]) / 6, p1[1], p2[1])]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clamp(p2[1] - (p3[1] - p1[1]) / 6, p1[1], p2[1])]
    d += ` C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`
  }
  return d
}
