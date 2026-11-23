// File: packages/ui/test/v0170-glass.test.mjs
// Map: glass of 0.17.0 -> recipe on ::after (see-through fill, inset light only, frosted 12px + saturate 160%) -> lens hook
//      ([data-oc-lens], var(--oc-glass-lens)) -> tokens other parts use -> --clear/--frost/--strong (grain only on --frost)
//      -> no backdrop-filter fallback -> reduced transparency solid (also with the lens) -> Firefox -> bar divider ->
//      glass-lens.js (map, filter per size, cache, resize, no-lens outside Chromium, skips flat / Pro / off) -> text on
//      glass (fg tokens) -> drag (pointer, clamp, interactive children, keyboard, labels, lens unchanged, CSS) -> Pro
//      contract (classes and tokens Pro uses, no shared names, never a second lens) -> wiring

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = async (f) => (await fs.readFile(path.resolve(here, "../src", f), "utf8")).replace(/\r\n/g, "\n");
/** The rule that starts with `selector {`, up to its closing brace at the start of a line. */
const block = (css, selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `missing ${selector}`);
  return css.slice(at, css.indexOf("\n}", at));
};
/** Light and dark alpha of a sheet token: light-dark(oklch(<white or from var(--oc-background) l c h> / a), oklch(… / b)). */
const alpha = (css, token) => {
  const tint = "oklch\\((?:100% 0 0deg|from var\\(--oc-background\\) l c h) / ([\\d.]+)\\)";
  const m = css.match(new RegExp(`${token}: light-dark\\(${tint}, ${tint}\\)`));
  assert.ok(m, `missing ${token}`);
  return [Number(m[1]), Number(m[2])];
};

test("glass: the recipe: see-through white fill, thickness from inset light only, frosted 12px + saturate 160% without lens", async () => {
  const css = await read("parts/media-glass.css");
  const sheet = block(css, ".oc-glass::after");
  assert.match(sheet, /backdrop-filter: blur\(var\(--oc-glass-blur\)\) saturate\(160%\);/);
  assert.match(sheet, /background: var\(--oc-glass-sheet\);/);
  assert.match(sheet, /inset 0 1\.5px 0 var\(--oc-glass-edge-hi\)/);
  assert.match(sheet, /inset 0 -1px 0 var\(--oc-glass-edge-low\)/);
  assert.match(sheet, /inset 0 0 22px var\(--oc-glass-glow\)/);
  // only inset shadows on the filtered layer: an outer shadow there shifts the lens map in Chrome
  for (const shadow of sheet.match(/box-shadow:[^;]+;/)[0].split(/,\n/)) assert.match(shadow, /inset/);
  assert.doesNotMatch(sheet, /feTurbulence/);
  assert.match(css, /--oc-glass-sheet: light-dark\(oklch\(100% 0 0deg \/ 0\.12\), /);
  assert.match(css, /--oc-glass-edge: light-dark\(oklch\(100% 0 0deg \/ 0\.35\), /);
  assert.match(css, /--oc-glass-edge-hi: light-dark\(oklch\(100% 0 0deg \/ 0\.65\), /);
  assert.match(css, /--oc-glass-blur: 12px;/);
  assert.match(css, /--oc-glass-lens-blur: 2px;/);
  assert.match(css, /--oc-glass-radius: 28px;/);
  // the panel inside is never denser than the sheet
  const [light] = alpha(css, "--oc-glass-sheet");
  const panel = css.match(/--oc-glass-panel: light-dark\(oklch\(100% 0 0deg \/ ([\d.]+)\)/);
  assert.ok(Number(panel[1]) <= light);
  // the drop shadow stays on the sheet, not on the layer with the filter; no specular rim any more
  assert.match(block(css, ".oc-glass"), /box-shadow: var\(--oc-glass-shadow\);/);
  assert.doesNotMatch(css, /\.oc-glass:not\(\.oc-glass--liquid, \.oc-glass--flat\)::before/);
});

test("glass: the lens hook: [data-oc-lens] swaps the blur for the SVG filter, html.oc-no-lens keeps frosted glass", async () => {
  const css = await read("parts/media-glass.css");
  assert.match(block(css, ":is(.oc-glass, .oc-glass-bar)[data-oc-lens]::after"), /backdrop-filter: var\(--oc-glass-lens\) blur\(var\(--oc-glass-lens-blur\)\) saturate\(160%\);/);
  assert.match(css, /\.oc-no-lens :is\(\.oc-glass, \.oc-glass-bar\)\[data-oc-lens\]::after \{ backdrop-filter: blur\(var\(--oc-glass-blur\)\) saturate\(160%\); \}/);
  // flat comes after the lens rule with the same weight: never a lens on a desktop window
  assert.ok(css.indexOf(".oc-glass.oc-glass--flat::after { backdrop-filter: none; }") > css.indexOf("[data-oc-lens]::after {"));
});

test("glass: tokens other parts use still exist", async () => {
  const css = await read("parts/media-glass.css");
  for (const t of ["sheet", "sheen", "glow", "panel", "panel-strong", "edge", "edge-hi", "edge-low", "hairline", "shadow", "panel-shadow", "blur", "lens-blur", "radius", "panel-radius"]) {
    assert.match(css, new RegExp(`--oc-glass-${t}: `), `--oc-glass-${t}`);
  }
});

test("glass: --clear is clearer, --frost and --strong are denser than the default", async () => {
  const css = await read("parts/media-glass.css");
  const opts = await read("parts/media-glass-options.css");
  const [light] = alpha(css, "--oc-glass-sheet");
  const clearRule = block(opts, ":is(.oc-glass, .oc-glass-bar).oc-glass--clear");
  const frostRule = block(opts, ":is(.oc-glass, .oc-glass-bar).oc-glass--frost");
  const [clear] = alpha(clearRule, "--oc-glass-sheet");
  const [frost] = alpha(frostRule, "--oc-glass-sheet");
  const [strong] = alpha(css.slice(css.indexOf(".oc-glass.oc-glass--strong {")), "--oc-glass-sheet");
  assert.ok(clear < light && light < frost && light < strong);
  assert.match(clearRule, /--oc-glass-blur: [1-6]px;/);
  assert.match(clearRule, /--oc-glass-lens-blur: 0px;/);
  assert.match(frostRule, /--oc-glass-lens-blur: 12px;/);
  // frosted glass carries the fine grain, and drops it with reduced transparency
  assert.match(block(opts, ".oc-glass.oc-glass--frost::after"), /feTurbulence/);
  assert.match(opts, /@media \(prefers-reduced-transparency: reduce\) \{\n {2}\.oc-glass\.oc-glass--frost::after \{ background-image: none; \}/);
});

test("glass: without backdrop-filter the sheet turns nearly solid, also with --clear/--frost/--strong", async () => {
  const css = await read("parts/media-glass.css");
  const fallback = block(css, "@supports not (backdrop-filter: blur(1px))");
  const [light, dark] = alpha(fallback, "--oc-glass-sheet");
  assert.ok(light >= 0.8 && dark >= 0.8);
  assert.match(fallback, /\.oc-glass\.oc-glass--clear,\s*\.oc-glass\.oc-glass--frost,\s*\.oc-glass\.oc-glass--strong \{/);
});

test("glass: reduce transparency gives solid surfaces and no blur or lens", async () => {
  const css = await read("parts/media-glass.css");
  const rt = block(css, "@media (prefers-reduced-transparency: reduce)");
  assert.match(rt, /\.oc-glass\.oc-glass--clear,\s*\.oc-glass\.oc-glass--frost,\s*\.oc-glass\.oc-glass--strong \{/);
  assert.match(rt, /--oc-glass-sheet: var\(--oc-background\);/);
  assert.match(rt, /\.oc-glass::after,\n {2}:is\(\.oc-glass, \.oc-glass-bar\)\[data-oc-lens\]::after \{ backdrop-filter: none; background-image: none; \}/);
});

test("glass: Firefox puts the frosted filter on the sheet, --flat keeps none", async () => {
  const css = await read("parts/media-glass.css");
  const ff = block(css, "@supports (-moz-appearance: none)");
  assert.match(ff, /\.oc-glass \{ backdrop-filter: blur\(var\(--oc-glass-blur\)\) saturate\(160%\); \}/);
  assert.match(ff, /\.oc-glass--flat \{ backdrop-filter: none; \}/);
});

test("glass bar: a divider between groups", async () => {
  const css = await read("parts/media-glass-liquid.css");
  assert.match(css, /\.oc-glass-bar__sep \{ align-self: stretch; inline-size: 1px;/);
});

// ---- glass-lens.js -------------------------------------------------------------------------------------------------

/** A jsdom page; `chromium` decides navigator.userAgentData. Sizes are set per element (jsdom has no layout). */
async function page(html, { chromium = true } = {}) {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, { url: "https://example.test/" });
  const { window } = dom;
  Object.defineProperty(window.navigator, "userAgentData", {
    configurable: true,
    value: chromium ? { brands: [{ brand: "Chromium", version: "142" }, { brand: "Google Chrome", version: "142" }] } : undefined,
  });
  const observers = [];
  window.ResizeObserver = class {
    constructor(cb) { this.cb = cb; this.els = new Set(); observers.push(this); }
    observe(el) { this.els.add(el); }
    unobserve(el) { this.els.delete(el); }
    disconnect() { this.els.clear(); }
  };
  const size = (el, w, h) => {
    Object.defineProperty(el, "clientWidth", { configurable: true, value: w });
    Object.defineProperty(el, "clientHeight", { configurable: true, value: h });
  };
  const resize = (el, w, h) => {
    size(el, w, h);
    for (const o of observers) if (o.els.has(el)) o.cb([{ target: el }]);
  };
  return { dom, doc: window.document, size, resize };
}

test("glass-lens.js: full scale from a short side of 160px, proportionally less below", async () => {
  const { lensScale } = await import("../src/glass-lens.js");
  assert.equal(lensScale(320, 180), -80);
  assert.equal(lensScale(400, 160), -80);
  assert.equal(lensScale(300, 52), -26);
  assert.equal(lensScale(300, 52, -40), -13);
});

test("glass-lens.js: Chromium check by userAgentData brands", async () => {
  const { supportsGlassLens } = await import("../src/glass-lens.js");
  assert.equal(supportsGlassLens({ userAgentData: { brands: [{ brand: "Chromium" }, { brand: "Microsoft Edge" }] } }), true);
  assert.equal(supportsGlassLens({ userAgentData: { brands: [{ brand: "Not A Brand" }] } }), false);
  assert.equal(supportsGlassLens({}), false);
  assert.equal(supportsGlassLens(undefined), false);
});

test("glass-lens.js: the map has the size of the sheet, red left to right, blue top to bottom (screen), a blurred purple middle", async () => {
  const { lensMap } = await import("../src/glass-lens.js");
  const svg = decodeURIComponent(lensMap(320, 180).replace("data:image/svg+xml,", ""));
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="320" height="180" viewBox="0 0 320 180">/);
  assert.match(svg, /<linearGradient id="x" x2="1" y2="0"><stop offset="0" stop-color="#000"\/><stop offset="1" stop-color="#f00"\/>/);
  assert.match(svg, /<linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#000"\/><stop offset="1" stop-color="#00f"\/>/);
  assert.match(svg, /fill="url\(#y\)" style="mix-blend-mode:screen"/);
  assert.match(svg, /<rect x="26" y="26" width="268" height="128" rx="[\d.]+" fill="#800080" filter="url\(#b\)"\/>/);
  assert.match(svg, /<feGaussianBlur stdDeviation="14"\/>/);
  // a thin bar keeps a neutral middle: the edge shrinks with the sheet
  const bar = decodeURIComponent(lensMap(300, 50).replace("data:image/svg+xml,", ""));
  assert.match(bar, /<rect x="15" y="15" width="270" height="20"/);
});

test("glass-lens.js: one filter per size with the exact width and height, shared and counted, gone when unused", async () => {
  const { bindGlassLens, lensCount } = await import("../src/glass-lens.js");
  const { doc, size, resize } = await page(`<div class="oc-glass" id="a"></div><div class="oc-glass" id="b"></div><nav class="oc-glass-bar" id="c"></nav>`);
  const [a, b, c] = ["a", "b", "c"].map((id) => doc.getElementById(id));
  size(a, 320, 180); size(b, 320, 180); size(c, 300, 52);
  const before = lensCount();
  const stops = [a, b, c].map((el) => bindGlassLens(el));
  const filters = doc.querySelectorAll("#oc-lens-defs filter");
  assert.equal(filters.length, 2, "two sizes, two filters");
  assert.equal(lensCount() - before, 2);
  const f = doc.getElementById("oc-lens-320x180");
  assert.equal(f.getAttribute("x"), "0");
  assert.equal(f.getAttribute("y"), "0");
  assert.equal(f.getAttribute("color-interpolation-filters"), "sRGB");
  const img = f.querySelector("feImage");
  assert.equal(img.getAttribute("width"), "320");
  assert.equal(img.getAttribute("height"), "180");
  assert.equal(img.getAttribute("result"), "map");
  assert.match(img.getAttribute("href"), /^data:image\/svg\+xml,/);
  const move = f.querySelector("feDisplacementMap");
  assert.deepEqual(["in", "in2", "scale", "xChannelSelector", "yChannelSelector"].map((k) => move.getAttribute(k)), ["SourceGraphic", "map", "-80", "R", "B"]);
  assert.equal(a.style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-320x180)");
  assert.equal(a.dataset.ocLens, "320x180");
  assert.equal(c.style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-300x52)");
  const svg = doc.getElementById("oc-lens-defs");
  assert.equal(svg.getAttribute("aria-hidden"), "true");
  assert.equal(svg.getAttribute("width"), "0");

  // a new size: a new filter; the old one stays while b still uses it
  resize(a, 400, 180);
  assert.equal(a.style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-400x180)");
  assert.ok(doc.getElementById("oc-lens-320x180"));
  stops[1]();
  assert.equal(doc.getElementById("oc-lens-320x180"), null, "unused filter removed");
  assert.equal(b.hasAttribute("data-oc-lens"), false);
  assert.equal(b.style.getPropertyValue("--oc-glass-lens"), "");
  // binding twice does nothing
  bindGlassLens(a);
  assert.equal(doc.querySelectorAll("#oc-lens-defs filter").length, 2);
  stops[0](); stops[2]();
  assert.equal(doc.querySelectorAll("#oc-lens-defs filter").length, 0);
  assert.equal(lensCount(), before);
});

test("glass-lens.js: many sheets of one size make one filter; sizes are rounded", async () => {
  const { initGlassLens } = await import("../src/glass-lens.js");
  const { doc, size } = await page(Array.from({ length: 40 }, () => `<div class="oc-glass"></div>`).join(""));
  for (const el of doc.querySelectorAll(".oc-glass")) size(el, 240.4, 120.6);
  const stops = initGlassLens(doc);
  assert.equal(stops.length, 40);
  assert.equal(doc.querySelectorAll("#oc-lens-defs filter").length, 1);
  assert.ok(doc.getElementById("oc-lens-240x121"));
  stops.forEach((s) => s());
});

test("glass-lens.js: outside Chromium only html.oc-no-lens, no filter", async () => {
  const { initGlassLens } = await import("../src/glass-lens.js");
  const { doc, size } = await page(`<div class="oc-glass" id="a"></div>`, { chromium: false });
  size(doc.getElementById("a"), 320, 180);
  initGlassLens(doc);
  assert.ok(doc.documentElement.classList.contains("oc-no-lens"));
  assert.equal(doc.getElementById("oc-lens-defs"), null);
  assert.equal(doc.getElementById("a").hasAttribute("data-oc-lens"), false);
});

test("glass-lens.js: skips --flat, Pro's .oc-glass--lens and data-oc-glass-lens=off; a custom scale gets its own filter", async () => {
  const { initGlassLens, LENS_SELECTOR } = await import("../src/glass-lens.js");
  const { doc, size } = await page(`<div class="oc-glass oc-glass--flat" id="flat"></div><div class="oc-glass oc-glass--liquid oc-glass--lens" id="pro"></div>
    <div class="oc-glass" data-oc-glass-lens="off" id="off"></div><div class="oc-glass" data-oc-glass-lens-scale="-40" id="soft"></div><div class="my-panel" data-oc-glass-lens id="own"></div>`);
  for (const el of doc.querySelectorAll("div")) size(el, 200, 100);
  const stops = initGlassLens(doc);
  for (const id of ["flat", "pro", "off"]) assert.equal(doc.getElementById(id).hasAttribute("data-oc-lens"), false, id);
  assert.equal(doc.getElementById("soft").style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-200x100-sm40)");
  assert.equal(doc.getElementById("own").style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-200x100)");
  // the short side is 100px: 100/160 of the asked scale
  assert.equal(doc.querySelector("#oc-lens-200x100-sm40 feDisplacementMap").getAttribute("scale"), "-25");
  assert.equal(doc.querySelector("#oc-lens-200x100 feDisplacementMap").getAttribute("scale"), "-50");
  // Pro's filter id is never used by the free lens
  assert.equal(doc.getElementById("oc-glass-lens"), null);
  assert.match(LENS_SELECTOR, /\.oc-glass--lens/);
  stops.forEach((s) => s());
});

// ---- text on glass (contrast) --------------------------------------------------------------------------------------

test("glass: text tokens: muted text on a sheet is closer to the foreground (AA over a backdrop), the bar text denser", async () => {
  const css = await read("parts/media-glass.css");
  assert.match(css, /--oc-glass-fg: var\(--oc-foreground\);/);
  assert.match(css, /--oc-glass-fg-muted: light-dark\(color-mix\(in oklch, var\(--oc-foreground\) 70%, var\(--oc-muted-foreground\)\), color-mix\(in oklch, var\(--oc-foreground\) 55%, var\(--oc-muted-foreground\)\)\);/);
  const sheet = block(css, ".oc-glass");
  assert.match(sheet, /color: var\(--oc-glass-fg\);/);
  assert.match(sheet, /--oc-muted-foreground: var\(--oc-glass-fg-muted\);/);
  assert.match(sheet, /--text-soft: var\(--oc-glass-fg-muted\);/);
  // the muted token is defined on :root, never on the sheet (that would be a cycle with --oc-muted-foreground)
  assert.doesNotMatch(sheet, /--oc-glass-fg-muted:/);
  const liquid = await read("parts/media-glass-liquid.css");
  assert.match(block(liquid, ".oc-glass-bar__item"), /color: light-dark\(oklch\(22% 0\.02 260deg \/ 0\.9\), oklch\(100% 0 0deg \/ 0\.9\)\);/);
  assert.match(liquid, /background: light-dark\(oklch\(100% 0 0deg \/ 0\.75\), oklch\(100% 0 0deg \/ 0\.1\)\);/);
});

// ---- drag (data-oc-glass-drag) -------------------------------------------------------------------------------------

/** A stage of 600 x 400 at 0,0 with a 320 x 140 sheet laid out at 140,100; the sheet's box follows its translate. */
async function dragPage(attrs = "", inner = "") {
  const p = await page(`<div id="stage"><div class="oc-glass" data-oc-glass-drag ${attrs} id="card"><strong>City 1</strong>${inner}</div></div>`);
  const { window } = p.dom;
  const stage = p.doc.getElementById("stage");
  const card = p.doc.getElementById("card");
  stage.getBoundingClientRect = () => ({ left: 0, top: 0, right: 600, bottom: 400, width: 600, height: 400, x: 0, y: 0 });
  for (const [k, v] of Object.entries({ clientLeft: 0, clientTop: 0, clientWidth: 600, clientHeight: 400 })) Object.defineProperty(stage, k, { configurable: true, value: v });
  card.getBoundingClientRect = () => {
    const [x = 0, y = 0] = (card.style.translate || "0px 0px").split(" ").map(parseFloat);
    return { left: 140 + x, top: 100 + y, width: 320, height: 140, right: 460 + x, bottom: 240 + y, x: 140 + x, y: 100 + y };
  };
  const fire = (el, type, x, y, extra = {}) => el.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ...extra }));
  const key = (el, k, extra = {}) => el.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));
  return { ...p, window, stage, card, fire, key };
}

test("glass drag: the pointer moves the sheet with translate, clamped inside its area", async () => {
  const { bindGlassDrag } = await import("../src/glass-lens.js");
  const { card, fire } = await dragPage();
  const moves = [];
  card.addEventListener("oc-glass-move", (e) => moves.push(e.detail));
  const stop = bindGlassDrag(card);
  const title = card.querySelector("strong");
  fire(title, "pointerdown", 200, 150);
  assert.ok(card.hasAttribute("data-oc-dragging"));
  fire(card, "pointermove", 250, 180);
  assert.equal(card.style.translate, "50px 30px");
  // far to the top left: stops at the inner edge of the stage
  fire(card, "pointermove", -1000, -1000);
  assert.equal(card.style.translate, "-140px -100px");
  // far to the bottom right
  fire(card, "pointermove", 2000, 2000);
  assert.equal(card.style.translate, "140px 160px");
  fire(card, "pointerup", 2000, 2000);
  assert.equal(card.hasAttribute("data-oc-dragging"), false);
  // after the pointer is up, moving does nothing
  fire(card, "pointermove", 0, 0);
  assert.equal(card.style.translate, "140px 160px");
  assert.deepEqual(moves.at(-1), { x: 140, y: 160 });
  // a new drag starts from where the sheet is
  fire(card, "pointerdown", 300, 300);
  fire(card, "pointermove", 290, 280);
  fire(card, "pointerup", 290, 280);
  assert.equal(card.style.translate, "130px 140px");
  stop();
  assert.equal(card.style.translate, "");
});

test("glass drag: links, buttons and fields inside keep their clicks; other buttons than the main one do nothing", async () => {
  const { bindGlassDrag } = await import("../src/glass-lens.js");
  const { card, fire } = await dragPage("", `<button type="button" id="btn">Refresh</button><a href="#x" id="lnk">More</a>`);
  bindGlassDrag(card);
  for (const id of ["btn", "lnk"]) {
    const ok = fire(card.querySelector(`#${id}`), "pointerdown", 200, 150);
    assert.equal(ok, true, `${id}: default kept`);
    fire(card, "pointermove", 260, 200);
    assert.equal(card.style.translate, "", id);
  }
  fire(card, "pointerdown", 200, 150, { button: 2 });
  fire(card, "pointermove", 260, 200);
  assert.equal(card.style.translate, "");
});

test("glass drag: keyboard: focusable, arrows move 16px (Shift 64px), Home goes back; clamped too", async () => {
  const { bindGlassDrag, DRAG_STEP } = await import("../src/glass-lens.js");
  const { card, key } = await dragPage();
  bindGlassDrag(card);
  assert.equal(DRAG_STEP, 16);
  assert.equal(card.getAttribute("tabindex"), "0");
  assert.equal(card.getAttribute("role"), "group");
  assert.equal(card.getAttribute("aria-roledescription"), "draggable");
  assert.equal(card.getAttribute("aria-label"), "Drag to move");
  assert.equal(key(card, "ArrowRight"), false, "arrow keys do not scroll the page");
  assert.equal(card.style.translate, "16px 0px");
  key(card, "ArrowDown", { shiftKey: true });
  assert.equal(card.style.translate, "16px 64px");
  key(card, "ArrowLeft"); key(card, "ArrowUp");
  assert.equal(card.style.translate, "0px 48px");
  for (let i = 0; i < 20; i++) key(card, "ArrowUp", { shiftKey: true });
  assert.equal(card.style.translate, "0px -100px");
  key(card, "Home");
  assert.equal(card.style.translate, "");
  // other keys and keys in a field inside are left alone
  assert.equal(key(card, "Enter"), true);
});

test("glass drag: keeps the page's own label and role; the area can be set; cleanup removes only what it added", async () => {
  const { bindGlassDrag } = await import("../src/glass-lens.js");
  const { card, stage, fire } = await dragPage(`aria-label="Weather in City 1" role="region"`);
  const stop = bindGlassDrag(card, { label: "Sleep om te verplaatsen" });
  assert.equal(card.getAttribute("aria-label"), "Weather in City 1");
  assert.equal(card.getAttribute("role"), "region");
  assert.equal(card.getAttribute("aria-roledescription"), "draggable");
  // binding twice does nothing
  bindGlassDrag(card);
  fire(card, "pointerdown", 200, 150);
  fire(card, "pointermove", 210, 150);
  fire(card, "pointerup", 210, 150);
  assert.equal(card.style.translate, "10px 0px");
  stop();
  assert.equal(card.getAttribute("aria-label"), "Weather in City 1");
  assert.equal(card.getAttribute("role"), "region");
  assert.equal(card.hasAttribute("aria-roledescription"), false);
  assert.equal(card.hasAttribute("tabindex"), false);
  // data-oc-glass-drag-area: the closest one above the sheet wins over the parent
  stage.setAttribute("data-oc-glass-drag-area", "");
  const { clampGlassDrag } = await import("../src/glass-lens.js");
  assert.deepEqual(clampGlassDrag(card, -999, 999, { x: 0, y: 0 }), [-140, 160]);
});

test("glass drag: moving never changes the size, so the lens filter stays the same; initGlassDrag binds [data-oc-glass-drag] only", async () => {
  const { bindGlassLens, initGlassDrag, DRAG_SELECTOR } = await import("../src/glass-lens.js");
  const { card, doc, size, fire } = await dragPage();
  size(card, 320, 140);
  const stopLens = bindGlassLens(card);
  const plain = doc.createElement("div");
  plain.className = "oc-glass";
  doc.getElementById("stage").append(plain);
  assert.equal(DRAG_SELECTOR, "[data-oc-glass-drag]");
  const stops = initGlassDrag(doc);
  assert.equal(stops.length, 1);
  assert.equal(plain.hasAttribute("tabindex"), false);
  const before = [card.dataset.ocLens, doc.querySelectorAll("#oc-lens-defs filter").length];
  fire(card, "pointerdown", 200, 150);
  fire(card, "pointermove", 300, 250);
  fire(card, "pointerup", 300, 250);
  assert.equal(card.style.translate, "100px 100px");
  assert.deepEqual([card.dataset.ocLens, doc.querySelectorAll("#oc-lens-defs filter").length], before);
  assert.equal(card.style.getPropertyValue("--oc-glass-lens"), "url(#oc-lens-320x140)");
  stops.forEach((s) => s());
  stopLens();
});

test("glass drag: CSS: no page scroll under a finger, grab cursor, glide only for keys and never with reduced motion", async () => {
  const css = await read("parts/media-glass-options.css");
  assert.match(css, /\[data-oc-glass-drag\] \{ touch-action: none; cursor: grab; transition: translate 0\.15s ease-out; \}/);
  assert.match(css, /\[data-oc-glass-drag\]\[data-oc-dragging\] \{ cursor: grabbing; user-select: none; transition: none; \}/);
  assert.match(css, /\[data-oc-glass-drag\]:focus-visible \{ outline: 2px solid var\(--oc-ring\);/);
  assert.match(css, /\[data-oc-glass-drag\]\[data-oc-pointer\]:focus-visible \{ outline: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\n {2}\[data-oc-glass-drag\] \{ transition: none; \}/);
  // the auto-start makes sheets draggable in every browser, the lens only in Chromium
  const js = await read("glass-lens.js");
  assert.match(js, /else initGlassLens\(document\);\n\s+initGlassDrag\(document\);/);
});

// ---- OmniaUI Pro contract -------------------------------------------------------------------------------------------
// Pro's glass navigation block (omniaUI-pro: parts/site-glass-nav.css, blocks/glass-nav.html and the React/Vue/Blade
// versions) builds on the free glass: .oc-glass--liquid, --clear, .oc-glass-bar(--light, __item), .oc-glass-stage and
// --oc-liquid-blur, plus its own lens: .oc-glass--lens with backdrop-filter: url("#oc-glass-lens") on the element and a
// <svg class="oc-glass-defs"> holding #oc-glass-lens. Pro's pro.css loads after the free CSS.

const PRO_CLASSES = ["oc-glass", "oc-glass--liquid", "oc-glass--clear", "oc-glass-bar", "oc-glass-bar--light", "oc-glass-bar__item", "oc-glass-stage"];

test("glass + Pro: the free classes and tokens Pro builds on still exist", async () => {
  const all = (await Promise.all(["parts/media-glass.css", "parts/media-glass-liquid.css", "parts/media-glass-options.css"].map(read))).join("\n");
  for (const c of PRO_CLASSES) assert.match(all, new RegExp(`\\.${c.replace(/-/g, "\\-")}[\\s,.:{\\[)]`), c);
  assert.match(all, /--oc-liquid-blur: /);
});

test("glass + Pro: the free glass never takes Pro's names, nor puts a filter on the element itself (outside Firefox)", async () => {
  const css = (await Promise.all(["parts/media-glass.css", "parts/media-glass-liquid.css", "parts/media-glass-options.css"].map(read))).join("\n");
  const js = await read("glass-lens.js");
  // Pro owns .oc-glass--lens, .oc-glass-defs and #oc-glass-lens; the free lens uses #oc-lens-defs / #oc-lens-WxH
  assert.doesNotMatch(css, /\.oc-glass--lens|\.oc-glass-defs|#oc-glass-lens/);
  // ("oc-glass-lens" is only the script's own file name, for the auto-start)
  assert.doesNotMatch(js.replace('url.includes("oc-glass-lens")', ""), /"oc-glass-lens"|oc-glass-defs/);
  assert.match(js, /const DEFS_ID = "oc-lens-defs";/);
  assert.match(js, /return `oc-lens-\$\{w\}x\$\{h\}/);
  // the free filter sits on ::after; on the element only inside the Firefox block, which Pro's @supports excludes
  const outsideFirefox = css.replace(/@supports \(-moz-appearance: none\) \{[\s\S]*?\n\}/g, "");
  for (const rule of outsideFirefox.match(/[^{}]+\{[^{}]*backdrop-filter:[^}]*\}/g) ?? []) {
    const selector = rule.slice(0, rule.indexOf("{")).trim().split("\n").at(-1);
    if (/none/.test(rule.slice(rule.indexOf("{")))) continue;
    assert.match(selector, /::after/, `backdrop-filter outside ::after: ${selector}`);
  }
});

test("glass + Pro: the free script never binds Pro's .oc-glass--lens, so there is never a second lens on it", async () => {
  const { initGlassLens, initGlassDrag } = await import("../src/glass-lens.js");
  const { doc, size } = await page(`<section class="oc-glass-stage oc-block-glass-nav"><svg class="oc-glass-defs" aria-hidden="true"><filter id="oc-glass-lens"></filter></svg>
    <div class="oc-glass oc-glass--liquid oc-glass--clear oc-glass--lens" id="sheet">
      <div class="oc-glass-bar oc-glass-bar--light oc-glass--lens" id="action"></div>
      <nav class="oc-glass-bar oc-glass-bar--light oc-glass--lens" id="bar"></nav>
    </div></section>`);
  for (const id of ["sheet", "action", "bar"]) size(doc.getElementById(id), 300, 120);
  const stops = [...initGlassLens(doc), ...initGlassDrag(doc)];
  for (const id of ["sheet", "action", "bar"]) {
    const el = doc.getElementById(id);
    assert.equal(el.hasAttribute("data-oc-lens"), false, id);
    assert.equal(el.style.getPropertyValue("--oc-glass-lens"), "", id);
    assert.equal(el.hasAttribute("tabindex"), false, `${id}: not draggable unless asked`);
  }
  assert.equal(doc.getElementById("oc-lens-defs"), null, "no free filters for Pro sheets");
  assert.equal(doc.querySelectorAll("#oc-glass-lens").length, 1);
  stops.forEach((s) => s());
});

test("glass + Pro: Pro's own glass CSS and blocks only use free classes and tokens that exist (when the Pro repo is next to this one)", async (t) => {
  const pro = path.resolve(here, "../../../../omniaUI-pro");
  const files = ["packages/pro/src/parts/site-glass-nav.css", "packages/pro/blocks/glass-nav.html"].map((f) => path.join(pro, f));
  try { await fs.access(files[0]); } catch { t.skip("omniaUI-pro not checked out next to omniaUI"); return; }
  const free = (await Promise.all(["parts/media-glass.css", "parts/media-glass-liquid.css", "parts/media-glass-options.css"].map(read))).join("\n");
  const text = (await Promise.all(files.map((f) => fs.readFile(f, "utf8")))).join("\n");
  const own = new Set(["oc-glass--lens", "oc-glass-defs", "oc-glass-lens", "oc-glass-nav"]);
  for (const c of new Set(text.match(/oc-glass[\w-]*/g))) {
    if (own.has(c)) continue;
    assert.match(free, new RegExp(`\\.${c}[\\s,.:{\\[)]`), `Pro uses .${c}`);
  }
  for (const v of new Set(text.match(/var\(--oc-(?:glass|liquid)[\w-]*/g))) assert.match(free, new RegExp(`${v.slice(4)}: `), `Pro uses ${v.slice(4)}`);
  // Pro's lens stays on the element with its own filter id
  assert.match(text, /:is\(\.oc-glass, \.oc-glass-bar\)\.oc-glass--lens \{\s*backdrop-filter: url\("#oc-glass-lens"\)/);
});

test("glass-lens.js: shipped like the other scripts (site copy, copy-js, package export, types)", async () => {
  const root = path.resolve(here, "../../..");
  const build = await fs.readFile(path.join(root, "scripts/build-packages.mjs"), "utf8");
  assert.match(build, /packages\/ui\/src\/glass-lens\.js"\), r\("public\/js\/oc-glass-lens\.js"\)/);
  const copy = await fs.readFile(path.join(root, "packages/ui/bin/lib/copy-js.mjs"), "utf8");
  assert.match(copy, /"dist\/glass-lens\.js", "oc-glass-lens\.js"/);
  const pkg = JSON.parse(await fs.readFile(path.join(root, "packages/ui/package.json"), "utf8"));
  assert.equal(pkg.exports["./glass-lens.js"], "./dist/glass-lens.js");
  await fs.access(path.resolve(here, "../src/glass-lens.d.ts"));
});
