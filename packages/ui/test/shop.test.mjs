// File: packages/ui/test/shop.test.mjs
// Map: quantity steps (grid, min/max, decimals) -> barcode escapes its text -> shop snippets (headers, hooks)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stepQuantity } from "../src/form-extras.js";
import { barsToSvg } from "../src/barcode.js";

test("quantity steps up and down within min and max", () => {
  assert.equal(stepQuantity(1, 1, { min: 1, max: 5 }), 2);
  assert.equal(stepQuantity(1, -1, { min: 1, max: 5 }), 1);
  assert.equal(stepQuantity(5, 1, { min: 1, max: 5 }), 5);
  assert.equal(stepQuantity(NaN, 1, { min: 1 }), 2);
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

test("shop snippets have the snippet header and their hooks", () => {
  const read = (name) => fs.readFileSync(new URL(`../snippets/${name}.html`, import.meta.url), "utf8");
  for (const [name, hook] of [["rating", "oc-rating-input"], ["price", "oc-price__amount"], ["quantity", "data-oc-step"], ["gallery", "oc-gallery__thumb"], ["stock", "data-level"], ["spec-list", "oc-spec-row"]]) {
    const src = read(name);
    assert.match(src.split("\n")[0], /Needs @birdycom\/omniaui CSS\.$/, name);
    assert.match(src, /File: packages\/ui\/snippets\/.+ \| Map:/, name);
    assert.ok(src.includes(hook), `${name} has ${hook}`);
  }
});
