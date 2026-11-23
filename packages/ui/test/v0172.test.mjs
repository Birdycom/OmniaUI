// File: packages/ui/test/v0172.test.mjs
// Map: app header search collapse (combobox, input[type=search], [role=combobox]) -> combobox ghost / header / icon-only CSS
//      -> combobox.js: a fixed icon slot keeps its code, a header list gets at least 12rem

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { bindCombobox } from "../src/combobox.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

test("app header: the folded search also takes a combobox, input[type=search] and [role=combobox]", async () => {
  const css = await read("../../blocks/src/parts/app-appbar-search-collapse.css");
  const field = ':is(.oc-input, input[type="search"], [role="combobox"])';
  assert.ok(css.includes(`.oc-block-appbar-search--collapse ${field} {`));
  assert.ok(css.includes(`.oc-block-appbar-search--collapse:focus-within ${field} {`));
  assert.match(css, /\.oc-block-appbar-search--collapse \.oc-combobox::after,\n\s*\.oc-block-appbar-search--collapse \.oc-combobox > \.oc-combobox-icon \{ display: none; \}/);
  // unchanged: still a container query on the bar, still opens over it
  assert.match(css, /@container oc-block-appbar \(max-width: 40rem\)/);
  assert.match(css, /\.oc-block-appbar-search--collapse:focus-within \{[^}]*position: absolute/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

test("combobox: ghost trigger, header size and icon only", async () => {
  const css = await read("../src/parts/forms-combobox-catalog.css");
  assert.match(css, /\.oc-combobox\.oc-combobox--ghost > \.oc-combobox-input,\n\.oc-combobox\.oc-combobox--ghost > \.oc-combobox-input:focus \{[^}]*border-color: transparent;[^}]*box-shadow: none;/);
  assert.match(css, /\.oc-combobox\.oc-combobox--ghost:is\(:hover, :focus-within, \[data-open=""\]\) > \.oc-combobox-input \{[^}]*var\(--oc-module, var\(--oc-muted-foreground\)\)/);
  assert.match(css, /\.oc-combobox--header \{[^}]*min-inline-size: 6\.5rem;[^}]*max-inline-size: 14rem;/);
  assert.match(css, /\.oc-combobox--header > \.oc-combobox-input \{[^}]*field-sizing: content;[^}]*block-size: 2\.25rem;/);
  assert.match(css, /\.oc-combobox--icon-only::after \{ display: none; \}/);
  assert.match(css, /\.oc-combobox-code \{[^}]*font-weight: 600;[^}]*text-transform: uppercase;/);
  assert.doesNotMatch(css, /gradient\(/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

function setup(html) {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`, { pretendToBeVisual: true });
  const root = dom.window.document.querySelector(".oc-combobox");
  return { dom, root };
}
const options = `<ul class="oc-combobox-list" id="l" role="listbox">
  <li class="oc-combobox-option" role="option" data-value="nl"><span class="oc-combobox-option-icon"><svg data-i="nl"></svg></span>Nederlands</li>
  <li class="oc-combobox-option" role="option" data-value="en"><span class="oc-combobox-option-icon"><svg data-i="en"></svg></span>English</li>
</ul>`;

test("combobox.js: a fixed icon slot (code) keeps its content after a choice; a plain one shows the icon", () => {
  for (const fixed of [true, false]) {
    const { dom, root } = setup(`<div class="oc-combobox oc-combobox--header oc-combobox--icon-only" data-oc-combobox>
      <span class="oc-combobox-icon" ${fixed ? "data-oc-fixed" : ""}><span class="oc-combobox-code">NL</span></span>
      <input class="oc-input oc-combobox-input" role="combobox" aria-controls="l">${options}</div>`);
    bindCombobox(root);
    const input = root.querySelector("input");
    input.focus();
    root.querySelectorAll(".oc-combobox-option")[1].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    const slot = root.querySelector(".oc-combobox-icon");
    if (fixed) assert.equal(slot.innerHTML, '<span class="oc-combobox-code">NL</span>');
    else assert.ok(slot.querySelector('svg[data-i="en"]'), slot.innerHTML);
  }
});

test("combobox.js: a header portal list is at least 192px wide", () => {
  const { dom, root } = setup(`<div class="oc-combobox oc-combobox--header oc-combobox--icon-only" data-oc-combobox data-oc-portal>
    <span class="oc-combobox-icon"></span><input class="oc-input oc-combobox-input" role="combobox" aria-controls="l">${options}</div>`);
  root.getBoundingClientRect = () => ({ left: 900, right: 936, top: 0, bottom: 36, width: 36, height: 36 });
  Object.defineProperty(dom.window, "innerWidth", { value: 1000 });
  bindCombobox(root);
  root.querySelector("input").focus();
  const list = dom.window.document.body.querySelector(":scope > .oc-combobox-list");
  assert.ok(list, "the list is in the body");
  assert.equal(list.style.width, "192px");
  assert.equal(list.style.left, `${1000 - 192 - 8}px`);
});
