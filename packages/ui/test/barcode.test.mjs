// File: packages/ui/test/barcode.test.mjs
// Map: Code 128 table -> check digits -> EAN-13 / EAN-8 / UPC-A bars -> Code 128 B and C -> SVG -> ISO week

import { test } from "node:test";
import assert from "node:assert/strict";
import { CODE128, barsToSvg, code128Values, eanCheck, encodeBarcode, guessFormat } from "../src/barcode.js";
import { isoWeek } from "../src/form-extras.js";

test("every Code 128 symbol is 11 modules wide", () => {
  assert.equal(CODE128.length, 106);
  for (const code of CODE128) assert.equal([...code].reduce((sum, w) => sum + Number(w), 0), 11, code);
});

test("EAN and UPC check digits", () => {
  assert.equal(eanCheck("400638133393"), "1"); // 4006381333931
  assert.equal(eanCheck("9638507"), "4"); // EAN-8 96385074
  assert.equal(eanCheck("03600029145"), "2"); // UPC-A 036000291452
});

test("EAN-13 has 95 modules and refuses a wrong check digit", () => {
  const { bits, text } = encodeBarcode("4006381333931");
  assert.equal(bits.length, 95);
  assert.equal(text, "4006381333931");
  assert.ok(bits.startsWith("101") && bits.endsWith("101"));
  assert.throws(() => encodeBarcode("4006381333932"), /check digit should be 1/);
  assert.equal(encodeBarcode("400638133393").text, "4006381333931");
});

test("EAN-8 and UPC-A", () => {
  assert.equal(encodeBarcode("96385074").bits.length, 67);
  assert.equal(encodeBarcode("03600029145", "UPC").text, "0036000291452");
});

test("format guess", () => {
  assert.equal(guessFormat("4006381333931"), "EAN13");
  assert.equal(guessFormat("96385074"), "EAN8");
  assert.equal(guessFormat("SKU-1105"), "CODE128");
});

test("Code 128 uses set C for even digit runs and B otherwise, with the mod-103 check", () => {
  // "PJJ123C" in set B: 104 + 48·1 + 42·2 + 42·3 + 17·4 + 18·5 + 19·6 + 35·7 = 879, 879 mod 103 = 55
  const b = code128Values("PJJ123C");
  assert.equal(b[0], 104);
  assert.equal(b.at(-1), 55);
  const c = code128Values("123456");
  assert.deepEqual(c.slice(0, 4), [105, 12, 34, 56]);
  assert.equal(encodeBarcode("SKU-1105").bits.length, 11 * (1 + 8 + 1) + 13);
  assert.throws(() => encodeBarcode("é"), /ASCII/);
});

test("SVG has one rect per bar and the label", () => {
  const svg = barsToSvg("1101", "Barcode X");
  assert.equal((svg.match(/<rect/g) || []).length, 2);
  assert.match(svg, /aria-label="Barcode X"/);
});

test("ISO week numbers", () => {
  assert.deepEqual(isoWeek(new Date(2026, 10, 1)), { week: 44, year: 2026 });
  assert.deepEqual(isoWeek(new Date(2021, 0, 3)), { week: 53, year: 2020 });
  assert.deepEqual(isoWeek(new Date(2024, 11, 30)), { week: 1, year: 2025 });
});
