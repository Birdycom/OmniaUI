// File: packages/ui/test/v0141.test.mjs
// Map: tint card (tint mix, lift, tones) -> corner art (drift + hover tilt on separate properties) -> arrow chip
//      -> reduced motion -> split section head -> snippet in the manifest -> sticky offset + doc layout -> toc.js

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// The checkout can have CRLF line ends (.gitattributes eol=crlf): compare with LF.
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const part = (name) => read(`../src/parts/${name}.css`);

test("tint card: tint mixed with the card color, lift and a shadow in the tint, tones from theme tokens", () => {
  const css = part("site-tint-card");
  assert.match(css, /color-mix\(in oklab, var\(--oc-tint\) var\(--oc-tint-mix\), var\(--oc-card, var\(--oc-background\)\)\)/);
  assert.match(css, /translate: 0 -4px;/);
  for (const tone of ["success", "warning", "destructive"]) {
    assert.ok(css.includes(`.oc-tint-card--${tone} { --oc-tint: var(--oc-${tone}); --oc-tint-foreground: var(--oc-${tone}-foreground); }`), tone);
  }
});

test("tint card art: the drift animates transform on the GPU, the hover sets rotate and scale, so they never fight", () => {
  const css = part("site-tint-card");
  assert.ok(css.includes("@keyframes oc-tint-drift {\n  from { transform: translate3d(0, 0, 0); }\n  to { transform: translate3d(-4px, -10px, 0); }"));
  assert.ok(css.includes("will-change: transform;\n  animation: oc-tint-drift"));
  assert.match(css, /rotate: -8deg;\n  scale: 1\.12;/);
  assert.match(css, /@keyframes oc-tint-go/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.oc-tint-card__art,[\s\S]*animation: none;/);
});

test("split section head: two columns from 56rem, one below", () => {
  const css = part("site-layout");
  assert.match(css, /\.oc-section-head--split \{[^}]*display: grid;/);
  assert.match(css, /@media \(min-width: 56rem\) \{\n  \.oc-section-head--split \{ grid-template-columns:/);
});

test("the tint card has a snippet in the manifest", () => {
  const manifest = JSON.parse(read("../manifest.json"));
  assert.ok(manifest.items.some((i) => i.name === "tint-card"), "tint-card in the manifest");
  assert.ok(fs.existsSync(new URL("../snippets/tint-card.html", import.meta.url)));
});

test("sticky offset: follows the page's own site header, is the scroll padding and is used by the sticky parts", () => {
  const css = part("site-doc-layout");
  assert.ok(css.includes(":where(html:has(.oc-site-header:not(main *))) { --oc-sticky-offset: calc(var(--oc-site-header-height, 4.5rem) + 1rem); }"));
  assert.ok(css.includes(":where(html) { scroll-padding-block-start: var(--oc-sticky-offset, 0px); }"));
  assert.match(css, /@media \(min-width: 64rem\) \{[\s\S]*\.oc-doc-layout__aside \{\n    position: sticky;\n    inset-block-start: var\(--oc-sticky-offset, 0px\);/);
  assert.ok(part("app-page-header").includes(".oc-page-header--sticky { position: sticky; inset-block-start: var(--oc-sticky-offset, 0px);"));
  const docs = read("../src/docs-ui.css");
  assert.match(docs, /@media \(min-width: 64rem\) \{\n  \.oc-toc \{ position: sticky; inset-block-start: var\(--oc-sticky-offset, 0px\); \}/);
  assert.match(docs, /\.oc-toc-group-label \{/);
  assert.ok(part("site-prose").includes(".oc-prose--ruled :where(h2) {"));
});

test("toc.js: the current heading is the last one above the line; nothing to do where :target-current works", async () => {
  const { currentIndex, initToc } = await import("../src/toc.js");
  assert.equal(currentIndex([-500, -20, 300, 900], 280), 1);
  assert.equal(currentIndex([400, 900], 280), -1);
  assert.equal(currentIndex([-10, 100, 280], 280), 2);
  // No table of contents in scope: nothing to start, and a stop function all the same.
  const fakeDoc = { defaultView: { CSS: { supports: () => true } }, querySelectorAll: () => [] };
  assert.equal(typeof initToc(fakeDoc), "function");
});

test("toc.js keeps the current link in view in a long table of contents", async () => {
  const { keepInView } = await import("../src/toc.js");
  assert.equal(keepInView(0, 400, 100, 130), 0);
  assert.equal(keepInView(0, 400, 600, 630), 254);
  assert.equal(keepInView(500, 400, 300, 330), 276);
});

test("toc groups: one scroll-target group per table of contents; prose anchors add up with the sticky offset", () => {
  const docs = read("../src/docs-ui.css");
  assert.ok(docs.includes(".oc-toc { scroll-target-group: auto; }\n.oc-toc .oc-toc-list { scroll-target-group: none; }"));
  assert.ok(part("site-prose").includes("scroll-margin-block-start: max(0.5rem, 5rem - var(--oc-sticky-offset, 0px));"));
  const dl = part("data-dl-glossary");
  assert.match(dl, /\.oc-dl--glossary \.oc-dl-term \{ color: var\(--oc-foreground\); font-weight: 600; \}/);
  assert.match(dl, /\.oc-dl--glossary :is\(\.oc-dl-term, \.oc-dl-detail\) \{ line-height: 1\.55; \}/);
});

test("the document layout has a snippet and toc.js is exported and copied", () => {
  const manifest = JSON.parse(read("../manifest.json"));
  assert.ok(manifest.items.some((i) => i.name === "doc-layout"));
  assert.equal(JSON.parse(read("../package.json")).exports["./toc.js"], "./dist/toc.js");
  assert.match(read("../bin/lib/copy-js.mjs"), /"dist\/toc\.js", "oc-toc\.js"/);
});

test("endless animations only move transform or opacity (the GPU draws them), apart from a short known list", () => {
  // Loading or demo-only effects that may still paint: they run while something loads, or on a docs stage.
  const allowed = new Set(["oc-graph-flow", "oc-lazy-shimmer", "oc-top-progress-slide", "oc-glass-stage"]);
  const dir = new URL("../src/parts/", import.meta.url);
  const css = [read("../src/components.css"), read("../src/showcase.css"), ...fs.readdirSync(dir).map((f) => read(`../src/parts/${f}`))].join("\n");
  const endless = new Set([...css.matchAll(/animation:\s*([\w-]+)[^;]*infinite/g)].map((m) => m[1]));
  assert.ok(endless.size > 5, "found the endless animations");
  for (const name of endless) {
    if (allowed.has(name)) continue;
    const start = css.indexOf(`@keyframes ${name} {`);
    assert.ok(start >= 0, `keyframes ${name}`);
    // The keyframes block: up to the brace that closes it.
    let depth = 0, end = start;
    for (let i = css.indexOf("{", start); i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) { end = i; break; }
    }
    const props = [...css.slice(start, end).matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]);
    for (const p of props) assert.ok(["transform", "opacity", "translate", "rotate", "scale"].includes(p), `${name} animates ${p}`);
  }
});

test("status dot, pill dot, version banner and glow border pulse with a ::after; bars keep their layout inside", () => {
  assert.match(part("app-status-dot"), /\.oc-status-dot--working::after \{[^}]*animation: oc-status-dot-pulse 1\.8s ease-out var\(--oc-status-dot-pulses, infinite\);/);
  assert.match(read("../src/showcase.css"), /\.oc-pill \.oc-status-dot::after \{[^}]*animation: oc-status-dot-ring/);
  assert.match(part("app-version-banner"), /\.oc-version-banner-dot::after \{[^}]*animation: oc-version-banner-pulse/);
  assert.match(part("site-neon"), /\.oc-glow-border::after \{[^}]*animation: oc-glow-border/);
  assert.ok(read("../src/components.css").includes(".oc-progress { contain: layout paint; }"));
  assert.ok(read("../src/components.css").includes(".oc-progress--live .oc-progress-bar { transition: none; }"));
  assert.match(part("data-meter-row"), /\.oc-meter-row__bar \{\n  contain: layout paint;/);
});

test("language select: the open list in the dropdown look, under the field; the page switch keeps the #hash", async () => {
  const css = part("forms-language-select");
  assert.match(css, /@supports \(appearance: base-select\) \{/);
  assert.match(css, /\.oc-language-select-control::picker\(select\) \{[^}]*background: var\(--oc-popover\);[^}]*position-try-order: normal;\n    position-try-fallbacks: flip-block;/);
  assert.match(css, /\.oc-language-select--code \.oc-language-select-control::picker\(select\) \{ position-area: block-end span-inline-start; \}/);
  const { languageTarget } = await import("../src/language-select.js");
  assert.equal(languageTarget("/en/privacy", "#cookies"), "/en/privacy#cookies");
  assert.equal(languageTarget("/en/privacy#top", "#cookies"), "/en/privacy#top");
  assert.equal(languageTarget("/en/privacy", "#cookies", false), "/en/privacy");
  assert.equal(languageTarget("", "#x"), "");
  assert.equal(JSON.parse(read("../package.json")).exports["./language-select.js"], "./dist/language-select.js");
});

test("step list: one row per step, the number in the severity color of the card around it, else primary", () => {
  const css = part("data-step-list");
  assert.match(css, /\.oc-step-list > li::before \{[^}]*content: counter\(oc-step-list\);[^}]*color: var\(--oc-step-list-color, var\(--oc-severity-color, var\(--oc-primary\)\)\);/);
  assert.match(css, /\.oc-step-list > li \{[^}]*padding-inline-start: 1\.85rem;/);
  assert.doesNotMatch(css, /\.oc-step-list > li \{[^}]*display: grid/, "inline text and links must not become grid cells");
  const manifest = JSON.parse(read("../manifest.json"));
  assert.ok(manifest.items.some((i) => i.name === "step-list"));
});
