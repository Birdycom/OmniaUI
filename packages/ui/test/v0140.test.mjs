// File: packages/ui/test/v0140.test.mjs
// Map: meter row (sub-line, fill element, dense) -> reading levels -> static menu -> code language select (CSS + helper)
//      -> accordion status -> neon and backgrounds (tokens, reduced motion) -> graph levels -> particle options -> snippets

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { languageCode } from "../src/form-extras.js";
import { particleOptions } from "../src/particles.js";

// The checkout can have CRLF line ends (.gitattributes eol=crlf): compare with LF.
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const part = (name) => read(`../src/parts/${name}.css`);

test("meter row: a sub-line with its own bar, a fill element that replaces the drawn fill, a dense list", () => {
  const css = part("data-meter-row");
  assert.match(css, /\.oc-meter-row__sub \{/);
  assert.match(css, /\.oc-meter-row__subbar::before \{[^}]*var\(--oc-meter, 0%\)/);
  assert.match(css, /\.oc-meter-row__bar:has\(> \.oc-meter-row__fill\)::before \{ content: none; \}/);
  assert.match(css, /\.oc-meter-list--dense \.oc-meter-row__bar \{ block-size: 5px; \}/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.oc-meter-row__fill \{ transition: none; \}/);
});

test("reading levels and the group tones use theme tokens", () => {
  const reading = part("data-reading");
  assert.match(reading, /\.oc-reading--warm \{ --oc-reading-color: var\(--oc-warning\); \}/);
  assert.match(reading, /\.oc-reading--hot \{ --oc-reading-color: var\(--oc-destructive\); \}/);
  assert.match(reading, /font-variant-numeric: tabular-nums/);
  const group = part("app-group");
  assert.match(group, /\.oc-group \+ \.oc-group \{ border-block-start: 1px solid/);
  for (const tone of ["busy", "ok", "warn", "error"]) assert.match(group, new RegExp(`data-tone="${tone}"`));
});

test("static menu drops the popover position and draws its own check column", () => {
  const css = part("nav-menu-static");
  assert.match(css, /\.oc-dropdown-menu\.oc-dropdown-menu--static\[popover\] \{\n  position: static;/);
  assert.match(css, /\.oc-dropdown-item\[aria-checked="true"\] > \.oc-dropdown-check::before \{ opacity: 1; \}/);
  assert.match(css, /\.oc-dropdown-item:has\(> \.oc-dropdown-check\)::before \{ content: none; \}/);
});

test("code language select shows data-code and keeps the native list", () => {
  const css = part("forms-language-select");
  assert.match(css, /\.oc-language-select--code::before \{ content: attr\(data-code\);/);
  assert.match(css, /\.oc-language-select--code \.oc-language-select-control \{ position: absolute; inset: 0; padding: 0; opacity: 0; \}/);
  const option = (value, code) => ({ value, dataset: code ? { code } : {} });
  assert.equal(languageCode({ selectedOptions: [option("nl")], value: "nl" }), "NL");
  assert.equal(languageCode({ selectedOptions: [option("en-gb", "UK")], value: "en-gb" }), "UK");
});

test("accordion status colors one row per check", () => {
  const css = part("app-accordion-accent");
  for (const [status, token] of [["ok", "--oc-success"], ["warn", "--oc-warning"], ["error", "--oc-destructive"], ["skip", "--oc-muted-foreground"], ["pending", "--oc-primary"]]) {
    assert.match(css, new RegExp(`\\[data-status="${status}"\\] \\{ --oc-accordion-accent: var\\(${token}\\); \\}`));
  }
  assert.match(css, /\.oc-accordion-accent-dot \{/);
});

test("neon, backgrounds and the graph follow the accent colors and stand still with reduced motion", () => {
  const neon = part("site-neon");
  assert.match(neon, /\.oc-glow-border::after \{[^}]*solid var\(--oc-accent-to\)/);
  assert.match(neon, /\.oc-btn--neon \{[^}]*linear-gradient\(135deg, var\(--oc-accent-from\), var\(--oc-accent-to\)\)/);
  assert.match(neon, /prefers-reduced-motion[\s\S]*\.oc-glow-border::after \{ animation: none; \}/);
  const bg = part("site-backgrounds");
  for (const cls of ["oc-bg-grid", "oc-orb", "oc-scanlines", "oc-particles"]) assert.match(bg, new RegExp(`\\.${cls} \\{[^}]*pointer-events: none`));
  assert.match(bg, /prefers-reduced-motion[\s\S]*\.oc-orb--drift \{ animation: none; \}/);
  const graph = part("data-graph");
  assert.match(graph, /\.oc-graph__node\[data-level="high"\],\n\.oc-graph__tip\[data-level="high"\] \{ --oc-graph-color: var\(--oc-destructive\); \}/);
  assert.match(graph, /prefers-reduced-motion[\s\S]*\.oc-graph__edge, \.oc-graph__pulse \{ animation: none; \}/);
  assert.doesNotMatch(graph + neon + bg, /#[0-9a-f]{3,8}\b/i, "no hex colors, only tokens");
});

test("particle field options come from data attributes, with defaults", () => {
  assert.deepEqual(particleOptions({ dataset: {} }), { count: 110, speed: 0.35, link: 115 });
  assert.deepEqual(particleOptions({ dataset: { count: "40", speed: "0.2", link: "x" } }), { count: 40, speed: 0.2, link: 115 });
});

test("every new part has a snippet in the manifest", () => {
  const manifest = JSON.parse(read("../manifest.json"));
  for (const name of ["reading", "callout", "menu-static", "group", "neon", "backgrounds", "particle-field", "graph"]) {
    assert.ok(manifest.items.some((i) => i.name === name), `${name} in the manifest`);
    assert.ok(fs.existsSync(new URL(`../snippets/${name}.html`, import.meta.url)), `snippets/${name}.html`);
  }
});
