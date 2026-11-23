// File: packages/ui/test/v0171-button-tokens.test.mjs
// Map: button theming tokens (0.17.1) -> radius on every size and in groups -> hover mix on the filled button only
//      (defaults keep the old look) -> outline border mix -> .oc-btn--inherit on dark/coloured bands -> disabled opacity
//      -> icon + label already inline-flex with a gap, square icon button

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");
/** The declarations of the first rule whose selector is exactly `sel`. */
const rule = (css, sel) => {
  const i = css.indexOf(`\n${sel} {`);
  assert.ok(i >= 0, `rule ${sel} not found`);
  return css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
};
const RADIUS = "var(--oc-btn-radius, var(--oc-radius))";

test("--oc-btn-radius sets the corner of every button; unset it is --oc-radius as before", async () => {
  const css = await read("components.css");
  assert.match(rule(css, ".oc-btn"), new RegExp(`border-radius: ${RADIUS.replace(/[()]/g, "\\$&")};`));
  assert.match(rule(css, ".oc-btn--xs"), /border-radius: calc\(var\(--oc-btn-radius, var\(--oc-radius\)\) - 2px\);/);
  assert.match(rule(css, ".oc-btn--sm"), /border-radius: calc\(var\(--oc-btn-radius, var\(--oc-radius\)\) - 2px\);/);
  assert.match(rule(css, ".oc-btn--lg"), /border-radius: calc\(var\(--oc-btn-radius, var\(--oc-radius\)\) \+ 2px\);/);
  assert.ok(css.includes(`.oc-btn-group .oc-btn:first-child { border-radius: ${RADIUS} 0 0 ${RADIUS}; }`));
  assert.ok(css.includes(`.oc-btn-group .oc-btn:last-child { border-radius: 0 ${RADIUS} ${RADIUS} 0; }`));
  const extra = await read("components-extra.css");
  assert.ok(extra.includes(`.oc-btn-group--vertical .oc-btn:first-child { border-radius: ${RADIUS} ${RADIUS} 0 0; }`));
  assert.ok(extra.includes(`.oc-btn-group--vertical .oc-btn:last-child { border-radius: 0 0 ${RADIUS} ${RADIUS}; }`));
  // no button corner reads --oc-radius directly any more
  assert.doesNotMatch(css.slice(css.indexOf("BUTTONS"), css.indexOf("LINKS")), /border-radius: (calc\()?var\(--oc-radius\)/);
});

test("--oc-btn-hover-mix mixes a tint into the filled button's hover; the default 100% keeps the own colour", async () => {
  const css = await read("components.css");
  assert.match(rule(css, ".oc-btn:hover"), /opacity: var\(--oc-btn-hover-opacity, 0\.9\);/);
  const m = css.match(/\n\.oc-btn:not\(:where\(([^)]*)\)\):hover \{\n  ([^}]*)\}/);
  assert.ok(m, "hover-mix rule");
  assert.equal(m[2].trim(),
    "background-color: color-mix(in oklab, var(--oc-module, var(--oc-primary)) var(--oc-btn-hover-mix, 100%), var(--oc-btn-hover-tint, var(--oc-foreground)));");
  // every variant with its own fill is left alone (same list as the module colour, plus the toggle)
  for (const v of ["secondary", "outline", "ghost", "link", "destructive", "success", "gradient", "glass", "neon", "plain", "toggle",
    "soft-primary", "soft-success", "soft-warning", "soft-destructive", "soft-info"]) {
    assert.match(m[1], new RegExp(`\\.oc-btn--${v}[,\\s]`), v);
  }
});

test("--oc-btn-outline-mix puts the label colour in the outline border; default 0% is the plain --oc-border", async () => {
  const css = await read("components.css");
  assert.match(rule(css, ".oc-btn--outline"),
    /border-color: color-mix\(in oklab, currentColor var\(--oc-btn-outline-mix, 0%\), var\(--oc-border\)\);/);
});

test(".oc-btn--inherit: outline or ghost on a dark band follows the text colour around it", async () => {
  const css = await read("components.css");
  assert.match(rule(css, ".oc-btn--inherit:is(.oc-btn--outline, .oc-btn--ghost)"), /color: inherit;/);
  assert.match(rule(css, ".oc-btn--inherit.oc-btn--outline"),
    /border-color: color-mix\(in oklab, currentColor var\(--oc-btn-outline-mix, 55%\), transparent\);/);
  const hover = rule(css, ".oc-btn--inherit:is(.oc-btn--outline, .oc-btn--ghost):hover");
  assert.match(hover, /background: color-mix\(in oklab, currentColor 10%, transparent\);/);
  assert.match(hover, /color: inherit;/);
  // flat: no gradient or glow
  assert.doesNotMatch(hover, /gradient|box-shadow/);
});

test("--oc-btn-disabled-opacity dims a disabled button (default 0.5, like the other controls)", async () => {
  const css = await read("components.css");
  assert.match(css, /\.oc-btn:disabled,\n\.oc-btn\[disabled\],\n\.oc-btn\[aria-disabled="true"\] \{\n  opacity: var\(--oc-btn-disabled-opacity, 0\.5\);\n  pointer-events: none;/);
});

test("icon + label: .oc-btn is inline-flex with a gap; .oc-btn--icon is a square without padding", async () => {
  const css = await read("components.css");
  const base = rule(css, ".oc-btn");
  assert.match(base, /display: inline-flex;/);
  assert.match(base, /align-items: center;/);
  assert.match(base, /gap: 8px;/);
  const icon = rule(css, ".oc-btn--icon");
  assert.match(icon, /padding: 0;/);
  assert.match(icon, /inline-size: var\(--oc-btn-square\);/);
});
