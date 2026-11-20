// File: packages/ui/test/v0170-int.test.mjs
// Map: calendar date picker closes its popover (single and range) -> tabs.js (tab, panels, arrow keys) -> shipped as oc-tabs.js

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** A popover stand-in: the calendar root sits inside it, so root.closest("[popover]") finds it. */
const fakePopover = (open = true) => {
  const pop = { open, matches: (sel) => sel === ":popover-open" && pop.open, hidePopover: () => { pop.open = false; } };
  return pop;
};

test("calendar: closePicker hides the popover around the calendar root", async () => {
  const { closePicker } = await import("../src/calendar.js");
  const pop = fakePopover();
  const root = { closest: (sel) => (sel === "[popover]" ? pop : null) };
  assert.equal(closePicker(root), true);
  assert.equal(pop.open, false);
  assert.equal(closePicker(root), false, "an already closed popover stays as it is");
  assert.equal(closePicker({ closest: () => null }), false, "a calendar without a popover does nothing");
});

test("calendar: a picked day closes the picker in single mode, the second point in range mode", async () => {
  const src = await fs.readFile(path.resolve(here, "../src/calendar.js"), "utf8");
  assert.match(src, /if \(mode === "single" \|\| end\) closePicker\(root\);/);
  assert.doesNotMatch(src, /root\.contains\(pop\)/);
});

test("tabs.js: arrow keys skip disabled tabs and wrap, Home and End go to the ends", async () => {
  const { nextTab } = await import("../src/tabs.js");
  const disabled = [false, false, true, false];
  assert.equal(nextTab(1, disabled, "ArrowRight"), 3, "skips the disabled third tab");
  assert.equal(nextTab(3, disabled, "ArrowRight"), 0, "wraps to the first");
  assert.equal(nextTab(0, disabled, "ArrowLeft"), 3, "wraps to the last");
  assert.equal(nextTab(1, disabled, "Home"), 0);
  assert.equal(nextTab(0, disabled, "End"), 3);
  assert.equal(nextTab(0, disabled, "ArrowDown"), -1, "up/down only in a vertical list");
  assert.equal(nextTab(0, disabled, "ArrowDown", true), 1);
  assert.equal(nextTab(0, [false, true, true], "ArrowRight"), 0, "a single enabled tab stays");
});

test("tabs.js ships like the other scripts: export, copy-js, public/js and Blade header", async () => {
  const root = path.resolve(here, "../../..");
  const pkg = JSON.parse(await fs.readFile(path.resolve(here, "../package.json"), "utf8"));
  assert.equal(pkg.exports["./tabs.js"], "./dist/tabs.js");
  assert.match(await fs.readFile(path.resolve(here, "../bin/lib/copy-js.mjs"), "utf8"), /"dist\/tabs\.js", "oc-tabs\.js"/);
  assert.match(await fs.readFile(path.join(root, "scripts/build-packages.mjs"), "utf8"), /src\/tabs\.js"\), r\("public\/js\/oc-tabs\.js"\)/);
  assert.match(await fs.readFile(path.join(root, "php-packages/omniaui-laravel/resources/views/components/tabs.blade.php"), "utf8"), /oc-tabs\.js/);
  await fs.access(path.resolve(here, "../src/tabs.d.ts"));
});
