// File: packages/ui/test/shop.test.mjs
// Map: quantity steps (grid, min/max, decimals) -> avatar accept check -> barcode escapes its text -> shop snippets (headers, hooks)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { acceptsFile, stepQuantity } from "../src/form-extras.js";
import { barcodeFile, barsToSvg } from "../src/barcode.js";

test("quantity steps up and down within min and max", () => {
  assert.equal(stepQuantity(1, 1, { min: 1, max: 5 }), 2);
  assert.equal(stepQuantity(1, -1, { min: 1, max: 5 }), 1);
  assert.equal(stepQuantity(5, 1, { min: 1, max: 5 }), 5);
  assert.equal(stepQuantity(NaN, 1, { min: 1 }), 2);
});

test("avatar picker only takes files that match accept", () => {
  const pdf = { type: "application/pdf", name: "offer.pdf" };
  const png = { type: "image/png", name: "me.png" };
  const svg = { type: "image/svg+xml", name: "logo.svg" };
  assert.equal(acceptsFile(pdf, "image/*"), false);
  assert.equal(acceptsFile(png, "image/*"), true);
  assert.equal(acceptsFile(png, ""), true);
  assert.equal(acceptsFile(svg, "image/png,image/jpeg"), false);
  assert.equal(acceptsFile(svg, "image/png, .SVG"), true);
  assert.equal(acceptsFile({ type: "", name: "scan.pdf" }, ".png,.jpg"), false);
  assert.equal(acceptsFile(null), false);
});

test("quantity snaps to the step grid and keeps decimals clean", () => {
  assert.equal(stepQuantity(2.5, 1, { step: 1 }), 3);
  assert.equal(stepQuantity(2.5, -1, { step: 1 }), 2);
  assert.equal(stepQuantity(0.2, 1, { min: 0, step: 0.1 }), 0.3);
  assert.equal(stepQuantity(10, 1, { min: 0, step: 5 }), 15);
});

test("barcode label is escaped for HTML", () => {
  const svg = barsToSvg("101", `Barcode <img src=x onerror=alert(1)>"`);
  assert.ok(!svg.includes("<img"));
  assert.ok(svg.includes("&#60;img"));
});

test("barcodeFile is a standalone SVG on white with the digits", () => {
  const svg = barcodeFile("5400000000010", { moduleWidth: 2, height: 60 });
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="230"/); // (95 + 20) modules * 2 px
  assert.match(svg, /<rect width="100%" height="100%" fill="#fff"\/>/);
  assert.match(svg, />5400000000010<\/text>/);
  assert.doesNotMatch(barcodeFile("<b>", { digits: true }), /<b>/);
  assert.doesNotMatch(barcodeFile("12345670", { digits: false }), /<text/);
  assert.throws(() => barcodeFile("5400000000018"), /check digit/);
});

test("shop snippets have the snippet header and their hooks", () => {
  const read = (name) => fs.readFileSync(new URL(`../snippets/${name}.html`, import.meta.url), "utf8");
  for (const [name, hook] of [["rating", "oc-rating-input"], ["price", "oc-price__amount"], ["quantity", "data-oc-step"], ["gallery", "oc-gallery__thumb"], ["stock", "data-level"], ["spec-list", "oc-spec-row"]]) {
    const src = read(name);
    // Line endings differ per checkout (CRLF on Windows and in CI with .gitattributes eol=crlf).
    assert.match(src.split(/\r?\n/)[0], /Needs @birdycom\/omniaui CSS\.$/, name);
    assert.match(src, /File: packages\/ui\/snippets\/.+ \| Map:/, name);
    assert.ok(src.includes(hook), `${name} has ${hook}`);
  }
});
