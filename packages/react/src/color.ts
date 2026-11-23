// File: packages/react/src/color.ts
// Map: parse (hex, or any CSS color through a 1px canvas in the browser) -> relative luminance -> contrast ratio (WCAG 2)
//      -> pickOnColor (light or dark text on a color)
// Colour checks for a brand color a customer picks: is text on it readable, and does it stand out on the page.

export type Rgb = [number, number, number];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#3366cc" / "#36c" -> [51, 102, 204]; any other CSS color (var(--oc-background), oklch(…)) through a canvas in the
 *  browser. Undefined when it cannot be read (no DOM, or not a color). */
export function toRgb(color: string): Rgb | undefined {
  const m = HEX.exec(color.trim());
  if (m) {
    const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
  }
  if (typeof document === "undefined") return undefined;
  // A CSS variable: resolve it on the root first (custom properties are not colors a canvas understands).
  let css = color.trim();
  const v = /^var\((--[\w-]+)\)$/.exec(css);
  if (v) {
    const probe = document.createElement("span");
    probe.style.color = css;
    probe.style.display = "none";
    document.body.append(probe);
    css = getComputedStyle(probe).color;
    probe.remove();
  }
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return undefined;
  ctx.fillStyle = "#010203";
  ctx.fillStyle = css;
  if (ctx.fillStyle === "#010203" && css.toLowerCase() !== "#010203") return undefined;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/** Relative luminance (WCAG 2), 0 (black) to 1 (white). */
export function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio of two colors, 1 to 21 (WCAG 2). 4.5 is the minimum for text, 3 for large text and UI parts. */
export function contrastRatio(a: string | Rgb, b: string | Rgb): number | undefined {
  const x = typeof a === "string" ? toRgb(a) : a;
  const y = typeof b === "string" ? toRgb(b) : b;
  if (!x || !y) return undefined;
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** The text color for a background: light (#ffffff) or dark (#0b1020), whichever has the higher contrast. */
export function pickOnColor(background: string, light = "#ffffff", dark = "#0b1020"): string {
  const onLight = contrastRatio(background, dark) ?? 0;
  const onDark = contrastRatio(background, light) ?? 0;
  return onDark >= onLight ? light : dark;
}
