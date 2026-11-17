// File: packages/ui/test/v0160.test.mjs
// Map: paper (tokens, layers, tones) -> writing paper -> edges (mask, one tile that repeats) -> paper theme -> snippet in the manifest

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// The checkout can have CRLF line ends (.gitattributes eol=crlf): compare with LF.
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const css = read("../src/parts/site-paper.css");

test("paper: palette colors only, a grain layer, tones, and the same color in light and dark mode", () => {
  // The inline SVGs write "#" as %23, so a real hex color would be the only match.
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, "no hex colors, only tokens");
  assert.match(css, /\.oc-paper \{[^}]*color-scheme: light;/);
  assert.doesNotMatch(css.split("/* Paper theme")[0], /light-dark\(/, "paper itself has one color, not a light and a dark one");
  assert.match(css, /background-image: var\(--oc-paper-layer-margin, none\), var\(--oc-paper-layer-rule, none\), var\(--oc-paper-grain\);/);
  assert.match(css, /\.oc-paper--smooth \{ --oc-paper-grain: none; \}/);
  for (const tone of ["bright", "ivory", "gray", "kraft"]) assert.match(css, new RegExp(`\\.oc-paper--${tone} \\{[^}]*--oc-paper-l: [^;]+; --oc-paper-c: `), tone);
  assert.doesNotMatch(css, /[^\x00-\x7f]/, "ASCII only (data URIs and comments)");
});

test("writing paper: the text takes the rule distance as its line height", () => {
  assert.match(css, /\.oc-paper--lined \{[^}]*--oc-paper-rule-size: 100% var\(--oc-paper-line\);[^}]*line-height: var\(--oc-paper-line\);/);
  assert.match(css, /\.oc-paper--margin \{[^}]*padding-inline-start: calc\(var\(--oc-paper-margin-at\) \+ 1rem\);/);
  assert.match(css, /\.oc-paper--margin:dir\(rtl\) \{/);
  assert.match(css, /\.oc-paper--grid \{[^}]*conic-gradient/);
  assert.match(css, /\.oc-paper--dots \{[^}]*radial-gradient/);
  // Millimeter paper: three line layers of 10, 5 and 1 times --oc-paper-mm (1mm), then the grain.
  const mm = css.match(/\.oc-paper--mm \{[^}]*\}/)[0];
  assert.match(mm, /--oc-paper-mm: 1mm;/);
  assert.equal(mm.match(/conic-gradient\(/g).length, 3);
  assert.match(mm, /calc\(var\(--oc-paper-mm\) \* 10\) calc\(var\(--oc-paper-mm\) \* 10\),\s*calc\(var\(--oc-paper-mm\) \* 5\) calc\(var\(--oc-paper-mm\) \* 5\),\s*var\(--oc-paper-mm\) var\(--oc-paper-mm\),/);
});

test("paper edges: the torn tile starts and ends at the same height, so it repeats without a step", () => {
  for (const name of ["end", "start"]) {
    const d = css.match(new RegExp(`--oc-paper-tear-${name}: url\\("[^"]*path d='([^']+)'`))[1];
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    // "M0 Y H200 V y1 L …pairs… 0 yN Z": the first torn point is y1 at x=200, the last pair is x=0, yN.
    assert.equal(nums[3], nums.at(-1), `tear-${name}: same height at both ends`);
    assert.equal(nums.at(-2), 0, `tear-${name}: ends at x=0`);
  }
  for (const edge of ["torn", "torn-top", "torn-both", "zigzag", "holes"]) assert.match(css, new RegExp(`\\.oc-paper--${edge} \\{[^}]*mask:`), edge);
  assert.match(css, /\.oc-paper--fold \{[^}]*clip-path: polygon/);
  assert.match(css, /\.oc-paper-lift \{ display: grid; filter: drop-shadow/);
});

test("paper theme sets the page, card and popover color", () => {
  assert.match(css, /\.oc-paper-theme \{[^}]*--oc-background: light-dark\([^;]+;\s*--oc-card: light-dark\([^;]+;\s*--oc-popover: var\(--oc-card\);/);
});

test("paper has a snippet in the manifest", () => {
  const manifest = JSON.parse(read("../manifest.json"));
  assert.ok(manifest.items.some((i) => i.name === "paper"), "paper in the manifest");
  assert.ok(fs.existsSync(new URL("../snippets/paper.html", import.meta.url)), "snippets/paper.html");
});

// theme.js: the stored choice, the theme that is shown, and what lands on <html>.
import { normalizeTheme, readTheme, writeTheme, effectiveTheme, applyTheme, THEME_HEAD_SCRIPT } from "../src/theme.js";

const fakeStorage = (data = {}) => ({ getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; }, data });
const fakeRoot = () => {
  const attrs = {}; const classes = new Set();
  return { attrs, classes, setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; }, classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)) } };
};

test("theme.js: the choice is system, light or dark; system is not stored", () => {
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("purple"), "system");
  assert.equal(readTheme(fakeStorage({ "oc-theme": "light" })), "light");
  assert.equal(readTheme(fakeStorage()), "system");
  assert.equal(readTheme({ getItem() { throw new Error("blocked"); } }), "system");
  const store = fakeStorage({ "oc-theme": "dark" });
  writeTheme(store, "system");
  assert.ok(!("oc-theme" in store.data));
  writeTheme(store, "light");
  assert.equal(store.data["oc-theme"], "light");
});

test("theme.js: data-theme and .dark on the root; system removes them and follows the operating system", () => {
  assert.equal(effectiveTheme("system", true), "dark");
  assert.equal(effectiveTheme("light", true), "light");
  const root = fakeRoot();
  assert.equal(applyTheme(root, "dark"), "dark");
  assert.equal(root.attrs["data-theme"], "dark");
  assert.ok(root.classes.has("dark"));
  assert.equal(applyTheme(root, "system", { prefersDark: false }), "light");
  assert.ok(!("data-theme" in root.attrs) && !root.classes.has("dark"));
  applyTheme(root, "dark", { darkClass: false });
  assert.ok(!root.classes.has("dark"), "darkClass: false leaves the class alone");
  assert.match(THEME_HEAD_SCRIPT, /localStorage\.getItem\("oc-theme"\)/);
});

test("0.16.0 additions for the apps: card tone, status badge, light / dark image, header glass", () => {
  const apps = read("../src/parts/app-0160-apps.css");
  assert.match(apps, /\.oc-card\[data-tone\] \{[^}]*box-shadow: inset 3px 0 0 var\(--oc-card-tone\);/);
  for (const status of ["working", "waiting", "done", "error", "idle"]) assert.ok(apps.includes(`.oc-badge--status[data-status="${status}"]`), status);
  assert.match(apps, /\.oc-theme-img--dark \{ display: none; \}/);
  assert.match(apps, /\.oc-card-grid--scroll \{[^}]*scroll-snap-type: inline mandatory;/);
  const showcase = read("../src/showcase.css");
  // The glass colors are plain declarations with a factor; the keyframes animate the factor only.
  assert.match(showcase, /@keyframes oc-header-glass \{\n  to \{ --oc-header-glass: 1; \}\n\}/);
  assert.match(showcase, /prefers-reduced-motion: reduce\) \{\n  \.oc-site-header \{ --oc-header-glass: 1; \}/);
  assert.match(showcase, /\.oc-section-pad \{ padding-block: var\(--oc-section-space, /);
});
