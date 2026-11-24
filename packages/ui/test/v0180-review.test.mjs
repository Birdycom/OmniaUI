// File: packages/ui/test/v0180-review.test.mjs
// Map: combobox.js opens on a user action only (dialog autofocus keeps it closed) -> phone input regroups on a country
//      change and while typing -> select-on-focus -> CSS: copy field block, time picker popover room, sheet glass,
//      stepper enabled/disabled steps, QR centred (card, button), closed combobox chevron

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { bindCombobox, focusFromTab } from "../src/combobox.js";
import { bindPhoneInput, bindSelectOnFocus, formatPhoneDigits, initFormExtras } from "../src/form-extras.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const combobox = `<div class="oc-combobox" data-oc-combobox>
  <input class="oc-input oc-combobox-input" role="combobox" aria-controls="l" aria-expanded="false" autofocus>
  <ul class="oc-combobox-list" id="l" role="listbox" aria-label="Customer">
    <li class="oc-combobox-option" role="option" data-value="1">Customer 1</li>
    <li class="oc-combobox-option" role="option" data-value="2">Customer 2</li>
  </ul>
</div>`;

test("combobox.js: the focus a dialog gives the field keeps the list closed; click, Arrow Down, Enter and typing open it", async () => {
  const dom = new JSDOM(`<!doctype html><body><dialog class="oc-modal" open>${combobox}</dialog><button id="out">out</button></body>`, { pretendToBeVisual: true });
  const { window } = dom;
  const doc = window.document;
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const input = root.querySelector("input");
  await wait(450); // well after any Tab of an earlier test
  input.focus(); // what showModal() does with an autofocus field
  assert.equal(root.dataset.open, "false");
  assert.equal(input.getAttribute("aria-expanded"), "false");

  input.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.notEqual(root.dataset.open, "false");
  assert.equal(input.getAttribute("aria-expanded"), "true");

  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  assert.equal(root.dataset.open, "false");
  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
  assert.equal(input.getAttribute("aria-expanded"), "true");

  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  const enter = new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  input.dispatchEvent(enter);
  assert.equal(enter.defaultPrevented, true);
  assert.equal(input.getAttribute("aria-expanded"), "true");

  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  input.value = "Cust";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(input.getAttribute("aria-expanded"), "true");
});

test("combobox.js: Tab into the field still opens it (outside a dialog nothing changes for keyboard users)", () => {
  const dom = new JSDOM(`<!doctype html><body><button id="before">before</button>${combobox}</body>`, { pretendToBeVisual: true });
  const { window } = dom;
  const doc = window.document;
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  doc.getElementById("before").focus();
  doc.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab" }));
  assert.equal(focusFromTab(), true);
  root.querySelector("input").focus();
  assert.notEqual(root.dataset.open, "false");
  assert.equal(root.querySelector("input").getAttribute("aria-expanded"), "true");
});

const phone = (formats = "") => `<div class="oc-phone-input" ${formats}>
  <select class="oc-phone-input-dial" aria-label="Country code">
    <option value="+32" selected>BE +32</option><option value="+31">NL +31</option><option value="+49">DE +49</option>
    <option value="+352" data-oc-format="### ### ###">LU +352</option><option value="+44">UK +44</option>
  </select>
  <input class="oc-phone-input-number" type="tel" value="470 12 34 56">
</div>`;

test("form-extras.js: formatPhoneDigits groups like the wrappers", () => {
  assert.equal(formatPhoneDigits("470123456", "### ## ## ##"), "470 12 34 56");
  assert.equal(formatPhoneDigits("612345678", "# ## ## ## ##"), "6 12 34 56 78");
  assert.equal(formatPhoneDigits("15123456789", [3, 4, 4]), "151 2345 6789");
  assert.equal(formatPhoneDigits("1234567"), "123 45 67");
  assert.equal(formatPhoneDigits("1234567890123", [3, 4]), "123 4567 89 01 23");
});

test("form-extras.js: a phone input regroups the number as soon as another country is picked", () => {
  const dom = new JSDOM(`<!doctype html><body>${phone(`data-oc-formats='{"+44": [4, 4]}'`)}</body>`);
  const { window } = dom;
  const doc = window.document;
  const root = doc.querySelector(".oc-phone-input");
  const select = root.querySelector("select");
  const input = root.querySelector("input");
  const events = [];
  input.addEventListener("input", () => events.push("input"));
  input.addEventListener("change", () => events.push("change"));
  bindPhoneInput(root);
  const pick = (dial) => { select.value = dial; select.dispatchEvent(new window.Event("change", { bubbles: true })); };
  pick("+31");
  assert.equal(input.value, "4 70 12 34 56");
  assert.deepEqual(events, ["input", "change"], "frameworks and wire:model see the new text");
  pick("+49");
  assert.equal(input.value, "470 1234 56");
  pick("+352"); // data-oc-format on the option
  assert.equal(input.value, "470 123 456");
  pick("+44"); // data-oc-formats on the frame (Blade :formats)
  assert.equal(input.value, "4701 2345 6");
  pick("+32");
  assert.equal(input.value, "470 12 34 56");
});

test("form-extras.js: a phone input groups while typing and keeps the caret behind the same digit", () => {
  const dom = new JSDOM(`<!doctype html><body>${phone()}</body>`);
  const { window } = dom;
  const doc = window.document;
  initFormExtras(doc);
  const input = doc.querySelector(".oc-phone-input-number");
  input.focus();
  // typed a 9 in front of "56": "470 12 34 956" -> "470 12 34 95 6", caret after the 9
  input.value = "470 12 34 956";
  input.setSelectionRange(11, 11);
  const typed = new window.InputEvent("input", { bubbles: true, inputType: "insertText" });
  input.dispatchEvent(typed);
  assert.equal(input.value, "470 12 34 95 6");
  assert.equal(input.selectionStart, 11);
  // Backspace on the space in "95 6" (caret in front of the 6): the 5 goes instead of the space
  input.value = "470 12 34 956";
  input.setSelectionRange(12, 12);
  const back = new window.InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" });
  input.dispatchEvent(back);
  assert.equal(input.value, "470 12 34 96");
  assert.equal(input.selectionStart, 11);
});

test("form-extras.js: data-oc-select-on-focus selects the whole value; the first mouseup keeps it", () => {
  const dom = new JSDOM(`<!doctype html><body><input class="oc-input oc-time-input" value="09:00" data-oc-select-on-focus><input id="plain" value="10:00"></body>`);
  const { window } = dom;
  const doc = window.document;
  initFormExtras(doc);
  const input = doc.querySelector("[data-oc-select-on-focus]");
  input.setSelectionRange(5, 5);
  input.focus();
  assert.deepEqual([input.selectionStart, input.selectionEnd], [0, 5]);
  const up = new window.MouseEvent("mouseup", { bubbles: true, cancelable: true });
  input.dispatchEvent(up);
  assert.equal(up.defaultPrevented, true);
  const again = new window.MouseEvent("mouseup", { bubbles: true, cancelable: true });
  input.dispatchEvent(again);
  assert.equal(again.defaultPrevented, false);
  bindSelectOnFocus(input); // binding twice is harmless
  const plain = doc.getElementById("plain");
  plain.setSelectionRange(5, 5);
  plain.focus();
  assert.equal(plain.selectionStart, 5);
});

test("CSS: copy field block, time picker room, sheet glass, stepper steps, QR centred, closed combobox chevron", async () => {
  const copy = await read("../src/parts/forms-copy-field-extras.css");
  assert.match(copy, /\.oc-copy-field\.oc-copy-field--block \{[^}]*align-self: center;/);
  assert.doesNotMatch(copy, /\.oc-copy-field\.oc-copy-field--block \{[^}]*align-self: stretch;/);

  const time = await read("../src/parts/forms-time-input.css");
  assert.match(time, /\.oc-time-picker > \.oc-popover\[popover\] \{ inline-size: 16rem; padding: 0\.25rem; \}/);
  assert.match(time, /\.oc-time-picker > \.oc-popover \.oc-time-slots \{ padding: 0\.25rem;/);

  const sheet = await read("../src/parts/app-sheet-options.css");
  assert.match(sheet, /--oc-sheet-bg: color-mix\(in oklab, var\(--oc-background\) 64%, transparent\);/);
  assert.match(sheet, /backdrop-filter: blur\(var\(--oc-sheet-blur\)\) saturate\(1\.5\);/);

  const main = await read("../src/components.css");
  assert.match(main, /\.oc-stepper-item:disabled \{[^}]*cursor: not-allowed;[^}]*opacity: 0\.55;[^}]*border-style: dashed;/);
  assert.match(main, /button\.oc-stepper-item:not\(:disabled, \.oc-stepper-item--done, \.oc-stepper-item--active, \[aria-current="step"\]\) \{[^}]*cursor: pointer;/);

  const qr = await read("../src/parts/media-barcode.css");
  assert.match(qr, /\.oc-barcode\.oc-barcode--qr \{ display: flex; inline-size: fit-content; max-inline-size: 100%; margin-inline: auto; \}/);
  assert.match(qr, /\.oc-btn:has\(> \.oc-barcode--qr\) \{ flex-direction: column;/);

  const extra = await read("../src/components-extra.css");
  assert.match(extra, /\.oc-combobox\[data-open="false"\]::after \{ rotate: 45deg; translate: none; \}/);
});
