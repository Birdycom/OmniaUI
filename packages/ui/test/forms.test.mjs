// File: packages/ui/test/forms.test.mjs
// Map: contact-form.js contract (data attributes, protocol, auto start) -> block snippet uses them -> form CSS tokens

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const script = read("../src/contact-form.js");
const block = read("../../blocks/blocks/contact-form.html");
const css = read("../src/parts/forms-form.css");
const core = read("../src/components.css");

test("contact-form.js follows the JSON protocol and the field error markup", () => {
  assert.match(script, /Accept: "application\/json"/);
  assert.match(script, /result\.sent/);
  assert.match(script, /errors\.form/);
  assert.match(script, /`err-\$\{field\.name\}`/);
  assert.match(script, /"aria-invalid", "true"/);
  assert.match(script, /aria-busy/);
  assert.match(script, /url\.includes\("oc-contact-form"\)/);
});

test("the contact-form block has every hook the script looks for", () => {
  for (const hook of ["data-contact-root", "data-contact-form", "data-contact-body", "data-contact-success", "data-contact-alert", "data-contact-submit", "data-contact-label", "data-contact-again"]) {
    assert.ok(script.includes(hook), `script uses ${hook}`);
    assert.ok(block.includes(hook), `block has ${hook}`);
  }
  // The result and the alert start hidden; the honeypot is off screen, not display:none.
  assert.match(block, /data-contact-success hidden/);
  assert.match(block, /data-contact-alert hidden/);
  assert.match(block, /class="oc-honeypot" aria-hidden="true"/);
  assert.match(block, /class="oc-form oc-form--filled"/);
});

test("form CSS works through the field tokens of .oc-input", () => {
  for (const token of ["--oc-input-bg", "--oc-input-border", "--oc-input-padding", "--oc-input-radius", "--oc-input-size", "--oc-ring-width", "--oc-ring-alpha"]) {
    assert.ok(core.includes(`var(${token}`), `.oc-input reads ${token}`);
  }
  assert.match(css, /\.oc-form--filled \{[^}]*--oc-input-bg:/);
  assert.match(css, /\.oc-form\[aria-busy="true"\]/);
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ""), /display:\s*none/, "the honeypot must not use display:none");
});
