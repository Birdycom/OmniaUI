// File: packages/ui/test/v0170-app.test.mjs
// Map: 0.17.0 app-migration fixes: OTP no scroll on a full code (text-shadow digits, own size) -> barcode bare + digit
//      groups + fits a narrow container -> copy field toggle / wrap / icons -> recovery codes icons + feedback -> snippets

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { digitGroups, digitsHtml, encodeBarcode } from "../src/barcode.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFile(path.resolve(here, "../src", f), "utf8");
const snippet = (f) => fs.readFile(path.resolve(here, "../snippets", f), "utf8");
const rule = (css, selector) => {
  const at = css.indexOf(`\n${selector} {`);
  assert.ok(at >= 0, `rule ${selector} not found`);
  return css.slice(at, css.indexOf("\n}", at));
};

test("otp: a full code fits the field, so the caret at the end never scrolls it", async () => {
  const css = await read("components.css");
  const otp = rule(css, ".oc-otp");
  // the field is exactly length x cell wide and the text starts at the left edge of the first cell (no start padding):
  // the trailing letter-spacing of the last digit then ends exactly at the right edge
  assert.match(otp, /inline-size: calc\(var\(--oc-otp-length\) \* var\(--oc-otp-cell\)\);/);
  assert.match(otp, /padding: 0\.6rem 0;/);
  assert.doesNotMatch(otp, /padding: 0\.6rem 0 0\.6rem calc/);
  assert.match(otp, /letter-spacing: calc\(var\(--oc-otp-cell\) - 1ch\);/);
  // the visible digit is a shadow moved half a cell gap to the right; the real glyph is transparent
  assert.match(otp, /--oc-otp-shift: calc\(\(var\(--oc-otp-cell\) - 1ch\) \/ 2\);/);
  assert.match(otp, /-webkit-text-fill-color: transparent;/);
  assert.match(otp, /text-shadow: var\(--oc-otp-shift\) 0 0 var\(--oc-foreground\);/);
  assert.match(otp, /caret-color: var\(--oc-foreground\);/);
  assert.match(css, /\.oc-otp::selection \{[^}]*text-shadow: var\(--oc-otp-shift\) 0 0 var\(--oc-foreground\);/);
  assert.match(css, /@media \(forced-colors: active\) \{\s*\.oc-otp, \.oc-otp::placeholder \{ -webkit-text-fill-color: currentColor; text-shadow: none; \}/);
});

test("otp: own block-size and font-size against a global input { height } rule", async () => {
  const otp = rule(await read("components.css"), ".oc-otp");
  assert.match(otp, /box-sizing: border-box;/);
  assert.match(otp, /block-size: calc\(1lh \+ 1\.2rem \+ 2px\);/);
  assert.match(otp, /min-block-size: 0;/);
  assert.match(otp, /font-size: var\(--oc-otp-size, 1\.5rem\);/);
  assert.match(otp, /line-height: 1\.2;/);
});

test("barcode: digit groups per format", () => {
  assert.deepEqual(digitGroups("5400000000010", "EAN13"), ["5", "400000", "000010"]);
  assert.deepEqual(digitGroups("96385074", "EAN8"), ["9638", "5074"]);
  assert.deepEqual(digitGroups("0036000291452", "UPC"), ["0", "36000", "29145", "2"]);
  assert.deepEqual(digitGroups("SKU-000105", "CODE128"), ["SKU-000105"]);
  assert.equal(encodeBarcode("03600029145", "UPC").format, "UPC");
  assert.equal(encodeBarcode("5400000000010").format, "EAN13");
  assert.equal(encodeBarcode("SKU-1").format, "CODE128");
  assert.equal(digitsHtml("96385074", "EAN8"), '<figcaption class="oc-barcode__digits"><span class="oc-barcode__group">9638</span><span class="oc-barcode__group">5074</span></figcaption>');
  assert.equal(digitsHtml("96385074", "EAN8", false), '<figcaption class="oc-barcode__digits"><span class="oc-barcode__group">96385074</span></figcaption>');
});

test("barcode: --bare, groups and a narrow container", async () => {
  const css = await read("parts/media-barcode.css");
  assert.match(css, /\.oc-barcode\.oc-barcode--bare \{ padding: 0; color: inherit; background: none; border: 0; border-radius: 0; \}/);
  assert.match(rule(css, ".oc-barcode"), /max-inline-size: 100%;/);
  assert.match(css, /\.oc-barcode svg \{[^}]*max-inline-size: 100%; min-inline-size: 0; \}/);
  assert.match(rule(css, ".oc-barcode__digits"), /display: flex;[\s\S]*column-gap: 0\.6em;/);
  // the default plate stays white with black bars (scanners)
  assert.match(rule(css, ".oc-barcode"), /background: var\(--color-white-50\);/);
});

test("copy field: icon + label button, show/hide toggle, wrap", async () => {
  const css = await read("parts/forms-copy-field-extras.css");
  assert.match(css, /\.oc-copy-field-toggle\[aria-pressed="true"\] > \.oc-copy-field-icon-show,\s*\.oc-copy-field-toggle:not\(\[aria-pressed="true"\]\) > \.oc-copy-field-icon-hide \{ display: none; \}/);
  assert.match(css, /\.oc-copy-field-button\.is-copied > \.oc-copy-field-icon-copy \{ display: none; \}/);
  assert.match(css, /\.oc-copy-field--wrap \.oc-copy-field-value \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;/);
});

test("recovery codes: warning icon, button icons, copied swap", async () => {
  const css = await read("parts/app-recovery-codes-extras.css");
  assert.match(css, /\.oc-recovery-codes-warning \{ display: flex;/);
  assert.match(css, /\.oc-recovery-codes-actions \.oc-btn\.is-copied > \.oc-recovery-codes-icon-copy \{ display: none; \}/);
});

test("snippets: copy field and recovery codes carry the 0.17.0 markup and script", async () => {
  const copy = await snippet("copy-field.html");
  assert.match(copy, /class="oc-copy-field-toggle" type="button" aria-pressed="false" aria-controls="oc-copy-key" aria-label="Show value"/);
  assert.match(copy, /data-copied-label="Copied"/);
  assert.match(copy, /role="status" aria-live="polite"/);
  assert.match(copy, /input\.type = show \? 'text' : 'password'/);
  const rec = await snippet("recovery-codes.html");
  assert.match(rec, /data-oc-recovery="print"/);
  assert.match(rec, /class="oc-recovery-codes-status oc-visually-hidden" role="status" aria-live="polite"/);
  // no third-party icon packages: inline MDI paths only
  for (const s of [copy, rec]) assert.doesNotMatch(s, /lucide|heroicons|font-awesome|fa-/i);
});
