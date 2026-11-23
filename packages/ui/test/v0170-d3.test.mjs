// File: packages/ui/test/v0170-d3.test.mjs
// Map: nav-overflow.js (fit rule, More item built or reused, hidden items + menu copies + aria-current, ResizeObserver,
//      event) -> app-compound-overlays.css (tabs root, scrolling dialog, popover side/align, tooltip delay/open) ->
//      blocks app-appbar-overflow.css (hidden items, More, search)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, f), "utf8")).replace(/\r\n/g, "\n");

/** A jsdom page with an app header nav; widths are faked (jsdom has no layout) and ResizeObserver is a stand-in. */
async function page(navHtml, navWidth) {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(`<!doctype html><html><body><header class="oc-block-appbar">${navHtml}</header></body></html>`, { url: "https://example.test/" });
  const { window } = dom;
  const observers = [];
  window.ResizeObserver = class {
    constructor(cb) { observers.push(cb); }
    observe() {}
    disconnect() {}
  };
  let width = navWidth;
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() { return this.hasAttribute("data-oc-nav-more") ? 60 : this.tagName === "LI" ? 80 : 0; },
  });
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() { return this.hasAttribute("data-oc-nav-overflow") ? width : 0; },
  });
  return { window, doc: window.document, resize: (w) => { width = w; observers.forEach((cb) => cb()); } };
}

const LINKS = `<ul class="oc-navmenu">
  <li><a class="oc-navmenu-link" href="/c">Contacts</a></li>
  <li><a class="oc-navmenu-link" href="/co">Companies</a></li>
  <li><a class="oc-navmenu-link" href="/s">Segments</a></li>
  <li><a class="oc-navmenu-link" href="/r" aria-current="page">Reports</a></li>
</ul>`;

test("nav-overflow.js: fitNavItems keeps everything when it fits, else as many as fit next to More", async () => {
  const { fitNavItems } = await import("../src/nav-overflow.js");
  assert.equal(fitNavItems([50, 50, 50], 200, 40, 10), 3);
  assert.equal(fitNavItems([50, 50, 50], 140, 40, 10), 1);
  assert.equal(fitNavItems([50, 50, 50], 30, 40, 10), 0);
  assert.equal(fitNavItems([], 0, 40), 0);
});

test("nav-overflow.js: builds a More item, hides what does not fit and copies it into the menu", async () => {
  const { bindNavOverflow } = await import("../src/nav-overflow.js");
  const { doc, resize } = await page(`<nav class="oc-block-appbar-nav" data-oc-nav-overflow data-more-label="Meer">${LINKS}</nav>`, 240);
  const nav = doc.querySelector("nav");
  let detail = null;
  nav.addEventListener("oc-nav-overflow", (e) => { detail = e.detail; });
  const stop = bindNavOverflow(nav);
  const more = nav.querySelector("[data-oc-nav-more]");
  assert.ok(more, "More item built");
  const button = more.querySelector("button.oc-block-appbar-more");
  assert.match(button.textContent, /Meer/);
  assert.ok(button.querySelector('svg[data-icon="mdi:dots-horizontal"]'));
  const menu = more.querySelector(".oc-dropdown-menu[popover]");
  assert.equal(button.getAttribute("popovertarget"), menu.id);
  // 240 px: two links (80 + 80) + More (60).
  const hidden = [...nav.querySelectorAll("li[data-oc-hidden]:not([data-oc-nav-more])")].map((li) => li.textContent.trim());
  assert.deepEqual(hidden, ["Segments", "Reports"]);
  assert.deepEqual([...menu.querySelectorAll("a.oc-dropdown-item")].map((a) => [a.textContent, a.getAttribute("href")]), [["Segments", "/s"], ["Reports", "/r"]]);
  assert.equal(button.getAttribute("aria-current"), "page");
  assert.equal(nav.querySelector('a[href="/s"]').getAttribute("tabindex"), "-1");
  assert.deepEqual(detail, { visible: 2, hidden: 2 });
  // Wide enough: all links back, More hidden, menu empty.
  resize(1000);
  assert.equal(nav.querySelectorAll("li[data-oc-hidden]:not([data-oc-nav-more])").length, 0);
  assert.equal(more.hasAttribute("data-oc-hidden"), true);
  assert.equal(button.hasAttribute("aria-current"), false);
  assert.equal(menu.children.length, 0);
  assert.equal(nav.querySelector('a[href="/s"]').hasAttribute("tabindex"), false);
  stop();
  assert.equal(nav.dataset.ocBound, undefined);
});

test("nav-overflow.js: reuses the Blade More item and initNavOverflow binds once", async () => {
  const { initNavOverflow } = await import("../src/nav-overflow.js");
  const withMore = LINKS.replace("</ul>", '<li data-oc-nav-more data-oc-hidden aria-hidden="true"><button class="oc-navmenu-link oc-block-appbar-more" type="button" popovertarget="m1">More</button><div class="oc-dropdown-menu" id="m1" role="menu" popover></div></li></ul>');
  const { doc } = await page(`<nav class="oc-block-appbar-nav" data-oc-nav-overflow>${withMore}</nav>`, 160);
  initNavOverflow(doc);
  initNavOverflow(doc);
  const nav = doc.querySelector("nav");
  assert.equal(nav.querySelectorAll("[data-oc-nav-more]").length, 1);
  // 160 px: one link (80) + More (60).
  assert.equal(nav.querySelectorAll("li[data-oc-hidden]:not([data-oc-nav-more])").length, 3);
  assert.equal(doc.getElementById("m1").children.length, 3);
});

test("nav-overflow.d.ts declares the public functions", async () => {
  const dts = await read("../src/nav-overflow.d.ts");
  for (const fn of ["fitNavItems", "applyNavOverflow", "bindNavOverflow", "initNavOverflow"]) assert.match(dts, new RegExp(`export function ${fn}\\(`));
});

test("app-compound-overlays.css: tabs root, scrolling dialog, popover sides, tooltip delay and controlled state", async () => {
  const css = await read("../src/parts/app-compound-overlays.css");
  assert.match(css, /^\/\* File: packages\/ui\/src\/parts\/app-compound-overlays\.css \| Map:/);
  assert.match(css, /\.oc-tabs:has\(> \.oc-tab-list--vertical\)/);
  assert.match(css, /\.oc-modal-content--scroll > \.oc-modal-body \{[^}]*overflow-y: auto/);
  for (const side of ["top", "right", "bottom", "left"]) assert.match(css, new RegExp(`\\.oc-popover\\[popover\\]\\[data-side="${side}"\\]`));
  assert.match(css, /var\(--oc-popover-offset, 4px\)/);
  assert.match(css, /transition-delay: var\(--oc-tooltip-delay, 0ms\)/);
  assert.match(css, /\.oc-tooltip\.is-open::after/);
  assert.match(css, /\.oc-tooltip\.is-closed > \.oc-tooltip__content/);
  assert.match(css, /\.oc-tooltip-provider \{ display: contents; \}/);
  assert.doesNotMatch(css, /gradient|glow/i);
});

test("blocks app-appbar-overflow.css: hidden items keep their width, More button, search slot", async () => {
  const css = await read("../../blocks/src/parts/app-appbar-overflow.css");
  assert.match(css, /\.oc-block-appbar-nav \[data-oc-hidden\] \{[^}]*position: absolute;[^}]*visibility: hidden/);
  assert.match(css, /\.oc-block-appbar-more \{/);
  assert.match(css, /\.oc-block-appbar-search \{[^}]*flex: 0 1 18rem/);
  assert.match(css, /\[data-oc-nav-overflow\]/);
});
