// File: packages/ui/test/v0170.test.mjs
// Map: CSS of 0.17.0 -> dropdown description + tone -> sidebar meta wrap/collapsed -> form section issue -> otp fit/group
//      -> copy field display -> card grid bands -> table auto + hide below -> theme.js scope -> site header --container -> theme image in a scope

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

test("countdown.js: format and state", async () => {
  const { formatCountdown, countdownState } = await import("../src/countdown.js");
  assert.equal(formatCountdown(90), "1:30");
  assert.equal(formatCountdown(3725), "1:02:05");
  assert.equal(formatCountdown(-4), "0:00");
  assert.equal(formatCountdown(0.2), "0:01");
  assert.deepEqual(countdownState(150, 300), { left: 150, fraction: 0.5, state: "" });
  assert.equal(countdownState(50, 300).state, "low"); // 20% of 300 = 60
  assert.equal(countdownState(100, 1000, 120).state, "low");
  assert.equal(countdownState(0, 300).state, "done");
});

test("sidebar --overlay keeps only the rail width in the layout and darkens the page", async () => {
  const css = await read("components.css");
  assert.ok(css.includes("margin-inline-end: calc(var(--oc-sidebar-width-icon) - var(--oc-sidebar-width));"));
  assert.ok(css.includes("box-shadow: 0 0 0 100vmax"));
});

// theme.js: a toggle or set button inside a .oc-theme-scope themes only that scope (a demo box), not <html>.
test("theme.js: a toggle inside .oc-theme-scope sets data-theme on the scope only", async () => {
  const { JSDOM } = await import("jsdom");
  const { initTheme } = await import("../src/theme.js");
  const dom = new JSDOM(`<!doctype html><html><body>
    <button id="page" data-oc-theme-toggle></button>
    <div class="oc-theme-scope" id="scope"><button id="demo" data-oc-theme-toggle></button><button id="set" data-oc-theme-set="light"></button></div>
  </body></html>`, { url: "https://example.test/" });
  const { document: doc } = dom.window;
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const theme = initTheme(doc);
  const root = doc.documentElement, scope = doc.getElementById("scope");
  let scopeEvent = null, rootEvents = 0;
  scope.addEventListener("oc-theme-change", (e) => { scopeEvent = e.detail; });
  root.addEventListener("oc-theme-change", () => { rootEvents++; });
  // the sync of the page leaves the buttons in the scope alone
  assert.equal(doc.getElementById("page").getAttribute("aria-pressed"), "false");
  assert.equal(doc.getElementById("demo").hasAttribute("aria-pressed"), false);

  doc.getElementById("demo").click();
  assert.equal(scope.dataset.theme, "dark");
  assert.equal(root.hasAttribute("data-theme"), false);
  assert.equal(dom.window.localStorage.getItem("oc-theme"), null);
  assert.equal(theme.get(), "system");
  assert.equal(doc.getElementById("demo").getAttribute("aria-pressed"), "true");
  assert.equal(doc.getElementById("page").getAttribute("aria-pressed"), "false");
  assert.deepEqual({ ...scopeEvent }, { choice: "dark", theme: "dark", scope: true });
  assert.equal(rootEvents, 0);

  doc.getElementById("set").click();
  assert.equal(scope.dataset.theme, "light");
  assert.equal(doc.getElementById("set").getAttribute("aria-pressed"), "true");

  // without a scope: the whole page, as before
  doc.getElementById("page").click();
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.equal(dom.window.localStorage.getItem("oc-theme"), "dark");
  assert.equal(scope.dataset.theme, "light");
  theme.stop();
});

test("site header --container: container query instead of the window", async () => {
  const css = await read("showcase.css");
  assert.match(css, /\.oc-site-header--container \{\s*container: oc-site-header \/ inline-size;/);
  assert.match(css, /anchor-scope: --oc-site-header, --oc-mega-header;/);
  assert.match(css, /@container oc-site-header \(max-width: 53\.75rem\) \{\s*\.oc-site-header--container \.oc-site-header__toggle \{ display: block; \}/);
  assert.match(css, /@container oc-site-header \(min-width: 53\.8125rem\)/);
  assert.match(css, /position-anchor: --oc-site-header;\s*inset: anchor\(bottom\) anchor\(right\) auto anchor\(left\);/);
  // the window media queries keep their rules (same specificity) but leave a --container header alone
  assert.match(css, /@media \(max-width: 860px\) \{\s*\.oc-site-header__toggle:where\(:not\(\.oc-site-header--container \*\)\) \{ display: block; \}/);
  const variants = await read("parts/site-header-variants.css");
  assert.match(variants, /@container oc-site-header \(min-width: 53\.8125rem\) \{\s*\.oc-site-header--center\.oc-site-header--container \.oc-site-header__inner/);
});

test("theme image: a .oc-theme-scope with its own theme wins over the page", async () => {
  const css = await read("parts/app-0160-apps.css");
  assert.match(css, /\.oc-theme-scope\.oc-theme-scope:is\(\[data-theme="dark"\], \.dark, :has\(\.oc-theme-switch input\[value="dark"\]:checked\)\) \.oc-theme-img--dark \{ display: revert; \}/);
});

test("theme scope with its own theme takes the text color of that theme", async () => {
  const css = await read("components.css");
  assert.match(css, /\.oc-theme-scope:is\(\[data-theme="light"\], \[data-theme="dark"\], \.light, \.dark, :has\(\.oc-theme-switch input:is\(\[value="light"\], \[value="dark"\]\):checked\)\) \{ color: var\(--oc-foreground\); \}/);
});
