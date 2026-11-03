// File: packages/ui/test/site.test.mjs
// Map: theme tokens of the site parts (backdrop, footer, band) -> footer container queries -> brand mark sizes -> snippets

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const showcase = read("../src/showcase.css");
const layout = read("../src/parts/site-layout.css");
const brand = read("../src/parts/site-brand-mark.css");

test("backdrop, footer and band take their colors and columns from tokens", () => {
  for (const token of ["--oc-backdrop-1", "--oc-backdrop-2", "--oc-backdrop-3", "--oc-backdrop-3-opacity", "--oc-backdrop-grid", "--oc-footer-bg", "--oc-footer-cols", "--oc-footer-cols-md", "--oc-footer-bottom-color"]) {
    assert.ok(showcase.includes(`var(${token}`), `showcase.css reads ${token}`);
  }
  assert.ok(layout.includes("var(--oc-band-bg"), "the band reads --oc-band-bg");
});

test("the footer follows its own width (container queries), not the screen", () => {
  assert.match(showcase, /\.oc-site-footer \{[^}]*container-type: inline-size/);
  assert.match(showcase, /@container \(max-width: 66rem\) \{\s*\.oc-site-footer__grid/);
  assert.match(showcase, /@container \(max-width: 54rem\) \{\s*\.oc-site-footer__grid \{ grid-template-columns: 1fr 1fr; \}/);
});

test("brand mark sizes are tokens and the snippets use the classes", () => {
  for (const size of ["--sm", "--lg"]) assert.match(brand, new RegExp(`\\.oc-brand-mark${size} \\{[^}]*--oc-brand-mark-icon`));
  assert.match(read("../snippets/brand-mark.html"), /class="oc-brand-mark__accent"/);
  for (const cls of ["oc-section-pad--page", "oc-display--page", "oc-section-head", "oc-actions", "oc-meta"]) {
    assert.ok(read("../snippets/page-sections.html").includes(cls), `page-sections snippet uses ${cls}`);
  }
});

test("fly.js only hides cards once it runs, and respects reduced motion", () => {
  const fly = read("../src/fly.js");
  const css = read("../src/parts/site-fly.css");
  assert.match(fly, /classList\.add\("oc-fly-ready"\)/);
  assert.match(fly, /prefers-reduced-motion: reduce/);
  assert.match(fly, /--oc-fly-x/);
  assert.match(css, /\.oc-fly-ready \.oc-reveal--fly:not\(\.is-visible\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  // The product card lifts with translate, so a fly-in (transform) does not cancel it.
  assert.match(showcase, /\.oc-product-card:hover \{[^}]*translate: 0 calc\(-1 \* var\(--oc-hover-lift, 6px\)\)/);
  assert.doesNotMatch(showcase, /\.oc-product-card:hover \{[^}]*transform:/);
});

test("split ratios, wide card grid and legal prose", () => {
  assert.match(showcase, /\.oc-split \{[^}]*var\(--oc-split-cols,/);
  assert.match(showcase, /\.oc-split--lead \{ --oc-split-cols: 1\.25fr 1fr; \}/);
  assert.match(showcase, /\.oc-split--media \{ --oc-split-cols: 1fr 1\.15fr; \}/);
  assert.match(showcase, /\.oc-card-grid--wide \{ --oc-card-min: 32rem;/);
  assert.match(read("../src/parts/site-prose.css"), /\.oc-prose--legal \{ max-inline-size: 46rem;/);
});

test("round 2: ratios only above 960px, fit grid, muted text, gutter and fly options", () => {
  assert.match(showcase, /@media \(min-width: 961px\) \{\s*\.oc-split \{ grid-template-columns: var\(--oc-split-cols-wide,/);
  assert.match(showcase, /@media \(min-width: 961px\) \{\s*\.oc-spotlight \{ grid-template-columns: var\(--oc-spotlight-cols,/);
  // The base rule (outside the media query) has no token, so the spotlight stacks on a phone.
  assert.match(showcase, /\.oc-spotlight \{\r?\n  display: grid;\r?\n  grid-template-columns: repeat\(auto-fit,/);
  assert.match(showcase, /\.oc-card-grid--fit \{ grid-template-columns: repeat\(auto-fit,/);
  assert.match(showcase, /var\(--oc-container-gutter, 1\.25rem\)/);
  assert.match(layout, /\.oc-text-muted \{ color: var\(--oc-muted-foreground\); \}/);
  const fly = read("../src/fly.js");
  for (const option of ["--oc-fly-step", "--oc-fly-stagger", "--oc-fly-delay", "data-oc-fly-repeat"]) assert.ok(fly.includes(option), option);
  assert.match(read("../src/parts/site-fly.css"), /var\(--oc-fly-delay, 0s\)/);
});

test("hover effects: one class per card, smooth curve, steady hover area", () => {
  const hover = read("../src/parts/utility-hover.css");
  for (const cls of ["oc-hover-lift", "oc-hover-grow", "oc-hover-glow", "oc-hover-none"]) assert.match(hover, new RegExp(`\\.${cls}:hover`), cls);
  for (const token of ["--oc-hover-lift", "--oc-hover-scale", "--oc-hover-duration", "--oc-hover-ease"]) assert.ok(hover.includes(`var(${token}`), token);
  assert.match(hover, /:hover::before \{[^}]*z-index: -1/, "the strip under a lifted card keeps the hover");
  assert.match(hover, /prefers-reduced-motion: reduce/);
  assert.match(read("../src/parts/site-base.css"), /\.oc-skip-link:focus \{ translate: none; \}/);
});
