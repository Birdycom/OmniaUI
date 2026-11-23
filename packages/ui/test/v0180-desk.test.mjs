// File: packages/ui/test/v0180-desk.test.mjs
// Map: status badges (tones per data-status, readonly chip) -> breadcrumb compound CSS -> barcode (UPC-A guess, Code 128
//      fallback, data-fallback on the figure) -> one-time code (active cell: helper, bindOtp, CSS)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eanCheck, encodeBarcode, guessFormat, renderBarcode } from "../src/barcode.js";
import { bindOtp, otpActiveCell } from "../src/form-extras.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");

test("status badges: every status of the set has a tone, readonly is a calm chip that cuts off its text", async () => {
  const css = await read("parts/app-badge-status.css");
  for (const s of ["paid", "approved", "active", "done", "pending", "overdue", "rejected", "failed", "sent", "scheduled", "in-progress", "refunded"]) {
    assert.match(css, new RegExp(`\\[data-status="${s}"\\]`), s);
  }
  assert.match(css, /\.oc-badge--readonly \{[^}]*border-radius: var\(--oc-radius\)/);
  assert.match(css, /\.oc-badge--readonly > :not\(svg, iconify-icon\) \{[^}]*text-overflow: ellipsis/);
  // a status or readonly badge with data-module keeps its own look
  const module = await read("parts/app-module-color.css");
  assert.match(module, /\.oc-badge--status, \.oc-badge--readonly\n\)\)/);
});

test("breadcrumb compound: the list takes no room, the page and the separator are styled", async () => {
  const css = await read("parts/nav-breadcrumb-compound.css");
  assert.match(css, /\.oc-breadcrumb > :is\(ol, ul\) \{\s*display: contents;/);
  assert.match(css, /\.oc-breadcrumb-item > \[aria-current="page"\]/);
  assert.match(css, /\.oc-breadcrumb-separator \{/);
});

test("barcode: 12 digits with a valid UPC check digit are UPC-A, else an EAN-13 body", () => {
  assert.equal(eanCheck("03600029145"), "2");
  assert.equal(guessFormat("036000291452"), "UPC");
  assert.equal(encodeBarcode("036000291452").format, "UPC");
  assert.equal(encodeBarcode("036000291452").text, "0036000291452");
  assert.equal(guessFormat("400638133393"), "EAN13"); // body of 4006381333931
  assert.equal(encodeBarcode("400638133393").text, "4006381333931");
  assert.equal(guessFormat("03600029145"), "UPC");
});

test("barcode: fallback code128 draws a wrong check digit as Code 128 instead of throwing", () => {
  assert.throws(() => encodeBarcode("4006381333932"), /check digit should be 1/);
  const fell = encodeBarcode("4006381333932", "auto", { fallback: "code128" });
  assert.equal(fell.format, "CODE128");
  assert.equal(fell.fallback, true);
  assert.equal(fell.text, "4006381333932");
  // a valid code is not touched
  const ok = encodeBarcode("4006381333931", "auto", { fallback: "code128" });
  assert.equal(ok.format, "EAN13");
  assert.equal(ok.fallback, undefined);
  // an explicit EAN-8 with a wrong check digit
  assert.equal(encodeBarcode("96385075", "EAN8", { fallback: "CODE128" }).format, "CODE128");
});

test("barcode.js: data-fallback on the figure, data-fallback-used after drawing", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(`<figure class="oc-barcode" data-value="4006381333932" data-fallback="code128"></figure><figure class="oc-barcode" data-value="4006381333932"></figure>`);
  const [a, b] = dom.window.document.querySelectorAll("figure");
  renderBarcode(a);
  renderBarcode(b);
  assert.ok(a.hasAttribute("data-fallback-used"));
  assert.ok(!a.hasAttribute("data-error"));
  assert.match(a.innerHTML, /<svg/);
  assert.ok(b.hasAttribute("data-error"));
});

test("otp: the active cell is the caret cell, the last one when the code is full", () => {
  assert.equal(otpActiveCell(0, 0, 6), 0);
  assert.equal(otpActiveCell(3, 3, 6), 3);
  assert.equal(otpActiveCell(1, 4, 6), 1);
  assert.equal(otpActiveCell(6, 6, 6), 5);
  assert.equal(otpActiveCell(null, 2, 6), 2);
});

test("otp: bindOtp marks the active cell while focused and clears it on blur", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(`<input class="oc-otp" maxlength="6" value="12">`, { pretendToBeVisual: true });
  const { window } = dom;
  const prev = globalThis.document;
  const prevRaf = globalThis.requestAnimationFrame;
  globalThis.document = window.document;
  globalThis.requestAnimationFrame = (fn) => fn();
  try {
    const input = window.document.querySelector("input");
    const off = bindOtp(input);
    input.focus();
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new window.Event("keyup"));
    assert.equal(input.getAttribute("data-otp-active"), "2");
    assert.equal(input.style.getPropertyValue("--oc-otp-active"), "2");
    input.blur();
    assert.ok(!input.hasAttribute("data-otp-active"));
    off();
  } finally {
    globalThis.document = prev;
    globalThis.requestAnimationFrame = prevRaf;
  }
  const css = await read("parts/forms-otp-active.css");
  assert.match(css, /\.oc-otp:focus\[data-otp-active\]/);
  assert.match(css, /var\(--oc-otp-active, 0\) \* var\(--oc-otp-cell\)/);
});

test("app header: the collapsible search opens over a narrow bar on focus", async () => {
  const css = (await fs.readFile(path.resolve(here, "../../blocks/src/parts/app-appbar-search-collapse.css"), "utf8")).replace(/\r\n/g, "\n");
  assert.match(css, /@container oc-block-appbar \(max-width: 40rem\)/);
  assert.match(css, /\.oc-block-appbar-search--collapse:focus-within \{[^}]*position: absolute/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});
