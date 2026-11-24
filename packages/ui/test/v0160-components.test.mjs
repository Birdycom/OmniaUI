// File: packages/ui/test/v0160-components.test.mjs
// Map: combobox + dropdown icons (CSS) -> combobox.js helpers -> language menu (CSS) -> sheet options + plain collapsible
//      -> live frame devices -> logo (CSS + plate rule) -> mode badge, accent card, code plate -> sidebar meta
//      -> scripts, exports, snippets and manifest

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { matches } from "../src/combobox.js";
import { luminance, plateFromPixels } from "../src/logo.js";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const parts = ["forms-combobox-icons", "forms-language-menu", "app-sheet-options", "media-logo", "app-mode-badge", "app-sidebar-meta"]
  .map((n) => [n, read(`../src/parts/${n}.css`)]);

test("new parts: theme tokens and palette colors only, no gradients, logical properties", () => {
  for (const [name, css] of parts) {
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /#[0-9a-f]{3,8}\b/i, `${name}: no hex colors`);
    assert.doesNotMatch(code, /\brgba?\(/, `${name}: no rgb()`);
    assert.doesNotMatch(code, /gradient\(/, `${name}: no gradients`);
    assert.doesNotMatch(code, /(?<![-\w])(margin|padding)-(left|right|top|bottom)\s*:/, `${name}: logical properties`);
  }
});

test("combobox icons: icon column, same start without icon, icon of the choice in the field", () => {
  const css = parts[0][1];
  assert.match(css, /\.oc-combobox-list:has\(\.oc-combobox-option-icon\) > \.oc-combobox-option:not\(:has\(> \.oc-combobox-option-icon\)\)/);
  assert.match(css, /padding-inline-start: calc\(0\.625rem \+ var\(--oc-combobox-icon\) \+ 0\.5rem\)/);
  assert.match(css, /\.oc-combobox:has\(> \.oc-combobox-icon:not\(:empty\)\) > \.oc-combobox-input \{\s*padding-inline-start: calc\(4px \+ 0\.625rem \+ var\(--oc-combobox-icon\) \+ 0\.5rem\)/);
  assert.match(css, /\.oc-dropdown-menu:has\(> \.oc-dropdown-item > \.oc-dropdown-icon\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test("combobox.js: filter ignores case and accents", () => {
  assert.equal(matches("Credit card", "CARD"), true);
  assert.equal(matches("Français", "franc"), true);
  assert.equal(matches("Bank transfer", "cash"), false);
  assert.equal(matches("Anything", "  "), true);
});

test("language menu: flag, code, icon trigger with tooltip, check at the current language", () => {
  const css = parts[1][1];
  assert.match(css, /\.oc-language-flag \{[^}]*inline-size: 1\.25rem;[^}]*block-size: 0\.9375rem;/);
  assert.match(css, /button\.oc-language-select\.oc-language-select--icon \{[^}]*inline-size: 2\.25rem;[^}]*block-size: 2\.25rem;/);
  assert.match(css, /button\.oc-language-select\.oc-tooltip:has\(\+ \.oc-language-menu:popover-open\)::after \{ content: none; \}/);
  assert.match(css, /:is\(\[aria-current="true"\], \[aria-current="page"\], \[aria-checked="true"\]\)::after \{ opacity: 1; \}/);
  assert.match(css, /\.oc-dropdown-menu\.oc-language-menu\[popover\] \{ position-area: block-end span-inline-start; \}/);
  // the chevron of the select pill stays off the icon-only button (its ::after is the tooltip)
  assert.match(read("../src/parts/forms-language-select.css"), /\.oc-language-select:not\(\.oc-language-select--icon\)::after \{/);
});

test("sheet options: glass tokens, scrim without blur, fallbacks, inset gap, footer panel; plain collapsible", () => {
  const css = parts[2][1];
  assert.match(css, /dialog\.oc-sheet--glass \{[^}]*--oc-sheet-bg:[^}]*--oc-sheet-blur: 20px;[^}]*--oc-sheet-scrim:/);
  assert.match(css, /dialog\.oc-sheet--glass::backdrop \{[^}]*backdrop-filter: none;/);
  assert.match(css, /@supports not \(\(backdrop-filter: blur\(1px\)\) or \(-webkit-backdrop-filter: blur\(1px\)\)\)/);
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\) \{\s*dialog\.oc-sheet--glass \{ --oc-sheet-bg: var\(--oc-background\); \}/);
  assert.match(css, /dialog\.oc-sheet--inset \{ --oc-sheet-gap: 3\.25rem; inline-size: min\(24rem, calc\(100% - var\(--oc-sheet-gap\)\)\); \}/);
  assert.match(css, /\.oc-sheet-footer\.oc-sheet-footer--panel \{[^}]*env\(safe-area-inset-bottom\)/);
  assert.match(css, /details\.oc-collapsible\.oc-collapsible--plain \{ background: transparent; border: 0; border-radius: 0; box-shadow: none; \}/);
  assert.match(css, /details\.oc-collapsible--plain \+ details\.oc-collapsible--plain \{ border-block-start: 1px solid var\(--oc-border\); \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("live frame: inert frames take no pointer, phone and tv bezels keep the ratio", () => {
  const css = read("../src/parts/media-live-frame.css");
  assert.match(css, /\.oc-live-frame > \[inert\] \{ pointer-events: none;/);
  assert.match(css, /\.oc-live-frame:is\(\.oc-live-frame--phone, \.oc-live-frame--tv, \.oc-live-frame--laptop\) \{[^}]*box-sizing: content-box;/);
  // 0.16.1 laptop: a base under the screen (::after) and room for it, so the frame never overflows its column
  assert.match(css, /\.oc-live-frame--laptop \{[^}]*overflow: visible;/);
  assert.match(css, /\.oc-live-frame--laptop::after \{[^}]*inset-block-start: calc\(100% \+ var\(--oc-live-bezel-size\)\);/);
  assert.match(css, /\.oc-live-frame--phone \{[^}]*inline-size: min\(calc\(100% - 2 \* var\(--oc-live-bezel-size\)\), var\(--oc-live-phone-max\)\);/);
});

test("logo: never filtered, plates per theme with light-dark()", () => {
  const css = parts[3][1];
  assert.match(css, /\.oc-logo > img \{[^}]*object-fit: contain;[^}]*filter: none;/);
  assert.match(css, /\.oc-logo\[data-plate="light"\] \{ background: light-dark\(var\(--oc-logo-plate-light\), transparent\); \}/);
  assert.match(css, /\.oc-logo\[data-plate="dark"\] \{ background: light-dark\(transparent, var\(--oc-logo-plate-dark\)\); \}/);
});

test("logo.js: the plate rule on pixels", () => {
  const px = (rgba, n = 100, rest = [0, 0, 0, 0], m = 0) => Uint8ClampedArray.from([...Array(n)].flatMap(() => rgba).concat([...Array(m)].flatMap(() => rest)));
  assert.ok(Math.abs(luminance(255, 255, 255) - 1) < 1e-9);
  assert.equal(luminance(0, 0, 0), 0);
  assert.equal(plateFromPixels(px([255, 255, 255, 255], 30, [0, 0, 0, 0], 70)), "light", "white logo on transparency");
  assert.equal(plateFromPixels(px([20, 30, 60, 255], 30, [0, 0, 0, 0], 70)), "dark", "dark logo");
  assert.equal(plateFromPixels(px([220, 110, 30, 255], 30, [0, 0, 0, 0], 70)), "none", "orange reads on both");
  assert.equal(plateFromPixels(px([255, 255, 255, 255], 100)), "none", "own opaque background");
  assert.equal(plateFromPixels(Uint8ClampedArray.from([...px([255, 255, 255, 255], 15), ...px([10, 10, 10, 255], 15), ...px([0, 0, 0, 0], 70)])), "both", "white and dark parts");
  assert.equal(plateFromPixels(new Uint8ClampedArray(400)), "none", "nothing visible");
});

test("mode badge, accent card, code plate: fixed mode colors, two parts for both, printed colors", () => {
  const css = parts[4][1];
  assert.match(css, /--oc-mode-test: var\(--color-orange-20\);\s*--oc-mode-live: var\(--color-green-10\);\s*--oc-mode-ink: var\(--color-duskblue-90\);/);
  assert.match(css, /\.oc-mode-badge\[data-mode="both"\] > \* \+ \* \{ background: var\(--oc-mode-live\); \}/);
  assert.match(css, /\.oc-card\.oc-card--accent \{[^}]*border: 2px solid var\(--oc-card-tone\);/);
  assert.match(css, /\.oc-card--accent\[data-active="false"\] \{ border-style: dashed; \}/);
  assert.match(css, /\.oc-code-plate \{\s*color-scheme: light;/);
  assert.match(css, /@media print \{[^@]*print-color-adjust: exact;/);
});

test("sidebar meta: tooltip only when collapsed, brand and copyright hidden there", () => {
  const css = parts[5][1];
  // 0.17.0: an explicitly collapsed line (--collapsed) keeps its tooltip inside an open sidebar
  assert.match(css, /\.oc-sidebar:not\(\.oc-sidebar--collapsed\) \.oc-sidebar-meta\.oc-tooltip:not\(\.oc-sidebar-meta--collapsed\)::after \{ content: none; \}/);
  assert.match(css, /\.oc-sidebar--collapsed \.oc-sidebar-meta :is\(\.oc-sidebar-meta__brand, \.oc-sidebar-meta__copy\),\s*\.oc-sidebar-meta--collapsed :is\(\.oc-sidebar-meta__brand, \.oc-sidebar-meta__copy\) \{[^}]*clip-path: inset\(50%\);/);
  assert.match(css, /\.oc-sidebar-meta__copy \{[^}]*text-overflow: ellipsis;/);
});

test("scripts, exports, snippets and manifest", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.equal(pkg.exports["./combobox.js"], "./dist/combobox.js");
  assert.equal(pkg.exports["./logo.js"], "./dist/logo.js");
  const copy = read("../bin/lib/copy-js.mjs");
  assert.match(copy, /"dist\/combobox\.js", "oc-combobox\.js"/);
  assert.match(copy, /"dist\/logo\.js", "oc-logo\.js"/);
  for (const s of ["mode-badge", "code-plate", "logo"]) assert.ok(fs.existsSync(new URL(`../snippets/${s}.html`, import.meta.url)), s);
  assert.match(read("../snippets/combobox.html"), /oc-combobox-option-icon/);
  assert.match(read("../snippets/language-select.html"), /oc-language-menu/);
  const manifest = JSON.parse(read("../manifest.json")).items.map((i) => i.name);
  for (const s of ["mode-badge", "code-plate", "logo"]) assert.ok(manifest.includes(s), `manifest: ${s}`);
});
