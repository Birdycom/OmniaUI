// File: packages/ui/test/v0170-glass.test.mjs
// Map: glass of 0.17.0 -> lens on ::after (blur) + light tint -> specular rim -> tokens other parts use -> --clear/--frost/--strong
//      -> no backdrop-filter fallback -> reduced transparency solid -> Firefox -> bar divider

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");
/** The rule that starts with `selector {`, up to its closing brace at the start of a line. */
const block = (css, selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `missing ${selector}`);
  return css.slice(at, css.indexOf("\n}", at));
};
/** Light and dark alpha of a sheet token: light-dark(oklch(from var(--oc-background) l c h / a), …/ b). */
const alpha = (css, token) => {
  const m = css.match(new RegExp(`${token}: light-dark\\(oklch\\(from var\\(--oc-background\\) l c h / ([\\d.]+)\\), oklch\\(from var\\(--oc-background\\) l c h / ([\\d.]+)\\)\\)`));
  assert.ok(m, `missing ${token}`);
  return [Number(m[1]), Number(m[2])];
};

test("glass: the lens sits on ::after with a backdrop blur, and the tint lets the backdrop through", async () => {
  const css = await read("parts/media-glass.css");
  const lens = block(css, ".oc-glass::after");
  assert.match(lens, /backdrop-filter: blur\(var\(--oc-glass-blur\)\) saturate\(1\.6\) brightness\(1\.05\)/);
  assert.match(lens, /var\(--oc-glass-sheet\);/);
  assert.match(lens, /inset 0 1px 0 var\(--oc-glass-edge-hi\)/);
  const [light, dark] = alpha(css, "--oc-glass-sheet");
  assert.ok(light <= 0.45 && dark <= 0.35, `sheet too dense: ${light} / ${dark}`);
  assert.match(css, /--oc-glass-blur: 1[2-8]px;/);
  // the panel inside is never denser than the sheet
  const panel = css.match(/--oc-glass-panel: light-dark\(oklch\(100% 0 0deg \/ ([\d.]+)\)/);
  assert.ok(Number(panel[1]) <= light);
});

test("glass: specular rim on the border ring, not on liquid or flat glass", async () => {
  const css = await read("parts/media-glass.css");
  const rim = block(css, ".oc-glass:not(.oc-glass--liquid, .oc-glass--flat)::before");
  assert.match(rim, /mask-composite: exclude;/);
  assert.match(rim, /pointer-events: none;/);
});

test("glass: tokens other parts use still exist", async () => {
  const css = await read("parts/media-glass.css");
  for (const t of ["sheet", "panel", "panel-strong", "edge", "edge-hi", "hairline", "shadow", "panel-shadow", "blur", "radius", "panel-radius"]) {
    assert.match(css, new RegExp(`--oc-glass-${t}: `), `--oc-glass-${t}`);
  }
});

test("glass: --clear is clearer, --frost and --strong are denser than the default", async () => {
  const css = await read("parts/media-glass.css");
  const opts = await read("parts/media-glass-options.css");
  const [light] = alpha(css, "--oc-glass-sheet");
  const [clear] = alpha(block(opts, ":is(.oc-glass, .oc-glass-bar).oc-glass--clear"), "--oc-glass-sheet");
  const [frost] = alpha(block(opts, ":is(.oc-glass, .oc-glass-bar).oc-glass--frost"), "--oc-glass-sheet");
  const [strong] = alpha(css.slice(css.indexOf(".oc-glass.oc-glass--strong {")), "--oc-glass-sheet");
  assert.ok(clear < light && light < frost && light < strong);
});

test("glass: without backdrop-filter the sheet turns nearly solid, also with --clear/--frost/--strong", async () => {
  const css = await read("parts/media-glass.css");
  const fallback = block(css, "@supports not (backdrop-filter: blur(1px))");
  const [light, dark] = alpha(fallback, "--oc-glass-sheet");
  assert.ok(light >= 0.8 && dark >= 0.8);
  assert.match(fallback, /\.oc-glass\.oc-glass--clear,\s*\.oc-glass\.oc-glass--frost,\s*\.oc-glass\.oc-glass--strong \{/);
});

test("glass: reduce transparency gives solid surfaces and no blur", async () => {
  const css = await read("parts/media-glass.css");
  const rt = block(css, "@media (prefers-reduced-transparency: reduce)");
  assert.match(rt, /\.oc-glass\.oc-glass--clear,\s*\.oc-glass\.oc-glass--frost,\s*\.oc-glass\.oc-glass--strong \{/);
  assert.match(rt, /--oc-glass-sheet: var\(--oc-background\);/);
  assert.match(rt, /\.oc-glass::after \{ backdrop-filter: none; background-image: none; \}/);
});

test("glass: Firefox puts the filter on the sheet, --flat keeps none", async () => {
  const css = await read("parts/media-glass.css");
  const ff = block(css, "@supports (-moz-appearance: none)");
  assert.match(ff, /\.oc-glass \{ backdrop-filter: blur\(var\(--oc-glass-blur\)\) saturate\(1\.6\) brightness\(1\.05\); \}/);
  assert.match(ff, /\.oc-glass--flat \{ backdrop-filter: none; \}/);
});

test("glass bar: a divider between groups", async () => {
  const css = await read("parts/media-glass-liquid.css");
  assert.match(css, /\.oc-glass-bar__sep \{ align-self: stretch; inline-size: 1px;/);
});
