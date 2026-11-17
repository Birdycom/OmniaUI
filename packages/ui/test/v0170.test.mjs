// File: packages/ui/test/v0170.test.mjs
// Map: CSS of 0.17.0 -> dropdown description + tone -> sidebar meta wrap/collapsed -> form section issue -> otp fit/group
//      -> copy field display -> card grid bands -> table auto + hide below

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFile(path.resolve(here, "../src", f), "utf8");

test("dropdown: two-line item and tinted icon tones", async () => {
  const css = await read("parts/forms-combobox-icons.css");
  assert.match(css, /\.oc-dropdown-desc \{/);
  for (const tone of ["primary", "success", "warning", "destructive"]) assert.match(css, new RegExp(`\.oc-dropdown-icon--${tone} \{ --oc-dropdown-tone:`));
  // the default sits in the fallback, so a tone class is never overruled by a more specific default
  assert.doesNotMatch(css, /--oc-dropdown-tone: var\(--oc-muted-foreground\)/);
});

test("sidebar meta: --wrap and --collapsed", async () => {
  const css = await read("parts/app-sidebar-meta.css");
  assert.match(css, /\.oc-sidebar-meta--wrap \.oc-sidebar-meta__copy \{ flex-basis: 100%/);
  assert.match(css, /\.oc-sidebar-meta--collapsed :is\(\.oc-sidebar-meta__brand, \.oc-sidebar-meta__copy\)/);
});

test("form section: data-issue error and warning with a count", async () => {
  const css = await read("parts/forms-form-section.css");
  assert.match(css, /\.oc-form-section\[data-issue="error"\],\s*\.oc-card\[data-issue="error"\] \{ border-color: var\(--oc-destructive\); \}/);
  assert.match(css, /\.oc-form-section\[data-issue="warning"\],\s*\.oc-card\[data-issue="warning"\] \{ border-color: var\(--oc-warning\); \}/);
  assert.match(css, /\.oc-form-section__count \{/);
});

test("otp: --fit and --group", async () => {
  const css = await read("components.css");
  assert.match(css, /\.oc-otp\.oc-otp--fit \{ font-size: min\(1\.5rem, calc\(100cqi/);
  assert.match(css, /\.oc-otp\.oc-otp--group \{\s*--oc-otp-group: 4;/);
});

test("copy field: --display scales to the field, caption, no button on paper", async () => {
  const css = await read("components.css");
  assert.match(css, /\.oc-copy-field--display \{ container-type: inline-size;/);
  assert.match(css, /var\(--oc-copy-chars, 9\)/);
  assert.match(css, /\.oc-copy-field-caption \{/);
  assert.match(css, /@media print \{\s*\.oc-copy-field--display \.oc-copy-field-button \{ display: none; \}/);
});

test("card grid --bands: cards share their rows (subgrid)", async () => {
  const css = await read("parts/app-mode-badge.css");
  assert.match(css, /\.oc-card-grid--bands > \.oc-card \{\s*display: grid;\s*grid-row: span 2;\s*grid-template-rows: subgrid;/);
  assert.match(css, /\.oc-card-grid--bands > \.oc-card:has\(> \.oc-card-footer\) \{ grid-row: span 3; \}/);
});

test("table: --auto, data-hide-below only with a size reference, action labels", async () => {
  const css = await read("components.css");
  assert.ok(css.includes(".oc-table.oc-table--auto { table-layout: auto; }"));
  assert.ok(css.includes(".oc-table-wrap:has([data-hide-below], .oc-table-action-label) { container: oc-table / inline-size; }"));
  assert.ok(css.includes(".oc-table-wrap:has([data-hide-below]) > .oc-table { min-inline-size: 0; }"));
  assert.ok(css.includes('@container oc-table (max-width: 32rem) { .oc-table :is(th, td)[data-hide-below~="md"] { display: none; } }'));
  const actions = await read("parts/app-table-actions.css");
  assert.ok(actions.includes(".oc-table-actions--compact .oc-table-action-label {"));
});

test("calendar.js: shift dates and the state of a day in a range", async () => {
  const { shiftDate, dayState } = await import("../src/calendar.js");
  assert.equal(shiftDate("2026-10-31", 1), "2026-11-01");
  assert.equal(shiftDate("2026-03-29", -7), "2026-03-22");
  assert.deepEqual(dayState("2026-10-20", "2026-10-20"), { selected: true, cls: [] });
  assert.deepEqual(dayState("2026-10-28", "2026-10-28", "2026-11-03"), { selected: true, cls: ["oc-calendar-day--range-start"] });
  assert.deepEqual(dayState("2026-10-30", "2026-10-28", "2026-11-03"), { selected: false, cls: ["oc-calendar-day--range-middle"] });
  assert.deepEqual(dayState("2026-11-03", "2026-10-28", "2026-11-03"), { selected: true, cls: ["oc-calendar-day--range-end"] });
  assert.deepEqual(dayState("2026-11-04", "2026-10-28", "2026-11-03"), { selected: false, cls: [] });
});
