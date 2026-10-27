// scripts/lib/omnia-color.mjs
// Maps any sRGB color (hex) to the nearest Omnia palette token (distance in OKLab), so generated CSS
// only uses OmniaCSS colors: nearestOmnia("#98C379") -> { token: "--color-green-2", oklch: "oklch(…)" }.

import fs from "node:fs";
import path from "node:path";

const FAMILIES = new Set("red pink orange yellow violet magenta purple indigo lime green teal cyan turquoise blue shallowblue duskblue twilightblue stormblue frostblue mistblue vividblue skycyan wheat peru brown white snow azure beige ivory linen silver gray black".split(" "));
let palette;

function load(root) {
  if (palette) return palette;
  const css = fs.readFileSync(path.join(root, "vendor/omniacss/dist/oc-colors.css"), "utf8");
  palette = [];
  for (const m of css.matchAll(/--color-([a-z]+)-(\d+): (oklch\(([\d.]+)% ([\d.]+) (none|[\d.]+)(?:deg)?\))/g)) {
    if (!FAMILIES.has(m[1]) || m[2] === "100") continue;
    const L = +m[4] / 100, C = +m[5], H = m[6] === "none" ? 0 : (+m[6] * Math.PI) / 180;
    palette.push({ token: `--color-${m[1]}-${m[2]}`, oklch: m[3], lab: [L, C * Math.cos(H), C * Math.sin(H)] });
  }
  return palette;
}

function hexToOklab(hex) {
  let h = hex.replace("#", "");
  if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/** Nearest Omnia token for a hex color. */
export function nearestOmnia(hex, root = process.cwd()) {
  const [L, A, B] = hexToOklab(hex);
  let best = null;
  for (const p of load(root)) {
    const d = (L - p.lab[0]) ** 2 * 1.4 + (A - p.lab[1]) ** 2 + (B - p.lab[2]) ** 2;
    if (!best || d < best.d) best = { d, ...p };
  }
  return { token: best.token, oklch: best.oklch };
}
