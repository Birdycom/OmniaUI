// File: packages/ui/test/carousel.test.mjs
// Tests the scroll target of the looping carousel: one slide per step, wrapping at both ends.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loopTarget } from "../src/carousel.js";

// 4 slides of 500px with a 16px gap: max scroll 3 × 516 = 1548.
const max = 1548, step = 516;

test("next moves one slide and wraps from the last to the first", () => {
  assert.equal(loopTarget(0, max, step, 1), 516);
  assert.equal(loopTarget(1032, max, step, 1), 1548);
  assert.equal(loopTarget(1548, max, step, 1), 0);
  assert.equal(loopTarget(1547, max, step, 1), 0, "snap rounding within 2px counts as the end");
});

test("previous moves one slide and wraps from the first to the last", () => {
  assert.equal(loopTarget(1548, max, step, -1), 1032);
  assert.equal(loopTarget(516, max, step, -1), 0);
  assert.equal(loopTarget(0, max, step, -1), 1548);
});

test("never overshoots when the last step is shorter (two or three per view)", () => {
  assert.equal(loopTarget(1300, max, step, 1), 1548);
  assert.equal(loopTarget(200, max, step, -1), 0);
});
