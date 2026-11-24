// File: packages/ui/test/v0180-misc.test.mjs
// Map: back-link.js oc-back event -> form-extras.js time picker -> CSS: card --bare, scroll-area --bare, time picker
//      -> snippets (card, scroll-area, time-input, breadcrumb without iconify)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

async function dom(html, opts = {}) {
  const { JSDOM } = await import("jsdom");
  return new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "https://example.test/products/1", ...opts }).window;
}

test("back-link.js: a cancelled oc-back event replaces the navigation; modifier clicks skip it", async () => {
  const { initBackLinks } = await import("../src/back-link.js");
  const win = await dom('<a class="oc-back-link" href="/products" data-oc-back>Back</a>', { referrer: "https://example.test/products?page=2" });
  let backs = 0;
  win.history.back = () => { backs++; };
  const link = win.document.querySelector("a");
  initBackLinks(win.document);
  let own = 0;
  link.addEventListener("oc-back", (e) => { own++; e.preventDefault(); });
  const click = (init = {}) => {
    const e = new win.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
    link.dispatchEvent(e);
    return e.defaultPrevented;
  };
  win.addEventListener("click", (e) => e.preventDefault(), { capture: false });
  assert.equal(click(), true);
  assert.equal(own, 1);
  assert.equal(backs, 0);
  click({ ctrlKey: true });
  assert.equal(own, 1);

  // without a listener: the history flow of 0.17.0
  const win2 = await dom('<a class="oc-back-link" href="/products" data-oc-back>Back</a>', { referrer: "https://example.test/products" });
  let backs2 = 0;
  win2.history.back = () => { backs2++; };
  initBackLinks(win2.document);
  const e = new win2.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  win2.document.querySelector("a").dispatchEvent(e);
  assert.equal(backs2, 1);
});

test("form-extras.js: a picked time slot fills the field and fires input + change", async () => {
  const { initFormExtras, bindTimePicker } = await import("../src/form-extras.js");
  const win = await dom(`<div class="oc-time-picker">
    <input class="oc-input oc-time-input" value="09:00">
    <button type="button" popovertarget="p">t</button>
    <div class="oc-popover" id="p" popover="auto"><div class="oc-time-slots" role="radiogroup">
      <label class="oc-time-slot"><input type="radio" name="s" value="09:00" checked>09:00</label>
      <label class="oc-time-slot"><input type="radio" name="s" value="09:30">09:30</label>
    </div></div></div>`);
  const doc = win.document;
  initFormExtras(doc);
  bindTimePicker(doc.querySelector(".oc-time-picker")); // bound once
  const input = doc.querySelector(".oc-time-input");
  const seen = [];
  input.addEventListener("input", () => seen.push("input"));
  input.addEventListener("change", () => seen.push("change"));
  const radio = doc.querySelectorAll('input[type="radio"]')[1];
  radio.click();
  assert.equal(input.value, "09:30");
  assert.deepEqual(seen, ["input", "change"]);
});

test("CSS: card --bare and scroll-area --bare (no padding / frame, focus ring stays)", async () => {
  const css = await read("../src/components.css");
  assert.match(css, /\.oc-card--bare \{\s*padding: 0;\s*overflow: visible;\s*\}/);
  const extra = await read("../src/components-extra.css");
  const bare = extra.match(/\.oc-scroll-area--bare \{([^}]*)\}/)[1];
  for (const rule of ["max-block-size: none", "padding: 0", "background: none", "border: 0", "border-radius: 0"]) assert.ok(bare.includes(rule), rule);
  assert.doesNotMatch(bare, /overflow|scrollbar|outline/);
  // --bare comes before --shadows so the two still combine
  assert.ok(extra.indexOf(".oc-scroll-area--bare {") < extra.indexOf(".oc-scroll-area--shadows {"));
  assert.match(extra, /\.oc-scroll-area:focus-visible \{ outline/);
});

test("CSS: time picker part, ASCII only", async () => {
  const css = await read("../src/parts/forms-time-input.css");
  assert.match(css, /\.oc-time-picker \{[^}]*display: inline-flex;/);
  assert.match(css, /\.oc-time-picker > \.oc-popover\[popover\] \{/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

test("snippets: bare card, bare scroll area, time picker, breadcrumb ellipsis as inline SVG", async () => {
  assert.match(await read("../snippets/card.html"), /class="oc-card oc-card--bare"/);
  assert.match(await read("../snippets/scroll-area.html"), /oc-scroll-area oc-scroll-area--bare/);
  const time = await read("../snippets/time-input.html");
  assert.match(time, /<div class="oc-time-picker">/);
  assert.match(time, /popovertarget="oc-time-pick-slots"/);
  assert.match(time, /09:00/);
  const bc = await read("../snippets/breadcrumb.html");
  assert.match(bc, /class="oc-breadcrumb-ellipsis"[^>]*><svg /);
  assert.doesNotMatch(bc, /iconify-icon/);
});
