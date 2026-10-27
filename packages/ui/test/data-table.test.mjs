// File: packages/ui/test/data-table.test.mjs
// Map: page window -> numeric sort -> csv quoting -> trash and search filter

import { test } from "node:test";
import assert from "node:assert/strict";
import { compareValues, pageItems, rowPasses, toCsv } from "../src/data-table.js";

test("page numbers keep the current page and both ends", () => {
  assert.deepEqual(pageItems(1, 1), [1]);
  assert.deepEqual(pageItems(1, 3), [1, 2, 3]);
  assert.deepEqual(pageItems(5, 10), [1, "…", 3, 4, 5, 6, 7, "…", 10]);
});

test("numeric sort accepts a comma decimal", () => {
  assert.ok(compareValues("5,15", "12,40", true) < 0);
  assert.ok(compareValues("Scharnier", "Greep", false) > 0);
});

test("csv quotes fields that contain a comma or a quote", () => {
  assert.equal(toCsv(["Name", "Note"], [["Ada", 'say "hi"'], ["Alan, T", "ok"]]), 'Name,Note\nAda,"say ""hi"""\n"Alan, T",ok');
});

test("active filter hides trash and archive, search matches the row text", () => {
  assert.equal(rowPasses("deleted", "active", "Schroef", ""), false);
  assert.equal(rowPasses("archived", "archived", "Kast", ""), true);
  assert.equal(rowPasses("active", "all", "Plaat 18 wit", "plaat"), true);
  assert.equal(rowPasses("active", "all", "Greep", "plaat"), false);
});
