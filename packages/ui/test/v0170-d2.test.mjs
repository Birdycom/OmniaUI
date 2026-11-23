// File: packages/ui/test/v0170-d2.test.mjs
// Map: input-mask.js (applyMask, caret, validate, bind + field message) -> combobox.js catalog mode (labels with a
//      description, clear and custom rows, event search, URL search + stale answers, setOptions, portal, manage link)
//      -> new CSS parts (catalog, field extras, ledger): theme tokens, no gradient/glow, contract selectors

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  applyMask, applyPattern, caretFor, countBefore, validate, validIban, validVat, bindInputMask, initInputMask,
} from "../src/input-mask.js";
import { bindCombobox, optionLabel, optionElement } from "../src/combobox.js";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8").replace(/\r\n/g, "\n");

async function dom(html) {
  const { JSDOM } = await import("jsdom");
  const d = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "https://example.test/" });
  return { window: d.window, doc: d.window.document };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("input-mask: named masks and patterns", () => {
  assert.equal(applyMask("iban", "be68 5390-0754 7034"), "BE68 5390 0754 7034");
  assert.equal(applyMask("bic", "gebabebbxxx99"), "GEBABEBBXXX");
  assert.equal(applyMask("vat", "be0123456749"), "BE0123.456.749");
  assert.equal(applyMask("vat", "nl123456789b01"), "NL123456789B01");
  assert.equal(applyMask("phone", "+32 (470)  12-34-56"), "+32 470 123456");
  assert.equal(applyMask("9999 AA", "1234ab"), "1234 AB");
  assert.equal(applyPattern("99/99/9999", "01022026"), "01/02/2026");
  assert.equal(applyMask(undefined, "x"), "x");
});

test("input-mask: caret helpers keep the caret behind the same character", () => {
  // Typed "BE685" with the caret after the 5 (5 characters): in "BE68 5" that is position 6.
  assert.equal(countBefore("BE685", 5), 5);
  assert.equal(caretFor("BE68 5", 5), 6);
  assert.equal(caretFor("BE68 5", 0), 0);
});

test("input-mask: validate iban, bic, vat, email, phone; empty is valid", () => {
  assert.equal(validIban("BE68 5390 0754 7034"), true);
  assert.equal(validIban("BE68 5390 0754 7035"), false);
  assert.equal(validIban("BE68 5390 0754 703"), false); // wrong length for BE
  assert.equal(validate("iban", "NL91ABNA0417164300"), true);
  assert.equal(validate("bic", "GEBABEBB"), true);
  assert.equal(validate("bic", "GEBABE"), false);
  assert.equal(validVat("BE0123.456.749"), true);
  assert.equal(validVat("BE0123.456.748"), false);
  assert.equal(validate("vat", "NL123456789B01"), true);
  assert.equal(validate("email", "info@company1.example"), true);
  assert.equal(validate("email", "info@company1"), false);
  assert.equal(validate("phone", "+32 470 12 34 56"), true);
  assert.equal(validate("phone", "12"), false);
  assert.equal(validate("iban", ""), true);
  assert.equal(validate("unknown", "x"), true);
});

test("input-mask: bound input formats, validates on blur and writes the field message", async () => {
  const { window, doc } = await dom(`<div class="oc-field"><label for="iban">IBAN</label>
    <input class="oc-input" id="iban" data-oc-mask="iban" data-oc-validate="iban" data-oc-validation-message="Not a valid IBAN"></div>`);
  initInputMask(doc);
  const input = doc.getElementById("iban");
  const events = [];
  input.addEventListener("oc-input-validate", (e) => events.push(e.detail));
  input.value = "be00539007547034";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(input.value, "BE00 5390 0754 7034");
  input.dispatchEvent(new window.FocusEvent("blur"));
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.ok(input.classList.contains("oc-input--error"));
  const msg = doc.querySelector(".oc-field-error[data-oc-validation]");
  assert.equal(msg.textContent, "Not a valid IBAN");
  assert.match(input.getAttribute("aria-describedby"), new RegExp(msg.id));
  assert.equal(events[0].valid, false);
  input.value = "BE68 5390 0754 7034";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(input.hasAttribute("aria-invalid"), false);
  assert.equal(doc.querySelector(".oc-field-error[data-oc-validation]"), null);
  assert.equal(input.hasAttribute("aria-describedby"), false);
  // Bound once.
  assert.equal(typeof bindInputMask(input), "function");
});

const catalogHtml = (attrs = "", extra = "") => `<div class="oc-combobox" data-oc-combobox ${attrs}>
  <span class="oc-combobox-icon" aria-hidden="true"></span>
  <input class="oc-input oc-combobox-input" type="text" role="combobox" aria-expanded="false" aria-controls="l" aria-autocomplete="list" aria-label="Customer">
  <input type="hidden" name="customer" value="">
  <ul class="oc-combobox-list" id="l" role="listbox" aria-label="Customer">
    <li class="oc-combobox-option oc-combobox-clear" role="option" tabindex="-1" data-value="">No customer</li>
    <li class="oc-combobox-option" role="option" tabindex="-1" data-value="1"><span class="oc-combobox-option-emoji" aria-hidden="true">E</span><span class="oc-combobox-option-text"><span class="oc-combobox-option-label">Company 1</span><span class="oc-combobox-option-description">info@company1.example</span></span></li>
    <li class="oc-combobox-option" role="option" tabindex="-1" data-value="2">Customer 1</li>
    <li class="oc-combobox-option oc-combobox-custom" role="option" tabindex="-1" data-oc-custom-label="Add &quot;{query}&quot;" hidden></li>
    <li class="oc-combobox-empty" role="presentation" hidden>No results</li>
  </ul>${extra}
</div>`;

test("combobox.js: labels without description, choose an emoji option, clear row", async () => {
  const { window, doc } = await dom(catalogHtml());
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const opt = doc.querySelector('[data-value="1"]');
  assert.equal(optionLabel(opt), "Company 1");
  const seen = [];
  root.addEventListener("oc-combobox-change", (e) => seen.push(e.detail));
  doc.querySelector(".oc-combobox-input").focus();
  opt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(seen[0], { value: "1", label: "Company 1", custom: false });
  assert.equal(doc.querySelector('input[type="hidden"]').value, "1");
  assert.match(root.querySelector(".oc-combobox-icon").innerHTML, /oc-combobox-option-emoji/);
  doc.querySelector(".oc-combobox-clear").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(seen[1], { value: "", label: "", custom: false });
  assert.equal(doc.querySelector(".oc-combobox-input").value, "");
});

test("combobox.js: custom row appears without an exact match", async () => {
  const { window, doc } = await dom(catalogHtml());
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const input = root.querySelector(".oc-combobox-input");
  input.focus();
  input.value = "Customer 9";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  const custom = root.querySelector(".oc-combobox-custom");
  assert.equal(custom.hidden, false);
  assert.equal(custom.textContent, 'Add "Customer 9"');
  assert.equal(root.querySelector(".oc-combobox-empty").hidden, true);
  let detail;
  root.addEventListener("oc-combobox-change", (e) => { detail = e.detail; });
  custom.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(detail, { value: "Customer 9", label: "Customer 9", custom: true });
  input.value = "customer 1";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(custom.hidden, true);
});

test("combobox.js: event search is debounced, skips the local filter, and ocSetOptions fills the list", async () => {
  const { window, doc } = await dom(catalogHtml('data-oc-search="event" data-oc-search-delay="20"'));
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const queries = [];
  root.addEventListener("oc-combobox-search", (e) => queries.push(e.detail.query));
  const input = root.querySelector(".oc-combobox-input");
  input.focus();
  for (const v of ["c", "cu", "cus"]) { input.value = v; input.dispatchEvent(new window.Event("input", { bubbles: true })); }
  // No local filter: Company 1 stays visible.
  assert.equal(root.querySelector('[data-value="1"]').hidden, false);
  await wait(40);
  assert.deepEqual(queries, ["cus"]);
  root.ocSetOptions([{ value: 7, label: "Customer 7", description: "info@company1.example", icon: "mdi:account" }, { value: 8, label: "Customer 8", image: "/c8.png" }]);
  const opts = [...root.querySelectorAll(".oc-combobox-option:not(.oc-combobox-clear):not(.oc-combobox-custom)")];
  assert.deepEqual(opts.map((o) => o.dataset.value), ["7", "8"]);
  assert.ok(opts[0].querySelector("iconify-icon[icon='mdi:account']"));
  assert.equal(opts[1].querySelector("img.oc-combobox-option-image").getAttribute("alt"), "");
  assert.ok(opts.every((o) => o.id));
  // The custom row stays after the new options.
  assert.ok(root.querySelector(".oc-combobox-custom").previousElementSibling === opts[1]);
});

test("combobox.js: URL search fetches, shows loading and drops a stale answer", async () => {
  const { window, doc } = await dom(catalogHtml('data-oc-search-url="/api/customers?q=" data-oc-search-delay="5"'));
  const calls = [];
  window.fetch = (url) => {
    calls.push(url);
    const slow = url.endsWith("a");
    return new Promise((resolve) => setTimeout(() => resolve({ json: async () => [{ value: slow ? "old" : "new", label: slow ? "Old" : "New" }] }), slow ? 60 : 5));
  };
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const input = root.querySelector(".oc-combobox-input");
  input.focus();
  input.value = "a";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(15);
  assert.equal(root.querySelector('[role="listbox"]').getAttribute("aria-busy"), "true");
  assert.equal(root.querySelector(".oc-combobox-loading").hidden, false);
  input.value = "ab";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(100);
  assert.deepEqual(calls, ["/api/customers?q=a", "/api/customers?q=ab"]);
  assert.ok(root.querySelector('[data-value="new"]'));
  assert.equal(root.querySelector('[data-value="old"]'), null);
  assert.equal(root.querySelector('[role="listbox"]').hasAttribute("aria-busy"), false);
});

test("combobox.js: portal moves the list to body while open and back on blur", async () => {
  const { window, doc } = await dom(`<div style="overflow:auto">${catalogHtml('data-oc-portal data-module="green"')}</div><button id="out">out</button>`);
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  const list = root.querySelector(".oc-combobox-list");
  const input = root.querySelector(".oc-combobox-input");
  input.focus();
  assert.equal(list.parentNode, doc.body);
  assert.ok(list.classList.contains("oc-combobox-list--portal"));
  assert.equal(list.dataset.open, "");
  assert.equal(list.dataset.module, "green");
  assert.equal(list.style.position, "fixed");
  // A press in the list keeps the focus in the field.
  const down = new window.MouseEvent("mousedown", { bubbles: true, cancelable: true });
  list.querySelector('[data-value="2"]').dispatchEvent(down);
  assert.equal(down.defaultPrevented, true);
  list.querySelector('[data-value="2"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(input.value, "Customer 1");
  doc.getElementById("out").focus();
  assert.equal(list.parentNode, root);
  assert.equal(list.dataset.open, "false");
});

test("combobox.js: manage link sits outside the listbox and reports a click", async () => {
  const html = catalogHtml("", "").replace(
    /<ul class="oc-combobox-list" id="l" role="listbox" aria-label="Customer">([\s\S]*?)<\/ul>/,
    '<div class="oc-combobox-list oc-combobox-list--panel"><ul class="oc-combobox-options" id="l" role="listbox" aria-label="Customer">$1</ul><div class="oc-combobox-footer"><a href="#customers">Manage customers</a></div></div>',
  );
  const { window, doc } = await dom(html);
  const root = doc.querySelector(".oc-combobox");
  bindCombobox(root);
  let managed = 0;
  root.addEventListener("oc-combobox-manage", () => managed++);
  root.querySelector(".oc-combobox-input").focus();
  root.querySelector('[data-value="2"]').dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(root.querySelector(".oc-combobox-input").value, "Customer 1");
  root.querySelector(".oc-combobox-footer a").dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(managed, 1);
  assert.equal(root.querySelector(".oc-combobox-footer a").closest('[role="listbox"]'), null);
});

test("combobox.js: optionElement escapes text", async () => {
  const { doc } = await dom("");
  const li = optionElement({ value: "x", label: "<b>Company 1</b>" }, doc);
  assert.equal(li.querySelector("b"), null);
  assert.equal(li.textContent, "<b>Company 1</b>");
});

const parts = ["forms-combobox-catalog", "forms-field-extras", "forms-ledger"].map((n) => [n, read(`../src/parts/${n}.css`)]);

test("new D2 parts: theme tokens, no gradients or glow, forced colors", () => {
  for (const [name, css] of parts) {
    assert.doesNotMatch(css, /gradient\(/, name);
    assert.doesNotMatch(css, /0 0 \d+px [^;]*(primary|module)/, `${name}: no glow`);
    assert.doesNotMatch(css, /#[0-9a-f]{3,6}\b/i, `${name}: no hex colours`);
    assert.match(css, /@media \(forced-colors: active\)/, name);
    assert.match(css, /^\/\* File: packages\/ui\/src\/parts\//, name);
  }
});

test("ledger contract: classes and module focus with a ring fallback", () => {
  const css = parts[2][1];
  for (const cls of ["oc-input--ledger", "oc-select--ledger", "oc-textarea--ledger", "oc-combobox--ledger", "oc-field--ledger", "oc-input-group--ledger"]) {
    assert.match(css, new RegExp(`\\.${cls}\\b`), cls);
  }
  assert.match(css, /--oc-ledger-focus: var\(--oc-module, var\(--oc-ring\)\)/);
  assert.match(css, /tabular-nums/);
  assert.match(css, /--oc-ledger-height: 2rem/);
});

test("catalog + field-extras CSS: the classes the wrappers render", () => {
  const catalog = parts[0][1];
  for (const cls of ["oc-combobox-clear", "oc-combobox-custom", "oc-combobox-footer", "oc-combobox-list--portal", "oc-combobox-option-description", "oc-combobox-option-image", "oc-combobox-option-emoji", "oc-combobox-loading", "oc-combobox-options"]) {
    assert.match(catalog, new RegExp(`\\.${cls}\\b`), cls);
  }
  const extras = parts[1][1];
  for (const cls of ["oc-field-label-row", "oc-field-label-trailing", "oc-field-required", "oc-field-tooltip"]) assert.match(extras, new RegExp(`\\.${cls}\\b`), cls);
});
