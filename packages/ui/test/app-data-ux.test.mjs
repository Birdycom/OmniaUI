// File: packages/ui/test/app-data-ux.test.mjs
// Group B (data and app UX) static checks on the CSS parts and snippets.
// Map: file lists -> header + map comment -> palette-only colors -> oc- prefix (no global selectors) -> snippet headers -> size limit

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ui = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blocks = path.resolve(ui, "../blocks");

const NAMES = [
  "table-actions", "column-menu", "sortable-row", "tree", "top-progress", "confirm-dialog", "list-toolbar", "data-table",
  "alpha-tabs", "version-banner", "greeting", "stat-card", "severity-card", "upgrade-banner", "page-header",
  "accordion-accent", "table-compact",
];
const css = [
  ...NAMES.map((n) => path.join(ui, "src/parts", `app-${n}.css`)),
];
const snippets = [
  ...NAMES.map((n) => [n, path.join(ui, "snippets", `${n}.html`), "component"]),
];
// Strip CR so the checks pass on Windows checkouts (CRLF) and on Linux CI.
const read = (f) => fs.readFileSync(f, "utf8").replace(/\r/g, "");
// CSS without comments, so explanations in comments do not trigger the checks.
const code = (f) => read(f).replace(/\/\*[\s\S]*?\*\//g, "");

/** Split a selector list on top-level commas only (not the ones inside :is(), :has() or :not()). */
function splitSelectors(sel) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  return [...out, cur];
}

test("every CSS part starts with its file name and a map", () => {
  for (const f of css) {
    const first = read(f).split("\n")[0];
    assert.match(first, /^\/\* File: .+ \| Map: .+\*\/$/, f);
  }
});

test("CSS parts use only palette tokens (no hex, rgb or hsl)", () => {
  for (const f of css) {
    const c = code(f);
    assert.doesNotMatch(c, /#[0-9a-fA-F]{3,8}\b/, `${f}: hex color`);
    assert.doesNotMatch(c, /\b(rgb|rgba|hsl|hsla)\(/, `${f}: rgb/hsl color`);
  }
});

test("every selector targets an oc- class (no global element or id selectors)", () => {
  for (const f of css) {
    // Selector lists are the text before "{" outside at-rule preludes and keyframe steps.
    for (const m of code(f).matchAll(/([^{};]+)\{/g)) {
      const sel = m[1].trim();
      if (!sel || sel.startsWith("@") || /^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(sel)) continue;
      for (const part of splitSelectors(sel)) {
        assert.match(part, /\.oc-/, `${f}: selector without oc- class: ${part.trim()}`);
        assert.doesNotMatch(part, /(^|\s)#[\w-]/, `${f}: id selector: ${part.trim()}`);
      }
    }
  }
});

test("snippets carry the documented header", () => {
  for (const [name, f, kind] of snippets) {
    const first = read(f).split("\n")[0];
    const pkg = kind === "block" ? "Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS." : "Needs @birdycom/omniaui CSS.";
    assert.ok(first.startsWith(`<!-- OmniaUI ${kind}: ${name} - `), `${f}: header`);
    assert.ok(first.endsWith(pkg), `${f}: needs line`);
    assert.match(read(f), /File: .+ \| Map: /, `${f}: map`);
  }
});

test("files stay under 200 lines", () => {
  for (const f of [...css, ...snippets.map((s) => s[1])]) {
    assert.ok(read(f).split("\n").length < 200, `${f} is too long`);
  }
});
