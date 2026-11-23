// File: packages/ui/test/v0170-bc.test.mjs
// Map: 0.17.0 BC CSS: hero media (layers, scrim start / end / full, phone = full, align, dark scheme) -> split reverse
//      (rtl grid, ltr content, rtl pages) -> aspect flush -> dl numbered (decimal-leading-zero counter)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");
/** The rule that starts with `selector {`, up to its closing brace. */
const rule = (css, selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `missing ${selector}`);
  return css.slice(at, css.indexOf("}", at) + 1);
};

test("hero media: media layer covers the section, scrim above it, content on top", async () => {
  const css = await read("parts/site-hero-media.css");
  const root = rule(css, ".oc-hero-media");
  assert.match(root, /position: relative;/);
  assert.match(root, /isolation: isolate;/);
  assert.match(root, /overflow: hidden;/);
  assert.match(root, /color-scheme: dark;/);
  const media = rule(css, ".oc-hero-media__media");
  assert.match(media, /inset: 0;/);
  assert.match(media, /object-fit: cover;/);
  assert.match(media, /z-index: 0;/);
  assert.match(rule(css, ".oc-hero-media::before"), /z-index: 1;/);
  assert.match(rule(css, ".oc-hero-media__content"), /z-index: 2;/);
});

test("hero media: scrim start / end / full, mirrored on rtl, full on a phone; align center / end", async () => {
  const css = await read("parts/site-hero-media.css");
  assert.match(rule(css, ".oc-hero-media--scrim-start::before"), /linear-gradient\(to right, var\(--oc-hero-media-scrim\)/);
  assert.match(rule(css, ".oc-hero-media--scrim-end::before"), /linear-gradient\(to left, var\(--oc-hero-media-scrim\)/);
  assert.match(rule(css, ".oc-hero-media--scrim-start:dir(rtl)::before"), /to left/);
  assert.match(rule(css, ".oc-hero-media--scrim::before"), /--oc-hero-media-scrim-full/);
  const phone = css.slice(css.indexOf("@media (max-width: 48rem)"));
  assert.match(phone, /:is\(\.oc-hero-media--scrim-start, \.oc-hero-media--scrim-end\)::before/);
  assert.match(rule(css, ".oc-hero-media--center .oc-hero-media__content"), /text-align: center;/);
  assert.match(rule(css, ".oc-hero-media--end .oc-hero-media__content"), /justify-items: end;/);
});

test("split reverse: rtl grid with ltr content; the other way round on rtl pages", async () => {
  const css = await read("parts/site-split-reverse.css");
  assert.match(rule(css, ".oc-split--reverse"), /direction: rtl;/);
  assert.match(rule(css, ".oc-split--reverse > *"), /direction: ltr;/);
  assert.match(rule(css, ".oc-split--reverse:dir(rtl)"), /direction: ltr;/);
  assert.match(rule(css, ".oc-split--reverse:dir(rtl) > *"), /direction: rtl;/);
});

test("aspect flush: no radius, no background", async () => {
  const css = await read("parts/media-aspect-flush.css");
  assert.match(rule(css, ".oc-aspect--flush"), /border-radius: 0; background: none;/);
});

test("dl numbered: counter per row, decimal-leading-zero above the term", async () => {
  const css = await read("parts/data-dl-numbered.css");
  assert.match(rule(css, ".oc-dl--numbered"), /counter-reset: oc-dl;/);
  assert.match(rule(css, ".oc-dl--numbered > .oc-dl-row"), /counter-increment: oc-dl;/);
  const before = rule(css, ".oc-dl--numbered .oc-dl-term::before");
  assert.match(before, /content: counter\(oc-dl, decimal-leading-zero\);/);
  assert.match(before, /display: block;/);
  assert.match(before, /font-variant-numeric: tabular-nums;/);
});
