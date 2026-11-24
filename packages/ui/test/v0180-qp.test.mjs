// File: packages/ui/test/v0180-qp.test.mjs
// Map: QR encoder (known vector, structure, Reed-Solomon, capacity) -> barcode.js QR render + file -> sortable-list.js (keyboard,
//      arrows, pointer drag, move: false, live region) -> tabs.js revealTab -> combobox.js data-typing -> CSS of the 0.18.0 wishes
//      (progress striped/split, severity compact, sheet floating, otp variants, stat list, sync status, env frame, toast action,
//      copy field block, scrolling tab list, icon-only combobox) -> snippets

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

async function dom(html) {
  const { JSDOM } = await import("jsdom");
  return new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "https://example.test/", pretendToBeVisual: true }).window;
}

// "HELLO", level M, version 1, mask 2: the matrix of a reference encoder (ISO/IEC 18004), row by row, 1 = dark.
const HELLO_M = [
  "111111100011101111111",
  "100000100001001000001",
  "101110101010101011101",
  "101110101001101011101",
  "101110101111101011101",
  "100000101100101000001",
  "111111101010101111111",
  "000000001001100000000",
  "101111100000101111100",
  "000010011100100101111",
  "110011110001010011001",
  "001100000100000110000",
  "000011110011010010100",
  "000000001011111001011",
  "111111100000101100101",
  "100000101111111001001",
  "101110101010100100100",
  "101110101000100100100",
  "101110101001010010100",
  "100000100010000110101",
  "111111101011010010100",
];
const rows = (m) => m.map((r) => r.map((v) => (v ? "1" : "0")).join(""));

test("QR: HELLO at level M is version 1, mask 2 and matches the reference matrix module for module", async () => {
  const { encodeQr } = await import("../src/barcode.js");
  const qr = encodeQr("HELLO", { level: "M" });
  assert.equal(qr.version, 1);
  assert.equal(qr.size, 21);
  assert.equal(qr.mask, 2);
  assert.deepEqual(rows(qr.matrix), HELLO_M);
});

test("QR: modes, versions and the function patterns", async () => {
  const { encodeQr, qrSegment, qrAlignment, qrDataCodewords, qrFormatBits } = await import("../src/barcode.js");
  assert.equal(qrSegment("0123").mode, 1);
  assert.equal(qrSegment("HELLO WORLD").mode, 2);
  assert.equal(qrSegment("https://example.test").mode, 4);
  assert.equal(qrSegment("été").count, 5); // UTF-8 bytes
  // capacity: 26 data codewords in version 1-L, 16 in 1-M
  assert.equal(qrDataCodewords(1, "L"), 19);
  assert.equal(qrDataCodewords(1, "M"), 16);
  assert.deepEqual(qrAlignment(7), [6, 22, 38]);
  assert.deepEqual(qrAlignment(32), [6, 34, 60, 86, 112, 138]);
  // format bits of level M, mask 0 (table value)
  assert.equal(qrFormatBits("M", 0), 0b101010000010010);
  const url = encodeQr("https://company1.example/order/1001", { level: "M" });
  assert.equal(url.version, 3);
  assert.equal(url.size, 29);
  // three finder patterns with their separators, the timing lines
  const m = url.matrix;
  for (const [x, y] of [[0, 0], [url.size - 7, 0], [0, url.size - 7]]) {
    assert.equal(m[y][x], true);
    assert.equal(m[y + 1][x + 1], false);
    assert.equal(m[y + 3][x + 3], true);
  }
  for (let i = 8; i < url.size - 8; i++) {
    assert.equal(m[6][i], i % 2 === 0);
    assert.equal(m[i][6], i % 2 === 0);
  }
  assert.equal(m[url.size - 8][8], true); // the dark module
  // version info from version 7: a long text
  const big = encodeQr("x".repeat(200), { level: "L" });
  assert.ok(big.version >= 7);
  assert.throws(() => encodeQr("9".repeat(8000), { level: "H" }), /too long/);
  assert.throws(() => encodeQr("A", { level: "X" }), /L, M, Q or H/);
});

test("QR: Reed-Solomon remainder of a known block (version 1-M, HELLO WORLD)", async () => {
  const { rsDivisor, rsRemainder } = await import("../src/barcode.js");
  // data codewords and error correction of the ISO example "HELLO WORLD" at 1-M
  const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  assert.deepEqual(rsRemainder(data, rsDivisor(10)), [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
});

test("barcode.js: data-format=QR draws a square SVG, the text caption and the --qr class; barcodeFile gives a white file", async () => {
  const { renderBarcode, barcodeFile, encodeBarcode, qrToSvg, encodeQr } = await import("../src/barcode.js");
  const win = await dom('<figure class="oc-barcode" data-format="QR" data-level="H" data-value="CUSTOMER-1"></figure>');
  const fig = win.document.querySelector("figure");
  renderBarcode(fig);
  assert.ok(fig.classList.contains("oc-barcode--qr"));
  const svg = fig.querySelector("svg.oc-barcode__qr");
  assert.ok(svg);
  assert.match(svg.getAttribute("viewBox"), /^0 0 (\d+) \1$/);
  assert.equal(svg.getAttribute("aria-label"), "QR code CUSTOMER-1");
  assert.equal(fig.querySelector(".oc-barcode__digits").textContent, "CUSTOMER-1");
  assert.equal(encodeBarcode("CUSTOMER-1", "QR", { level: "H" }).qr.level, "H");
  // a barcode next to it stays a barcode
  const ean = await dom('<figure class="oc-barcode" data-value="5400000000010"></figure>');
  renderBarcode(ean.document.querySelector("figure"));
  assert.ok(!ean.document.querySelector("figure").classList.contains("oc-barcode--qr"));
  const file = barcodeFile("https://company1.example", { format: "QR", moduleWidth: 4 });
  assert.match(file, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="(\d+)" height="\d+"/);
  assert.match(file, /<rect width="100%" height="100%" fill="#fff"\/>/);
  // quiet zone of 4 modules: the first dark module starts at x = 4
  assert.match(qrToSvg(encodeQr("A").matrix), /<path d="M4 4h1v1h-1z/);
});

test("barcode CSS: QR keeps black on white with a quiet zone, also bare and printed", async () => {
  const css = await read("../src/parts/media-barcode.css");
  assert.match(css, /\.oc-barcode--qr svg \{[^}]*color: #000;[^}]*background: #fff;/);
  assert.match(css, /--oc-barcode-qr-size/);
  assert.match(css, /@media print \{\n  \.oc-barcode--qr svg \{ print-color-adjust: exact;/);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
});

const LIST = `<ol class="oc-sortable-list" data-oc-sortable>
  <li class="oc-sortable-item" data-id="a"><button type="button" class="oc-sortable-row-grip" aria-label="Move A"></button><span class="oc-sortable-item__body">A</span>
    <span class="oc-sortable-item__arrows"><button type="button" data-oc-move="up">u</button><button type="button" data-oc-move="down">d</button></span></li>
  <li class="oc-sortable-item" data-id="b"><button type="button" class="oc-sortable-row-grip" aria-label="Move B"></button><span class="oc-sortable-item__body">B</span>
    <span class="oc-sortable-item__arrows"><button type="button" data-oc-move="up">u</button><button type="button" data-oc-move="down">d</button></span></li>
  <li class="oc-sortable-item" data-id="c"><button type="button" class="oc-sortable-row-grip" aria-label="Move C"></button><span class="oc-sortable-item__body">C</span>
    <span class="oc-sortable-item__arrows"><button type="button" data-oc-move="up">u</button><button type="button" data-oc-move="down">d</button></span></li>
</ol>`;

const key = (win, el, k) => el.dispatchEvent(new win.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

test("sortable-list.js: Space picks up, arrows move, Space drops; announced; oc-reorder with the new order", async () => {
  const { initSortableLists, sortableOrder } = await import("../src/sortable-list.js");
  const win = await dom(LIST);
  const doc = win.document;
  const list = doc.querySelector("ol");
  initSortableLists(doc);
  const events = [];
  list.addEventListener("oc-reorder", (e) => events.push(e.detail));
  const grip = doc.querySelector('[data-id="a"] .oc-sortable-row-grip');
  grip.focus();
  key(win, grip, " ");
  assert.equal(grip.getAttribute("aria-pressed"), "true");
  assert.ok(doc.querySelector('[data-id="a"]').classList.contains("oc-sortable-item--grabbed"));
  const live = list.nextElementSibling;
  assert.equal(live.getAttribute("aria-live"), "polite");
  assert.match(live.textContent, /^A grabbed\. Position 1 of 3/);
  key(win, grip, "ArrowDown");
  assert.deepEqual(sortableOrder(list), ["b", "a", "c"]);
  assert.equal(live.textContent, "A: position 2 of 3.");
  assert.equal(doc.activeElement, grip);
  key(win, grip, "End");
  assert.deepEqual(sortableOrder(list), ["b", "c", "a"]);
  key(win, grip, " ");
  assert.equal(grip.getAttribute("aria-pressed"), "false");
  assert.equal(live.textContent, "A dropped at position 3 of 3.");
  assert.deepEqual(events.map((e) => [e.from, e.to]), [[0, 1], [1, 2]]);
  assert.deepEqual(events.at(-1).order, ["b", "c", "a"]);
  // Escape puts it back where it was picked up
  key(win, grip, "Enter");
  key(win, grip, "Home");
  assert.deepEqual(sortableOrder(list), ["a", "b", "c"]);
  key(win, grip, "Escape");
  assert.deepEqual(sortableOrder(list), ["b", "c", "a"]);
  assert.match(live.textContent, /^Move cancelled\. A is back at position 3 of 3\./);
});

test("sortable-list.js: the focusout Chrome fires while the node moves does not drop the grabbed item", async () => {
  const { bindSortableList, sortableOrder } = await import("../src/sortable-list.js");
  const win = await dom(LIST);
  const doc = win.document;
  const list = doc.querySelector("ol");
  bindSortableList(list);
  const grip = doc.querySelector('[data-id="a"] .oc-sortable-row-grip');
  // like Chrome: taking the focused node out of the DOM fires focusout (relatedTarget null) during insertBefore
  const insert = list.insertBefore.bind(list);
  list.insertBefore = (node, ref) => {
    if (node.contains(doc.activeElement)) doc.activeElement.dispatchEvent(new win.FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    return insert(node, ref);
  };
  grip.focus();
  key(win, grip, " ");
  key(win, grip, "ArrowDown");
  key(win, grip, "ArrowDown");
  assert.deepEqual(sortableOrder(list), ["b", "c", "a"]);
  assert.equal(grip.getAttribute("aria-pressed"), "true");
  // a late focusout after the grip got the focus back keeps it grabbed too
  grip.dispatchEvent(new win.FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
  key(win, grip, "ArrowUp");
  assert.deepEqual(sortableOrder(list), ["b", "a", "c"]);
  // really leaving (focus elsewhere) drops it
  doc.querySelector('[data-id="b"] .oc-sortable-row-grip').focus();
  assert.equal(grip.getAttribute("aria-pressed"), "false");
});

test("sortable-list.js: arrow buttons move one step; the ends do nothing", async () => {
  const { bindSortableList, sortableOrder } = await import("../src/sortable-list.js");
  const win = await dom(LIST);
  const list = win.document.querySelector("ol");
  bindSortableList(list);
  win.document.querySelector('[data-id="c"] [data-oc-move="up"]').click();
  assert.deepEqual(sortableOrder(list), ["a", "c", "b"]);
  win.document.querySelector('[data-id="a"] [data-oc-move="up"]').click();
  assert.deepEqual(sortableOrder(list), ["a", "c", "b"]);
});

test("sortable-list.js: pointer drag (touch) shows a ghost and a drop line, and drops between the items", async () => {
  const { bindSortableList, sortableOrder } = await import("../src/sortable-list.js");
  const win = await dom(LIST);
  const doc = win.document;
  const list = doc.querySelector("ol");
  // three rows of 40px from y = 0
  [...list.querySelectorAll(".oc-sortable-item")].forEach((li, i) => {
    li.getBoundingClientRect = () => ({ top: i * 40, bottom: i * 40 + 40, left: 0, right: 200, width: 200, height: 40, x: 0, y: i * 40 });
  });
  bindSortableList(list);
  const P = win.PointerEvent ?? win.MouseEvent;
  const ev = (type, y) => {
    const e = new P(type, { bubbles: true, cancelable: true, clientX: 10, clientY: y, button: 0 });
    if (!("pointerId" in e) || e.pointerId === undefined) Object.defineProperty(e, "pointerId", { value: 1 });
    return e;
  };
  const grip = doc.querySelector('[data-id="a"] .oc-sortable-row-grip');
  grip.dispatchEvent(ev("pointerdown", 20));
  const ghost = doc.querySelector(".oc-drag-ghost");
  assert.ok(ghost, "ghost while dragging");
  assert.equal(ghost.getAttribute("aria-hidden"), "true");
  assert.ok(doc.querySelector('[data-id="a"]').classList.contains("oc-sortable-item--dragging"));
  list.dispatchEvent(ev("pointermove", 110));
  const line = list.querySelector(".oc-dropline");
  assert.ok(line, "drop line in the list");
  assert.equal(line.nextElementSibling, null); // after the last item
  list.dispatchEvent(ev("pointerup", 110));
  assert.equal(doc.querySelector(".oc-drag-ghost"), null);
  assert.equal(list.querySelector(".oc-dropline"), null);
  assert.deepEqual(sortableOrder(list), ["b", "c", "a"]);
  // a cancelled drag changes nothing
  doc.querySelector('[data-id="b"] .oc-sortable-row-grip').dispatchEvent(ev("pointerdown", 20));
  list.dispatchEvent(ev("pointermove", 110));
  list.dispatchEvent(ev("pointercancel", 110));
  assert.deepEqual(sortableOrder(list), ["b", "c", "a"]);
});

test("sortable-list.js: move: false only reports from / to (frameworks render the order)", async () => {
  const { bindSortableList, sortableOrder } = await import("../src/sortable-list.js");
  const win = await dom(LIST);
  const list = win.document.querySelector("ol");
  const calls = [];
  const api = bindSortableList(list, { move: false, onReorder: (from, to) => calls.push([from, to]) });
  win.document.querySelector('[data-id="a"] [data-oc-move="down"]').click();
  assert.deepEqual(calls, [[0, 1]]);
  assert.deepEqual(sortableOrder(list), ["a", "b", "c"]);
  api.destroy();
  assert.equal(list._ocSortable, undefined);
});

test("tabs.js: revealTab scrolls a tab into view inside its list only", async () => {
  const { revealTab } = await import("../src/tabs.js");
  const win = await dom('<div class="oc-tab-list"><button class="oc-tab-trigger">A</button><button class="oc-tab-trigger">B</button></div>');
  const list = win.document.querySelector(".oc-tab-list");
  const [, b] = list.children;
  Object.defineProperty(list, "scrollWidth", { value: 400 });
  Object.defineProperty(list, "clientWidth", { value: 200 });
  Object.defineProperty(list, "offsetLeft", { value: 0 });
  Object.defineProperty(b, "offsetLeft", { value: 300 });
  Object.defineProperty(b, "offsetWidth", { value: 80 });
  let to = null;
  list.scrollTo = (o) => { to = o.left; };
  revealTab(b, false);
  assert.equal(to, 300 + 80 - 200 + 8);
});

test("combobox.js: an icon-only trigger gets data-typing while a query is typed, and loses it on a choice", async () => {
  const { initCombobox } = await import("../src/combobox.js");
  const win = await dom(`<div class="oc-combobox oc-combobox--header oc-combobox--icon-only" data-oc-combobox>
    <span class="oc-combobox-icon"></span>
    <input class="oc-input oc-combobox-input" role="combobox" aria-controls="l" aria-expanded="false">
    <ul class="oc-combobox-list" id="l" role="listbox">
      <li class="oc-combobox-option" role="option" data-value="nl">Nederlands</li>
      <li class="oc-combobox-option" role="option" data-value="en">English</li>
    </ul></div>`);
  const doc = win.document;
  initCombobox(doc);
  const root = doc.querySelector(".oc-combobox");
  const input = doc.querySelector("input");
  input.focus();
  input.value = "Ned";
  input.dispatchEvent(new win.Event("input", { bubbles: true }));
  assert.ok(root.hasAttribute("data-typing"));
  doc.querySelector('[data-value="nl"]').click();
  assert.ok(!root.hasAttribute("data-typing"));
  // the chosen label sits invisibly in the field: focus and click select it, so typing replaces it
  assert.equal(input.value, "Nederlands");
  input.blur();
  input.focus();
  assert.equal([input.selectionStart, input.selectionEnd].join(), "0,10");
  input.setSelectionRange(3, 3);
  input.click();
  assert.equal([input.selectionStart, input.selectionEnd].join(), "0,10");
  // while typing, a click keeps the caret where it is
  input.value = "En";
  input.dispatchEvent(new win.Event("input", { bubbles: true }));
  input.setSelectionRange(1, 1);
  input.click();
  assert.equal([input.selectionStart, input.selectionEnd].join(), "1,1");
  const css = await read("../src/parts/forms-combobox-catalog.css");
  assert.match(css, /\.oc-combobox\.oc-combobox--icon-only\[data-typing\] > \.oc-combobox-input,\n[^{]*\{[^}]*position: absolute;[^}]*inset-inline-end: 0;[^}]*color: var\(--oc-foreground\);[^}]*caret-color: auto;/);
  // the closed icon-only trigger keeps its transparent text (0.17.2)
  assert.match(css, /\.oc-combobox\.oc-combobox--icon-only > \.oc-combobox-input,\n[^{]*\{[^}]*color: transparent;/);
});

test("CSS of the 0.18.0 wishes: flat, ASCII, the classes in place", async () => {
  const progress = await read("../src/parts/data-progress-split.css");
  assert.match(progress, /\.oc-progress--striped \{[^}]*repeating-linear-gradient\(-45deg, var\(--oc-progress-stripe\) 0 3px, transparent 3px 7px\)/);
  assert.match(progress, /\.oc-progress--split \{[^}]*display: flex;[^}]*gap: 2px;/);
  assert.match(progress, /\.oc-progress-segment--danger \{ --oc-progress-color: var\(--oc-destructive\); \}/);
  assert.doesNotMatch(progress, /box-shadow/);

  const sev = await read("../src/parts/app-severity-card.css");
  assert.match(sev, /\.oc-severity-card--calm \{ --oc-severity-color: var\(--oc-info, var\(--oc-primary\)\); \}/);
  assert.match(sev, /\.oc-severity-card--compact > \.oc-severity-card-head::after \{ content: none; \}/);

  const sheet = await read("../src/parts/app-sheet-options.css");
  assert.match(sheet, /@media \(min-width: 48rem\) \{\n  dialog\.oc-sheet\.oc-sheet--bottom,\n  dialog\.oc-sheet--inset\.oc-sheet--bottom \{ inline-size: min\(var\(--oc-sheet-max, 40rem\), 100%\); margin-inline: auto; \}/);
  assert.match(sheet, /dialog\.oc-sheet--floating \{[^}]*--oc-sheet-margin: 0\.75rem;[^}]*--oc-sheet-radius: var\(--oc-radius-xl/);
  assert.match(sheet, /dialog\.oc-sheet--rounded\.oc-sheet--bottom \.oc-sheet-content \{ border-radius: var\(--oc-sheet-radius\) var\(--oc-sheet-radius\) 0 0; \}/);

  const otp = await read("../src/parts/forms-otp-variants.css");
  assert.match(otp, /\.oc-otp\.oc-otp--block \{[^}]*--oc-otp-cell: calc\(100cqi \/ var\(--oc-otp-length\)\);/);
  assert.match(otp, /\.oc-otp\.oc-otp--lg \{[^}]*--oc-otp-size: 2\.25rem;/);
  assert.match(otp, /\.oc-otp\.oc-otp--tiles \{[^}]*--oc-otp-bar: var\(--oc-border\);/);

  const dl = await read("../src/parts/data-dl-stat.css");
  assert.match(dl, /\.oc-dl--stat \.oc-dl-detail \{[^}]*font-variant-numeric: tabular-nums;/);
  assert.match(dl, /\.oc-dl--stat > \.oc-dl-row--total \{[^}]*border-block-start: 2px solid/);

  const status = await read("../src/parts/app-status-dot.css");
  assert.match(status, /\.oc-status--compact > \.oc-status__text,/);

  const mode = await read("../src/parts/app-mode-badge.css");
  assert.match(mode, /\.oc-env-frame \{[^}]*position: fixed;[^}]*inset: 0;[^}]*pointer-events: none;/);
  assert.match(mode, /\.oc-mode-badge\[data-mode="staging"\]/);
  assert.match(mode, /\.oc-mode-badge\[data-mode="offline"\]/);

  const toast = await read("../src/parts/app-toast-action.css");
  assert.match(toast, /\.oc-toast-action:focus-visible \{ outline: 2px solid var\(--oc-ring\);/);

  const copy = await read("../src/parts/forms-copy-field-extras.css");
  assert.match(copy, /\.oc-copy-field\.oc-copy-field--block \{[^}]*min-inline-size: 0;/);

  const sortable = await read("../src/parts/app-sortable-list.css");
  assert.match(sortable, /\.oc-dropline \{/);
  assert.match(sortable, /\.oc-drag-ghost \{[^}]*pointer-events: none;/);

  const main = await read("../src/components.css");
  assert.match(main, /\.oc-tab-list \{\n  display: inline-flex;[^}]*max-inline-size: 100%;[^}]*overflow-x: auto;[^}]*overscroll-behavior-x: contain;[^}]*scrollbar-width: none;[^}]*white-space: nowrap;[^}]*box-shadow: inset 0 -1px 0 var\(--oc-border\);/);
  assert.match(main, /\.oc-tab-list > \.oc-tab-trigger \{ flex: none; \}/);
  assert.match(main, /\.oc-tab-list--vertical \{[^}]*overflow: visible;/);

  // new files are plain ASCII; in the extended files no raw non-ASCII in a content: value
  for (const css of [progress, otp, dl, toast, sortable]) assert.doesNotMatch(css, /[^\x00-\x7f]/);
  for (const css of [progress, sev, sheet, otp, dl, status, mode, toast, copy, sortable]) {
    assert.doesNotMatch(css, /content:\s*"[^"]*[^\x00-\x7f]/);
    assert.doesNotMatch(css, /ad-/);
  }
});

test("snippets: QR, split bar, compact severity, stat list, tiles, sortable list, env frame", async () => {
  assert.match(await read("../snippets/barcode.html"), /data-format="QR"/);
  assert.match(await read("../snippets/progress.html"), /oc-progress--split/);
  assert.match(await read("../snippets/severity-card.html"), /oc-severity-card--calm oc-severity-card--compact/);
  assert.match(await read("../snippets/definition-list.html"), /oc-dl--stat/);
  assert.match(await read("../snippets/otp-input.html"), /oc-otp--tiles/);
  assert.match(await read("../snippets/sortable-list.html"), /data-oc-sortable/);
  assert.match(await read("../snippets/mode-badge.html"), /oc-env-frame/);
});
