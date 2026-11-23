// File: packages/ui/test/v0170-d4.test.mjs
// Map: jsdom globals -> sidebar.js (storage key, persist local + cookie, trigger + rail, event, mobile overlay, Escape,
//      outside click, shortcut) -> data-table.js server mode (no local filter/sort/slice, summary + pager from total/page,
//      query events for sort, page, page size, trash, filter, debounced search, selection over pages, updateDataTable,
//      loading, column chooser event) -> CSS parts

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");

// One jsdom window for the scripts (they use the globals document, window, CustomEvent, localStorage).
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/app", pretendToBeVisual: true });
const { window } = dom;
let mobile = false;
const mqListeners = new Set();
window.matchMedia = (query) => ({
  media: query,
  get matches() { return mobile; },
  addEventListener: (_, fn) => mqListeners.add(fn),
  removeEventListener: (_, fn) => mqListeners.delete(fn),
});
const setMobile = (on) => { mobile = on; for (const fn of mqListeners) fn(); };
for (const key of ["window", "document", "CustomEvent", "Event", "HTMLElement", "localStorage", "CSS", "KeyboardEvent", "MouseEvent"]) {
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: window[key] ?? globalThis[key] });
}
globalThis.CSS = globalThis.CSS ?? { escape: (s) => String(s).replace(/["\\]/g, "\\$&") };

const sidebar = await import("../src/sidebar.js");
const dt = await import("../src/data-table.js");

function mount(html) {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}
const click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }));
const input = (el) => el.dispatchEvent(new window.Event("input", { bubbles: true }));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ sidebar.js */

const SIDEBAR = (attrs = "") => `<div class="oc-sidebar-provider" data-oc-sidebar-provider ${attrs}>
  <aside class="oc-sidebar"><div class="oc-sidebar-content"><a class="oc-sidebar-menu-button" href="#">Home</a></div></aside>
  <button class="oc-sidebar-rail" type="button" data-oc-sidebar-rail></button>
  <main class="oc-sidebar-inset"><button type="button" data-oc-sidebar-trigger>Menu</button><input class="field"></main>
</div>`;

test("sidebar storage keys", () => {
  assert.equal(sidebar.sidebarStorageKey("app"), "oc-sidebar:app");
  assert.equal(sidebar.sidebarStorageKey(true), "oc-sidebar:default");
  assert.equal(sidebar.sidebarStorageKey("app", "cookie"), "oc-sidebar-app");
  assert.equal(sidebar.sidebarStorageKey(""), null);
  assert.equal(sidebar.sidebarStorageKey(undefined), null);
});

test("trigger and rail toggle the sidebar, remember it and fire oc-sidebar-change", () => {
  localStorage.clear();
  const host = mount(SIDEBAR('data-oc-persist="t1"'));
  const root = host.firstElementChild;
  const ctl = sidebar.bindSidebarProvider(root);
  assert.equal(sidebar.bindSidebarProvider(root), ctl, "binding twice returns the same controller");
  const aside = root.querySelector(".oc-sidebar");
  const trigger = root.querySelector("[data-oc-sidebar-trigger]");
  const events = [];
  root.addEventListener("oc-sidebar-change", (e) => events.push(e.detail));
  assert.equal(root.dataset.state, "expanded");
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  click(trigger);
  assert.ok(aside.classList.contains("oc-sidebar--collapsed"));
  assert.equal(root.dataset.state, "collapsed");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(localStorage.getItem("oc-sidebar:t1"), "1");
  click(root.querySelector("[data-oc-sidebar-rail]"));
  assert.ok(!aside.classList.contains("oc-sidebar--collapsed"));
  assert.equal(localStorage.getItem("oc-sidebar:t1"), "0");
  assert.deepEqual(events, [{ collapsed: true, mobile: false }, { collapsed: false, mobile: false }]);
  host.remove();
});

test("the remembered state wins over the markup; data-state=collapsed starts collapsed", () => {
  localStorage.setItem("oc-sidebar:t2", "1");
  const host = mount(SIDEBAR('data-oc-persist="t2"'));
  sidebar.bindSidebarProvider(host.firstElementChild);
  assert.ok(host.querySelector(".oc-sidebar").classList.contains("oc-sidebar--collapsed"));
  host.remove();
  const host2 = mount(SIDEBAR('data-state="collapsed"'));
  sidebar.bindSidebarProvider(host2.firstElementChild);
  assert.ok(host2.querySelector(".oc-sidebar").classList.contains("oc-sidebar--collapsed"));
  host2.remove();
});

test("cookie storage", () => {
  document.cookie = "oc-sidebar-t3=; max-age=0; path=/";
  const host = mount(SIDEBAR('data-oc-persist="t3" data-oc-storage="cookie"'));
  sidebar.bindSidebarProvider(host.firstElementChild);
  click(host.querySelector("[data-oc-sidebar-trigger]"));
  assert.match(document.cookie, /oc-sidebar-t3=1/);
  host.remove();
  const again = mount(SIDEBAR('data-oc-persist="t3" data-oc-storage="cookie"'));
  sidebar.bindSidebarProvider(again.firstElementChild);
  assert.ok(again.querySelector(".oc-sidebar").classList.contains("oc-sidebar--collapsed"), "the cookie is read back");
  again.remove();
});

test("mobile: overlay, starts closed, Escape and a click outside close it, desktop state untouched", () => {
  localStorage.clear();
  setMobile(true);
  const host = mount(SIDEBAR('data-oc-persist="t4"'));
  const root = host.firstElementChild;
  const ctl = sidebar.bindSidebarProvider(root);
  const aside = root.querySelector(".oc-sidebar");
  assert.equal(ctl.isMobile, true);
  assert.ok(aside.classList.contains("oc-sidebar--overlay"));
  assert.ok(aside.classList.contains("oc-sidebar--collapsed"), "closed on a phone");
  assert.equal(root.dataset.mobile, "");
  click(root.querySelector("[data-oc-sidebar-trigger]"));
  assert.ok(!aside.classList.contains("oc-sidebar--collapsed"));
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.ok(aside.classList.contains("oc-sidebar--collapsed"));
  ctl.toggle();
  root.querySelector(".field").dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
  assert.ok(aside.classList.contains("oc-sidebar--collapsed"), "a click on the page closes it");
  ctl.toggle();
  aside.querySelector("a").dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
  assert.ok(!aside.classList.contains("oc-sidebar--collapsed"), "a click inside keeps it open");
  assert.equal(localStorage.getItem("oc-sidebar:t4"), null, "the phone state is not remembered");
  setMobile(false);
  assert.ok(!aside.classList.contains("oc-sidebar--overlay"));
  assert.ok(!aside.classList.contains("oc-sidebar--collapsed"), "back to the desktop state");
  host.remove();
});

test("Ctrl/Cmd+B toggles; data-oc-shortcut changes or turns it off", () => {
  const host = mount(SIDEBAR());
  const root = host.firstElementChild;
  sidebar.bindSidebarProvider(root);
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true }));
  assert.equal(root.dataset.state, "collapsed");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "B", metaKey: true, bubbles: true }));
  assert.equal(root.dataset.state, "expanded");
  host.remove();
  const off = mount(SIDEBAR('data-oc-shortcut=""'));
  sidebar.bindSidebarProvider(off.firstElementChild);
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true }));
  assert.equal(off.firstElementChild.dataset.state, "expanded");
  off.remove();
});

/* ------------------------------------------------------------------ data-table.js server mode */

const row = (key, name, price, status = "active") =>
  `<tr data-oc-row data-oc-key="${key}" data-oc-status="${status}"><td data-oc-col="select"><input type="checkbox" data-oc-select></td><td data-oc-col="name">${name}</td><td data-oc-col="price" data-numeric>${price}</td><td data-oc-col="actions"></td></tr>`;

const TABLE = (rows, attrs = 'data-oc-server="true" data-oc-total="23" data-oc-current-page="1"') => `<div class="oc-data-table" id="srv" data-page-size="10" ${attrs}>
  <div class="oc-data-table-toolbar">
    <input class="oc-data-table-search" type="search">
    <div class="oc-filter-pills"><button data-oc-filter="active" aria-current="true">A</button><button data-oc-filter="all">B</button><button data-oc-filter="deleted">C</button></div>
    <p data-oc-sort-summary></p>
  </div>
  <div class="oc-data-table-filters"><select data-oc-col-filter="type"><option value="">All</option><option value="b2b">B2B</option></select></div>
  <div class="oc-dropdown-menu oc-data-table-colpick"><input type="checkbox" data-oc-visible-col="name" checked><input type="checkbox" data-oc-visible-col="price" checked></div>
  <div class="oc-data-table-bulk" hidden><span data-oc-selected-count></span></div>
  <div class="oc-data-table-frame"><table><thead><tr><th data-oc-col="select"><input type="checkbox" data-oc-select-all></th><th data-oc-col="name"><button class="oc-table-sort">Name</button></th><th data-oc-col="price" data-oc-sort="numeric"><button class="oc-table-sort">Price</button></th><th data-oc-col="actions"></th></tr></thead>
  <tbody>${rows}</tbody></table><p class="oc-data-table-empty" hidden>No results</p></div>
  <div class="oc-data-table-footer"><p class="oc-data-table-summary" data-oc-summary=""></p><select data-oc-page-size><option value="10" selected>10</option><option value="20">20</option></select><nav data-oc-pager></nav></div>
</div>`;

function table(rows = row("k3", "Zed", "3") + row("k1", "Ann", "1") + row("k2", "Bob", "2", "deleted"), attrs) {
  localStorage.clear();
  const host = mount(TABLE(rows, attrs));
  const root = host.querySelector(".oc-data-table");
  const queries = [];
  root.addEventListener("oc-datatable-query", (e) => queries.push(e.detail));
  dt.bindDataTable(root);
  return { host, root, queries, names: () => [...root.querySelectorAll("tbody [data-oc-row]")].filter((r) => !r.hidden).map((r) => r.cells[1].textContent) };
}

test("server mode shows the rows as given: no trash filter, no sort, no slice", () => {
  const { host, root, names } = table();
  assert.deepEqual(names(), ["Zed", "Ann", "Bob"], "the deleted row stays: the server filtered");
  assert.equal(root.querySelector("[data-oc-summary]").textContent, "Showing 1–3 of 23");
  const pages = [...root.querySelectorAll("[data-oc-pager] [data-oc-page]")].map((b) => b.textContent);
  assert.deepEqual(pages, ["«", "‹", "1", "2", "3", "›", "»"], "23 rows of 10 = 3 pages");
  assert.ok(root.querySelector(".oc-data-table-empty").hidden);
  host.remove();
});

test("the client mode still filters and sorts (no regression)", () => {
  const { host, root, names } = table(undefined, 'data-oc-total="23"');
  assert.deepEqual(names().sort(), ["Ann", "Zed"], "the deleted row is hidden in the client mode");
  assert.equal(root.querySelector("[data-oc-summary]").textContent, "Showing 1–2 of 2");
  host.remove();
});

test("sort click fires a query and does not reorder the rows", () => {
  const { host, root, queries, names } = table();
  click(root.querySelector('th[data-oc-col="name"] .oc-table-sort'));
  assert.deepEqual(names(), ["Zed", "Ann", "Bob"]);
  assert.equal(queries.length, 1);
  assert.deepEqual(queries[0], { reason: "sort", sort: "name", dir: "asc", page: 1, pageSize: 10, search: "", trashed: "active", filters: { type: "" } });
  assert.equal(root.querySelector('th[data-oc-col="name"]').getAttribute("aria-sort"), "ascending");
  click(root.querySelector('th[data-oc-col="name"] .oc-table-sort'));
  assert.equal(queries[1].dir, "desc");
  assert.equal(root.querySelector("[data-oc-sort-summary]").textContent, "Sorted by Name, descending");
  host.remove();
});

test("pager, page size, trash pills and column filters fire queries", () => {
  const { host, root, queries } = table();
  click(root.querySelector('[data-oc-pager] [data-oc-page="3"]'));
  assert.equal(queries.at(-1).reason, "page");
  assert.equal(queries.at(-1).page, 3);
  assert.equal(root.querySelector('[data-oc-pager] [aria-current="page"]').textContent, "3", "the pager moves at once");
  assert.equal(root.querySelector("[data-oc-summary]").textContent, "Showing 21–23 of 23");
  const size = root.querySelector("[data-oc-page-size]");
  size.value = "20";
  change(size);
  assert.deepEqual([queries.at(-1).reason, queries.at(-1).pageSize, queries.at(-1).page], ["pageSize", 20, 1]);
  click(root.querySelector('[data-oc-filter="deleted"]'));
  assert.deepEqual([queries.at(-1).reason, queries.at(-1).trashed], ["trashed", "deleted"]);
  const sel = root.querySelector("select[data-oc-col-filter]");
  sel.value = "b2b";
  change(sel);
  assert.deepEqual([queries.at(-1).reason, queries.at(-1).filters], ["filter", { type: "b2b" }]);
  host.remove();
});

test("search waits for the typing delay; Enter does not wait", async () => {
  const { host, root, queries } = table(undefined, 'data-oc-server="true" data-oc-total="3" data-oc-search-delay="20"');
  const field = root.querySelector(".oc-data-table-search");
  field.value = "h";
  input(field);
  field.value = "hi";
  input(field);
  assert.equal(queries.length, 0);
  await sleep(40);
  assert.equal(queries.length, 1, "one query after the pause");
  assert.deepEqual([queries[0].reason, queries[0].search, queries[0].page], ["search", "hi", 1]);
  field.value = "hin";
  input(field);
  field.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.equal(queries.length, 2);
  assert.equal(queries[1].search, "hin");
  await sleep(40);
  assert.equal(queries.length, 2, "the pending timer was dropped");
  host.remove();
});

test("the app answers: updateDataTable sets total, page, sort and trash, rows replaced keep the selection", () => {
  const { host, root, names } = table();
  const selections = [];
  root.addEventListener("oc-datatable-selection", (e) => selections.push(e.detail.keys));
  const box = root.querySelector('[data-oc-key="k1"] [data-oc-select]');
  box.checked = true;
  change(box);
  assert.deepEqual(selections.at(-1), ["k1"]);
  // The next page from the server.
  root.querySelector("tbody").innerHTML = row("k11", "Cid", "11") + row("k12", "Dee", "12");
  dt.updateDataTable(root, { total: 12, page: 2, sort: "price", dir: "desc", trashed: "all" });
  assert.deepEqual(names(), ["Cid", "Dee"]);
  assert.equal(root.querySelector("[data-oc-summary]").textContent, "Showing 11–12 of 12");
  assert.equal(root.querySelector('th[data-oc-col="price"]').getAttribute("aria-sort"), "descending");
  assert.equal(root.querySelector('th[data-oc-col="name"]').hasAttribute("aria-sort"), false);
  assert.equal(root.querySelector('[data-oc-filter="all"]').getAttribute("aria-current"), "true");
  assert.equal(root.querySelector('[data-oc-filter="active"]').hasAttribute("aria-current"), false);
  assert.equal(root.querySelector("[data-oc-selected-count]").textContent, "1 selected", "selection over pages");
  assert.deepEqual(dt.getDataTableSelection(root), ["k1"]);
  dt.setDataTableSelection(root, ["k1", "k12"]);
  assert.equal(root.querySelector('[data-oc-key="k12"] [data-oc-select]').checked, true);
  assert.equal(root.querySelector("[data-oc-selected-count]").textContent, "2 selected");
  host.remove();
});

test("select all picks the rows of this page and keeps the others", () => {
  const { host, root } = table();
  dt.setDataTableSelection(root, ["elsewhere"]);
  const all = root.querySelector("[data-oc-select-all]");
  all.checked = true;
  change(all);
  assert.deepEqual(dt.getDataTableSelection(root).sort(), ["elsewhere", "k1", "k2", "k3"]);
  host.remove();
});

test("loading hides the empty text; no rows after loading shows it", () => {
  const { host, root } = table("", 'data-oc-server="true" data-oc-total="0" aria-busy="true"');
  assert.ok(root.querySelector(".oc-data-table-empty").hidden, "no empty text while loading");
  dt.updateDataTable(root, { loading: false, total: 0 });
  assert.equal(root.hasAttribute("aria-busy"), false);
  assert.ok(!root.querySelector(".oc-data-table-empty").hidden);
  assert.equal(root.querySelector("[data-oc-summary]").textContent, "Showing 0–0 of 0");
  host.remove();
});

test("column chooser checkboxes fire oc-datatable-columns", () => {
  const { host, root } = table();
  const got = [];
  root.addEventListener("oc-datatable-columns", (e) => got.push(e.detail));
  const box = root.querySelector('[data-oc-visible-col="price"]');
  box.checked = false;
  change(box);
  assert.deepEqual(got, [{ visible: ["name"], key: "price", checked: false }]);
  host.remove();
});

test("a stored page size does not override the server page size", () => {
  localStorage.setItem("oc-data-table:srv:pageSize", "20");
  const host = mount(TABLE(row("k1", "Ann", "1")));
  const root = host.querySelector(".oc-data-table");
  dt.bindDataTable(root);
  assert.equal(root.querySelector("[data-oc-page-size]").value, "10");
  host.remove();
});

/* ------------------------------------------------------------------ CSS parts */

test("sidebar provider and server table CSS parts", async () => {
  const sb = await read("parts/app-sidebar-provider.css");
  for (const cls of [".oc-sidebar-provider", ".oc-sidebar-inset", ".oc-sidebar-rail", ".oc-sidebar-menu-action", ".oc-sidebar-menu-action--hover", ".oc-sidebar[data-module]"]) {
    assert.ok(sb.includes(cls), cls);
  }
  assert.match(sb, /var\(--oc-module-soft, color-mix\(in oklab, var\(--oc-module, var\(--oc-primary\)\)/);
  const srv = await read("parts/app-data-table-server.css");
  for (const cls of [".oc-data-table-skeleton", ".oc-data-table-skeleton-bar", ".oc-data-table-colpick", '.oc-block-datatable[aria-busy="true"] .oc-data-table-skeleton-body']) {
    assert.ok(srv.includes(cls), cls);
  }
  assert.doesNotMatch(sb + srv, /gradient|glow/i, "flat, no gradients");
  assert.doesNotMatch(sb + srv, /content:\s*"[^"]*[^\x00-\x7F]/, "no raw non-ASCII in content");
});
