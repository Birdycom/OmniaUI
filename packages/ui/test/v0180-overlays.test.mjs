// File: packages/ui/test/v0180-overlays.test.mjs
// Map: combobox.js portal in the top layer (popover="manual", stays in a modal dialog; fallback to body) -> combobox CSS
//      -> popover match width -> popover / dropdown side + align -> toggle dropdown side -> sheet content without translate
//      -> tooltip in a collapsed sidebar

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { bindCombobox } from "../src/combobox.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

const combobox = (attrs = "data-oc-portal") => `<div class="oc-combobox" data-oc-combobox ${attrs} data-module="green">
  <input class="oc-input oc-combobox-input" role="combobox" aria-controls="l" aria-expanded="false">
  <ul class="oc-combobox-list" id="l" role="listbox" aria-label="Customer">
    <li class="oc-combobox-option" role="option" data-value="1">Customer 1</li>
    <li class="oc-combobox-option" role="option" data-value="2">Customer 2</li>
  </ul>
</div>`;

/** jsdom has no popover API: a small stand-in that keeps the open state per element. */
function withPopover(window) {
  const calls = [];
  window.HTMLElement.prototype.showPopover = function () { calls.push(["show", this]); this.__open = true; };
  window.HTMLElement.prototype.hidePopover = function () { calls.push(["hide", this]); this.__open = false; };
  const matches = window.Element.prototype.matches;
  window.Element.prototype.matches = function (sel) { return sel === ":popover-open" ? !!this.__open : matches.call(this, sel); };
  return calls;
}

test("combobox.js: with popover support the portal list stays in a modal dialog and opens in the top layer", () => {
  const dom = new JSDOM(`<!doctype html><body><dialog class="oc-modal" open><div class="oc-modal-content">${combobox()}</div></dialog><button id="out">out</button></body>`, { pretendToBeVisual: true });
  const { window } = dom;
  const doc = window.document;
  const calls = withPopover(window);
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const list = root.querySelector(".oc-combobox-list");
  assert.equal(list.getAttribute("popover"), "manual");
  assert.ok(list.classList.contains("oc-combobox-list--portal"));
  assert.equal(list.dataset.module, "green");

  const input = root.querySelector("input");
  input.focus();
  // Still inside the dialog (body content is inert behind a modal dialog), shown as a popover, fixed under the field.
  assert.equal(list.parentNode, root);
  assert.ok(doc.querySelector("dialog").contains(list));
  assert.equal(list.__open, true);
  assert.equal(list.dataset.open, "");
  assert.equal(list.style.position, "fixed");
  assert.deepEqual(calls.map((c) => c[0]), ["show"]);

  // A press in the list keeps the focus in the field; a click chooses and closes the popover.
  const down = new window.MouseEvent("mousedown", { bubbles: true, cancelable: true });
  list.querySelector('[data-value="2"]').dispatchEvent(down);
  assert.equal(down.defaultPrevented, true);
  list.querySelector('[data-value="2"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(input.value, "Customer 2");
  assert.equal(list.__open, false);
  assert.equal(list.dataset.open, "false");

  // Escape closes it too (a manual popover has no light dismiss).
  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  assert.equal(list.__open, true);
  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  assert.equal(list.__open, false);

  // Blur closes it.
  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  assert.equal(list.__open, true);
  doc.getElementById("out").focus();
  assert.equal(list.__open, false);
  assert.equal(list.parentNode, root);
});

test("combobox.js: without popover support the portal list still moves to body (fallback unchanged)", () => {
  const dom = new JSDOM(`<!doctype html><body>${combobox()}<button id="out">out</button></body>`, { pretendToBeVisual: true });
  const doc = dom.window.document;
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const list = root.querySelector(".oc-combobox-list");
  assert.equal(list.hasAttribute("popover"), false);
  root.querySelector("input").focus();
  assert.equal(list.parentNode, doc.body);
  doc.getElementById("out").focus();
  assert.equal(list.parentNode, root);
});

test("combobox.js: without data-oc-portal the list never becomes a popover", () => {
  const dom = new JSDOM(`<!doctype html><body>${combobox("")}</body>`, { pretendToBeVisual: true });
  const calls = withPopover(dom.window);
  const root = dom.window.document.querySelector(".oc-combobox");
  bindCombobox(root);
  root.querySelector("input").focus();
  assert.equal(root.querySelector(".oc-combobox-list").hasAttribute("popover"), false);
  assert.equal(calls.length, 0);
});

test("combobox CSS: a portal list in the top layer undoes the UA popover box", async () => {
  const css = await read("../src/parts/forms-combobox-catalog.css");
  assert.match(css, /\.oc-combobox-list\.oc-combobox-list--portal\[popover\] \{[^}]*margin: 0;[^}]*inset: auto;/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

test("popover CSS: data-match-width follows the trigger width with anchor-size()", async () => {
  const css = await read("../src/parts/app-compound-overlays.css");
  assert.match(css, /\.oc-popover\[popover\]\[data-match-width\] \{ inline-size: auto; min-inline-size: 0; \}/);
  assert.match(css, /@supports \(inline-size: anchor-size\(width\)\) \{\s*\.oc-popover\[popover\]\[data-match-width\] \{ inline-size: anchor-size\(width\); \}/);
});

test("dropdown CSS: the menu takes data-side / data-align like the popover (top layer and toggle mode)", async () => {
  const css = await read("../src/parts/app-compound-overlays.css");
  for (const side of ["top", "right", "bottom", "left"]) {
    assert.match(css, new RegExp(`\\.oc-dropdown-menu\\[popover\\]\\[data-side="${side}"\\] \\{[^}]*position-area:`));
    for (const align of ["center", "end"]) assert.match(css, new RegExp(`\\.oc-dropdown-menu\\[popover\\]\\[data-side="${side}"\\]\\[data-align="${align}"\\]`));
    // the popover rules stay as they were
    assert.match(css, new RegExp(`\\.oc-popover\\[popover\\]\\[data-side="${side}"\\]`));
  }
  assert.match(css, /\.oc-dropdown > \.oc-dropdown-menu\[data-side="top"\] \{[^}]*bottom: 100%;/);
  assert.match(css, /\.oc-dropdown > \.oc-dropdown-menu\[data-align="end"\] \{ left: auto; right: 0; \}/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
  assert.doesNotMatch(css, /gradient\(/);
});

test("sheet: the open panel has no translate, so fixed children are placed against the viewport", async () => {
  const css = await read("../src/components.css");
  assert.match(css, /dialog\.oc-sheet\[open\] \.oc-sheet-content \{ translate: none; \}/);
  assert.doesNotMatch(css, /dialog\.oc-sheet\[open\] \.oc-sheet-content \{ translate: 0 0; \}/);
});

test("tooltip: a collapsed sidebar does not cut off a tooltip that cannot be fixed", async () => {
  const css = await read("../src/parts/app-compound-overlays.css");
  assert.match(css, /@supports not \(position-area: top\) \{\s*\.oc-sidebar--collapsed \.oc-sidebar-content \{ overflow: visible; \}/);
  assert.match(css, /@supports \(position-area: top\) and \(not \(anchor-scope: all\)\) \{\s*\.oc-sidebar--collapsed \.oc-sidebar-content:has\(\.oc-tooltip__content\) \{ overflow: visible; \}/);
});
