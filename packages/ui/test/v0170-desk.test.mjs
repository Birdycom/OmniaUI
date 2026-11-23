// File: packages/ui/test/v0170-desk.test.mjs
// Map: back-link.js (same-site history -> history.back(), else the fallback href + label; modifier clicks; wiring) ->
//      scrollbar tokens (defaults = the old look) -> badge with an icon -> form section dense

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");

/** A jsdom page with a back link; `referrer` and extra history entries decide whether going back stays on the site. */
async function page({ referrer = "", entries = 1, label = true } = {}) {
  const { JSDOM } = await import("jsdom");
  const html = `<a class="oc-back-link" href="/products" data-oc-back${label ? ' data-oc-fallback-label="Back to Products"' : ""}>Back</a>`;
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "https://example.test/products/1", referrer: referrer || undefined });
  const { window } = dom;
  for (let i = 1; i < entries; i++) window.history.pushState({}, "", `/products/1?v=${i}`);
  let backs = 0;
  window.history.back = () => { backs++; };
  const link = window.document.querySelector("a");
  // jsdom cannot navigate: note whether the script stopped the click, then stop it anyway. Returns true when the link
  // would have been followed (like dispatchEvent).
  let followed = true;
  window.addEventListener("click", (e) => { followed = !e.defaultPrevented; e.preventDefault(); });
  const click = (init = {}) => {
    link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }));
    return followed;
  };
  return { window, doc: window.document, link, click, backs: () => backs };
}

test("back-link.js: canGoBack follows a same-origin referrer or more than one history entry", async () => {
  const { canGoBack } = await import("../src/back-link.js");
  assert.equal(canGoBack((await page({ referrer: "https://example.test/products?page=2" })).window), true);
  assert.equal(canGoBack((await page({ referrer: "https://elsewhere.example/" })).window), false);
  assert.equal(canGoBack((await page()).window), false);
  assert.equal(canGoBack((await page({ entries: 2 })).window), true);
  assert.equal(canGoBack(undefined), false);
});

test("back-link.js: a click goes back within the site; a modifier click is left alone", async () => {
  const { initBackLinks } = await import("../src/back-link.js");
  const p = await page({ referrer: "https://example.test/products?page=2" });
  initBackLinks(p.doc);
  assert.equal(p.link.textContent, "Back");
  assert.equal(p.click(), false); // default prevented
  assert.equal(p.backs(), 1);
  assert.equal(p.click({ ctrlKey: true }), true);
  assert.equal(p.click({ button: 1 }), true);
  assert.equal(p.backs(), 1);
  initBackLinks(p.doc); // bound once
  p.click();
  assert.equal(p.backs(), 2);
});

test("back-link.js: without history it follows the fallback href and shows the fallback label", async () => {
  const { initBackLinks } = await import("../src/back-link.js");
  const p = await page({ referrer: "https://elsewhere.example/" });
  initBackLinks(p.doc);
  assert.equal(p.link.textContent, "Back to Products");
  assert.equal(p.click(), true);
  assert.equal(p.backs(), 0);
  const q = await page({ label: false });
  initBackLinks(q.doc);
  assert.equal(q.link.textContent, "Back");
});

test("back-link.js: shipped like the other scripts (site copy, copy-js, package export, types)", async () => {
  const root = path.resolve(here, "../../..");
  const build = await fs.readFile(path.join(root, "scripts/build-packages.mjs"), "utf8");
  assert.match(build, /packages\/ui\/src\/back-link\.js"\), r\("public\/js\/oc-back-link\.js"\)/);
  const copy = await fs.readFile(path.join(root, "packages/ui/bin/lib/copy-js.mjs"), "utf8");
  assert.match(copy, /"dist\/back-link\.js", "oc-back-link\.js"/);
  const pkg = JSON.parse(await fs.readFile(path.join(root, "packages/ui/package.json"), "utf8"));
  assert.equal(pkg.exports["./back-link.js"], "./dist/back-link.js");
  await fs.access(path.resolve(here, "../src/back-link.d.ts"));
});

test("scrollbar: the four tokens drive the bar, with the old look as default", async () => {
  const css = await read("components.css");
  const start = css.indexOf("SCROLLBAR COMPONENT");
  const part = css.slice(start, css.indexOf(".oc-swatch {", start));
  assert.match(part, /\.oc-scrollbar::-webkit-scrollbar \{ width: var\(--oc-scrollbar-size, 8px\); height: var\(--oc-scrollbar-size, 8px\); \}/);
  assert.match(part, /\.oc-scrollbar--thin::-webkit-scrollbar \{ width: var\(--oc-scrollbar-size, 5px\);/);
  assert.match(part, /background: var\(--oc-scrollbar-track, transparent\)/);
  assert.match(part, /background: var\(--oc-scrollbar-thumb, var\(--oc-muted, oklch\(from var\(--color-gray-30\) l c h \/ 0\.3\)\)\)/);
  assert.match(part, /background: var\(--oc-scrollbar-thumb-hover, var\(--oc-muted-foreground, oklch\(from var\(--color-gray-30\) l c h \/ 0\.5\)\)\)/);
  assert.match(part, /scrollbar-color: var\(--oc-scrollbar-thumb, [^;]+\) var\(--oc-scrollbar-track, transparent\);/);
  // Tokens are read with a fallback, never set on .oc-scrollbar itself, so a parent or :root can set them.
  assert.doesNotMatch(part, /--oc-scrollbar-[a-z-]+:\s*[^,)]+;/);
});

test("badge: a webicon before the text gets a gap and never shrinks; form section: dense modifier", async () => {
  const css = await read("components.css");
  assert.match(css, /\.oc-badge > :is\(svg, iconify-icon\) \{ flex-shrink: 0; inline-size: 1em; block-size: 1em; \}/);
  assert.match(css, /\.oc-badge:has\(> :is\(svg, iconify-icon\)\) \{ gap: 0\.25rem; \}/);
  const fs2 = await read("parts/forms-form-section.css");
  assert.match(fs2, /\.oc-form-section--dense > \.oc-form-section__summary \{[^}]*padding: 0\.5rem 0\.75rem/);
  assert.match(fs2, /\.oc-form-section--dense > \.oc-form-section__body \{[^}]*padding: 0\.75rem/);
});
