// File: packages/ui/test/v0170-d1.test.mjs
// Map: module colour part (ten names, fallback on primary, soft/fg, consumers in scope, AA contrast measured from the OmniaCSS
//      palette) -> floating button (transform/opacity only, reduced motion) -> module header part (eyebrow, fixed height) ->
//      no gradient/glow, ASCII only

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const readRepo = async (f) => (await fs.readFile(path.resolve(repo, f), "utf8")).replace(/\r\n/g, "\n");
const css = await readRepo("packages/ui/src/parts/app-module-color.css");
const head = await readRepo("packages/blocks/src/parts/app-modulehead-module.css");
const NAMES = ["blue", "green", "purple", "gold", "cyan", "pink", "red", "orange", "teal", "slate"];

/** The declaration block of the first rule whose selector is exactly `selector`. */
const block = (src, selector) => {
  const i = src.indexOf(`${selector} {`);
  assert.ok(i >= 0, `rule ${selector}`);
  return src.slice(i, src.indexOf("}", i));
};

test("each of the ten names sets --oc-module with light-dark() and a foreground", () => {
  for (const name of NAMES) {
    assert.ok(css.includes(`[data-module="${name}"] { --oc-module: light-dark(`), name);
    assert.ok(css.includes(`[data-module="${name}"],`) || css.includes(`[data-module="${name}"] {\n  --oc-module-fg`), `${name} has --oc-module-fg`);
  }
  assert.match(css, /--oc-module-fg: light-dark\(var\(--color-white-50\), var\(--color-shallowblue-95\)\)/);
});

test("any data-module derives the soft tint and the ring, falling back on primary (unknown names set no colour)", () => {
  const scope = block(css, "[data-module]");
  assert.match(scope, /--oc-module-soft: color-mix\(in oklab, var\(--oc-module, var\(--oc-primary\)\) 12%, transparent\)/);
  assert.match(scope, /--oc-ring: var\(--oc-module, var\(--oc-primary\)\)/);
  assert.doesNotMatch(scope, /--oc-module:/);
});

test("consumers read the module with a primary fallback", () => {
  for (const sel of [".oc-btn:where([data-module], [data-module] *)", ".oc-badge--module", ".oc-tab-trigger:where([data-module] *)",
    ".oc-launcher:where([data-module], [data-module] *)", ".oc-form-section:where([data-module], [data-module] *) .oc-form-section__icon",
    ".oc-sidebar-menu-button:where([data-module] *)"]) {
    assert.ok(css.includes(sel), sel);
  }
  // Every use of --oc-module outside the token rules has the fallback.
  const uses = css.replace(/\[data-module="[a-z]+"\] \{[^}]*\}/g, "").match(/var\(--oc-module[,)]/g) ?? [];
  assert.ok(uses.length > 5);
  assert.ok(uses.every((u) => u === "var(--oc-module,"), "var(--oc-module) always with a fallback");
  // Variants of the button keep their own look.
  assert.match(css, /:not\(:where\(\s*\.oc-btn--secondary, \.oc-btn--outline/);
});

test("no gradient, glow or raw non-ASCII in the new parts", () => {
  for (const src of [css, head]) {
    assert.doesNotMatch(src, /gradient\(/);
    assert.doesNotMatch(src, /box-shadow|drop-shadow|text-shadow|filter:/);
    assert.ok(/^[\x00-\x7f]*$/.test(src), "ASCII only");
  }
});

test("floating button: transform/opacity only, built-in heart and star masks, no animation with reduced motion", () => {
  const kf = css.slice(css.indexOf("@keyframes oc-btn-float-rise"));
  const frames = kf.slice(0, kf.indexOf("\n}\n"));
  const props = [...frames.matchAll(/([a-z-]+):/g)].map((m) => m[1]);
  assert.ok(props.length > 0);
  assert.ok(props.every((p) => p === "opacity" || p === "transform"), props.join(","));
  assert.match(block(css, ".oc-btn--float"), /--oc-btn-float-icon: url\("data:image\/svg\+xml,%3Csvg/);
  assert.match(css, /\.oc-btn--float\[data-float-icon="mdi:star"\] \{\n  --oc-btn-float-icon: url\(/);
  assert.match(block(css, ".oc-btn-float > i"), /mask: var\(--oc-btn-float-icon\) center \/ contain no-repeat/);
  assert.match(block(css, ".oc-btn-float"), /z-index: -1/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n  \.oc-btn-float > i \{ animation: none; opacity: 0; \}/);
});

test("module header part: module band, eyebrow, fixed height", () => {
  assert.match(head, /\.oc-block-modulehead:where\(\[data-module\], \[data-module\] \*\) \.oc-block-modulehead-band/);
  assert.match(block(head, ".oc-block-modulehead-eyebrow"), /text-transform: uppercase/);
  assert.match(block(head, ".oc-block-modulehead--fixed .oc-block-modulehead-band"), /min-block-size: var\(--oc-modulehead-height, 7\.5rem\)/);
});

// --- AA contrast, measured from the vendored OmniaCSS palette (oklch -> sRGB, clipped) ---
const colors = await readRepo("vendor/omniacss/dist/oc-colors.css");
const tok = {};
for (const m of colors.matchAll(/--color-([a-z]+-\d+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+|none)(?:deg)?\)/g)) {
  tok[m[1]] ??= [m[2] / 100, +m[3], m[4] === "none" ? 0 : +m[4]];
}
const lab = ([L, C, H]) => [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
function luminance([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((x) => Math.min(1, Math.max(0, x)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
const ratio = (x, y) => { const a = luminance(x), b = luminance(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
/** var(--color-x-n), oklch(from var(--color-x-n) l min(c, N) h) or color-mix(in oklab, var(a) P%?, var(b)) -> oklab. */
function color(expr) {
  const capped = expr.match(/^oklch\(from var\(--color-([a-z]+-\d+)\) l min\(c, ([\d.]+)\) h\)$/);
  if (capped) {
    const [L, C, H] = tok[capped[1]];
    return lab([L, Math.min(C, +capped[2]), H]);
  }
  const mix = expr.match(/^color-mix\(in oklab, var\(--color-([a-z]+-\d+)\)(?: (\d+)%)?, var\(--color-([a-z]+-\d+)\)\)$/);
  if (mix) {
    const p = mix[2] ? +mix[2] / 100 : 0.5;
    const [a, b] = [lab(tok[mix[1]]), lab(tok[mix[3]])];
    return a.map((v, i) => v * p + b[i] * (1 - p));
  }
  const t = expr.match(/^var\(--color-([a-z]+-\d+)\)$/);
  assert.ok(t && tok[t[1]], `palette token ${expr}`);
  return lab(tok[t[1]]);
}
/** Split light-dark(a, b) at the top-level comma. */
function lightDark(expr) {
  const inner = expr.slice("light-dark(".length, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "," && depth === 0) return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
  }
  throw new Error(expr);
}

test("every module colour reaches AA (4.5:1) with its foreground and as text on the page, light and dark", () => {
  const white = lab(tok["white-50"]), ink = lab(tok["shallowblue-95"]), pageLight = lab(tok["frostblue-2"]), cardDark = lab(tok["shallowblue-70"]);
  for (const name of NAMES) {
    const decl = css.match(new RegExp(`\\[data-module="${name}"\\] \\{ --oc-module: (light-dark\\(.*\\)); \\}`));
    assert.ok(decl, name);
    const [l, d] = lightDark(decl[1]).map(color);
    assert.ok(ratio(l, white) >= 4.5, `${name} light: white text ${ratio(l, white).toFixed(2)}`);
    assert.ok(ratio(l, pageLight) >= 4.5, `${name} light: on the page ${ratio(l, pageLight).toFixed(2)}`);
    assert.ok(ratio(d, ink) >= 4.5, `${name} dark: dark text ${ratio(d, ink).toFixed(2)}`);
    assert.ok(ratio(d, cardDark) >= 4.5, `${name} dark: on a card ${ratio(d, cardDark).toFixed(2)}`);
  }
});
