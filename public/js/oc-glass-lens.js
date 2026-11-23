// File: packages/ui/src/glass-lens.js
// Map: browser check (Chromium only) -> displacement map (SVG data URI, size of the sheet) -> filter store (one hidden
//      <svg>, one <filter> per size, counted) -> bind one sheet (ResizeObserver, --oc-glass-lens, data-oc-lens) ->
//      init every sheet -> drag (optional: data-oc-glass-drag, pointer + keyboard, clamped to its area) -> boot
// The lens of the glass (.oc-glass, .oc-glass-bar; parts/media-glass.css): the backdrop stays sharp and bends at the
// edge, as through a thick piece of glass. Recipe: a map the exact size of the sheet with red running left to right and
// blue top to bottom (screen-blended), and a blurred purple (half red, half blue = no shift) rectangle over the middle,
// so only the edge moves; an SVG filter feImage + feDisplacementMap reads it, backdrop-filter: url(#…) applies it.
// Only Chromium (Chrome, Edge, Opera, Electron) applies url() in backdrop-filter. Elsewhere the script adds
// html.oc-no-lens and does nothing else: the CSS keeps frosted glass (blur 12px, saturate 160%), as without the script.
// Skips .oc-glass--flat, Pro's .oc-glass--lens (its own #oc-glass-lens filter) and [data-oc-glass-lens="off"].
// Per sheet: data-oc-glass-lens-scale="-80" (stronger with a bigger number, the minus sign turns the direction); a sheet
// with a short side under 160px gets a proportionally smaller scale (lensScale).

const NS = "http://www.w3.org/2000/svg";
const DEFS_ID = "oc-lens-defs";
export const LENS_SCALE = -80;
/** Sheets the auto-start (and initGlassLens) gives a lens. */
/** Never a lens: a desktop window (the OS draws the blur), Pro's own lens, or switched off. */
const SKIP = ".oc-glass--flat, .oc-glass--lens, [data-oc-glass-lens=\"off\"]";
export const LENS_SELECTOR = `:is(.oc-glass, .oc-glass-bar, [data-oc-glass-lens]):not(${SKIP})`;

/** True in Chromium browsers, the only ones that apply an SVG filter in backdrop-filter. */
export function supportsGlassLens(nav = typeof navigator === "undefined" ? undefined : navigator) {
  const brands = nav?.userAgentData?.brands;
  return Array.isArray(brands) && brands.some((b) => /Chromium/i.test(b.brand));
}

/** Width of the bending edge for a sheet of w x h (26px, less on a small sheet such as a bar). */
const edgeOf = (w, h) => Math.max(4, Math.min(26, Math.round(Math.min(w, h) * 0.3)));

/** The displacement map for a sheet of w x h px, as an SVG data URI. radius = corner radius of the neutral middle. */
export function lensMap(w, h, radius = 28) {
  const e = edgeOf(w, h);
  const blur = Math.max(2, Math.round(e * 0.55));
  const iw = Math.max(0, w - 2 * e);
  const ih = Math.max(0, h - 2 * e);
  const r = Math.max(0, Math.min(radius - e / 2, iw / 2, ih / 2));
  const svg = `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    + `<defs><linearGradient id="x" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>`
    + `<linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient>`
    + `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`
    + `<rect width="${w}" height="${h}" fill="url(#x)"/>`
    + `<rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/>`
    + `<rect x="${e}" y="${e}" width="${iw}" height="${ih}" rx="${r}" fill="#800080" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The scale used on a sheet of w x h: the full scale from 160px (the short side) up, less on a smaller sheet, so a
 *  thin bar or a small card bends as much as its edge allows instead of smearing. */
export function lensScale(w, h, scale = LENS_SCALE) {
  return Math.round(scale * Math.min(1, Math.min(w, h) / 160));
}

/** Id of the filter for a sheet of w x h with this scale ("oc-lens-320x180", "oc-lens-320x180-s40"). */
export function lensId(w, h, scale = LENS_SCALE) {
  return `oc-lens-${w}x${h}${scale === LENS_SCALE ? "" : `-s${String(scale).replace("-", "m")}`}`;
}

// Filters in use: id -> number of sheets on it. A filter goes away when no sheet uses it any more.
const uses = new Map();

function defs(doc) {
  let svg = doc.getElementById(DEFS_ID);
  if (!svg) {
    svg = doc.createElementNS(NS, "svg");
    svg.id = DEFS_ID;
    svg.setAttribute("class", "oc-lens-defs");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText = "position:absolute;inline-size:0;block-size:0;overflow:hidden;pointer-events:none";
    doc.body.append(svg);
  }
  return svg;
}

/** Makes (or reuses) the filter for w x h and counts one more user. Returns its id. */
export function acquireLens(doc, w, h, scale = LENS_SCALE, radius = 28) {
  const id = lensId(w, h, scale);
  if (!uses.has(id) || !doc.getElementById(id)) {
    const filter = doc.createElementNS(NS, "filter");
    filter.id = id;
    for (const [k, v] of Object.entries({ x: "0", y: "0", width: "100%", height: "100%", "color-interpolation-filters": "sRGB" })) filter.setAttribute(k, v);
    const img = doc.createElementNS(NS, "feImage");
    for (const [k, v] of Object.entries({ href: lensMap(w, h, radius), x: "0", y: "0", width: String(w), height: String(h), preserveAspectRatio: "none", result: "map" })) img.setAttribute(k, v);
    const move = doc.createElementNS(NS, "feDisplacementMap");
    for (const [k, v] of Object.entries({ in: "SourceGraphic", in2: "map", scale: String(lensScale(w, h, scale)), xChannelSelector: "R", yChannelSelector: "B" })) move.setAttribute(k, v);
    filter.append(img, move);
    defs(doc).append(filter);
    if (!uses.has(id)) uses.set(id, 0);
  }
  uses.set(id, uses.get(id) + 1);
  return id;
}

/** One user less; the filter is removed when nobody uses it. */
export function releaseLens(doc, id) {
  if (!id || !uses.has(id)) return;
  const n = uses.get(id) - 1;
  if (n > 0) { uses.set(id, n); return; }
  uses.delete(id);
  doc.getElementById(id)?.remove();
}

/** Number of lens filters on the page (for tests and debugging). */
export const lensCount = () => uses.size;

let observer;
const bound = new WeakMap();

function update(el) {
  const state = bound.get(el);
  if (!state) return;
  const w = Math.round(el.clientWidth);
  const h = Math.round(el.clientHeight);
  const scale = Number(el.dataset.ocGlassLensScale) || LENS_SCALE;
  const id = w > 0 && h > 0 ? lensId(w, h, scale) : "";
  if (id === state.id) return;
  const doc = el.ownerDocument;
  const radius = parseFloat(doc.defaultView?.getComputedStyle(el).borderTopLeftRadius) || 28;
  const next = id ? acquireLens(doc, w, h, scale, radius) : "";
  releaseLens(doc, state.id);
  state.id = next;
  if (next) {
    el.style.setProperty("--oc-glass-lens", `url(#${next})`);
    el.dataset.ocLens = `${w}x${h}`;
  } else {
    el.style.removeProperty("--oc-glass-lens");
    delete el.dataset.ocLens;
  }
}

/** Gives one sheet the lens and keeps it the size of the sheet. Returns a function that removes it again.
 *  Outside Chromium it only marks html.oc-no-lens. */
export function bindGlassLens(el, { force = false } = {}) {
  const doc = el?.ownerDocument;
  if (!doc || bound.has(el) || el.matches(SKIP)) return () => {};
  if (!force && !supportsGlassLens(doc.defaultView?.navigator)) {
    doc.documentElement.classList.add("oc-no-lens");
    return () => {};
  }
  doc.documentElement.classList.remove("oc-no-lens");
  bound.set(el, { id: "" });
  const RO = doc.defaultView?.ResizeObserver;
  if (RO) {
    observer ??= new RO((entries) => { for (const entry of entries) update(entry.target); });
    observer.observe(el);
  }
  update(el);
  return () => {
    const state = bound.get(el);
    if (!state) return;
    observer?.unobserve(el);
    releaseLens(doc, state.id);
    bound.delete(el);
    el.style.removeProperty("--oc-glass-lens");
    delete el.dataset.ocLens;
  };
}

/** Gives every glass sheet under `scope` the lens (see LENS_SELECTOR). */
export function initGlassLens(scope = document, options) {
  const els = [...scope.querySelectorAll(LENS_SELECTOR)];
  if (scope.nodeType === 1 && scope.matches(LENS_SELECTOR)) els.unshift(scope);
  return els.map((el) => bindGlassLens(el, options));
}

// ---- Drag (optional): data-oc-glass-drag on a sheet lets people move it over its backdrop ------------------------------
// Mouse, pen and touch (pointer events, touch-action: none in the CSS) and the keyboard (the sheet takes focus; arrow keys
// move it 16px, with Shift 64px, Home puts it back). It stays inside its area: the closest [data-oc-glass-drag-area], else
// the parent. It moves with `translate`, so the size and the lens filter stay the same; when the area resizes the sheet is
// clamped again. Clicks on links, buttons and fields inside still work. Fires "oc-glass-move" with { x, y }.

/** Sheets initGlassDrag (and the auto-start) make draggable. */
export const DRAG_SELECTOR = "[data-oc-glass-drag]";
/** Keyboard step in px (Shift: four times as far). */
export const DRAG_STEP = 16;
const INTERACTIVE = "a[href], button, input, select, textarea, label, summary, [contenteditable=\"\"], [contenteditable=\"true\"], [data-oc-glass-drag-ignore]";
const KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
const dragged = new WeakMap();

/** The area a sheet moves in: the closest [data-oc-glass-drag-area] above it, else its parent. */
const areaOf = (el) => el.parentElement?.closest("[data-oc-glass-drag-area]") ?? el.parentElement;

/** Keeps x/y so the sheet stays inside its area (the inner box: inside the area's border). */
export function clampGlassDrag(el, x, y, state = dragged.get(el) ?? { x: 0, y: 0 }) {
  const area = areaOf(el);
  if (!area) return [x, y];
  const a = area.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  // the box without the current move (the computed translate, which is also right halfway a keyboard glide)
  const t = el.ownerDocument.defaultView?.getComputedStyle(el).translate;
  const [nowX, nowY = 0] = t ? (t === "none" ? [0, 0] : t.split(" ").map((v) => parseFloat(v) || 0)) : [state.x, state.y];
  const left = r.left - nowX;
  const top = r.top - nowY;
  const minX = a.left + area.clientLeft - left;
  const minY = a.top + area.clientTop - top;
  const maxX = Math.max(minX, a.left + area.clientLeft + area.clientWidth - (left + r.width));
  const maxY = Math.max(minY, a.top + area.clientTop + area.clientHeight - (top + r.height));
  return [Math.round(Math.min(maxX, Math.max(minX, x))), Math.round(Math.min(maxY, Math.max(minY, y)))];
}

/** Moves a draggable sheet to x/y (px from where the layout put it), clamped to its area. */
export function moveGlass(el, x, y) {
  const state = dragged.get(el);
  if (!state) return;
  [state.x, state.y] = clampGlassDrag(el, x, y, state);
  el.style.translate = state.x || state.y ? `${state.x}px ${state.y}px` : "";
  el.dispatchEvent(new el.ownerDocument.defaultView.CustomEvent("oc-glass-move", { detail: { x: state.x, y: state.y } }));
}

/** Makes one sheet draggable (mouse, touch, keyboard). Returns a function that undoes it. */
export function bindGlassDrag(el, { label = "Drag to move" } = {}) {
  const doc = el?.ownerDocument;
  if (!doc || dragged.has(el)) return () => {};
  const state = { x: 0, y: 0, pointer: null };
  dragged.set(el, state);
  const added = [];
  const set = (k, v) => { if (!el.hasAttribute(k)) { el.setAttribute(k, v); added.push(k); } };
  set("data-oc-glass-drag", "");
  set("tabindex", "0");
  set("role", "group");
  set("aria-roledescription", "draggable");
  if (!el.hasAttribute("aria-labelledby")) set("aria-label", label);

  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const hit = e.target !== el && e.target.closest?.(INTERACTIVE);
    if (hit && el.contains(hit)) return;
    state.pointer = { id: e.pointerId, sx: e.clientX - state.x, sy: e.clientY - state.y };
    el.setPointerCapture?.(e.pointerId);
    el.setAttribute("data-oc-dragging", "");
    // no text selection or native image drag; the sheet takes focus for the arrow keys, without a ring until a key is used
    e.preventDefault();
    el.setAttribute("data-oc-pointer", "");
    el.focus?.({ preventScroll: true });
  };
  const noRing = () => el.removeAttribute("data-oc-pointer");
  const move = (e) => {
    const p = state.pointer;
    if (!p || (p.id !== undefined && e.pointerId !== undefined && e.pointerId !== p.id)) return;
    moveGlass(el, e.clientX - p.sx, e.clientY - p.sy);
  };
  const up = (e) => {
    if (!state.pointer) return;
    el.releasePointerCapture?.(e.pointerId);
    state.pointer = null;
    el.removeAttribute("data-oc-dragging");
  };
  const key = (e) => {
    if (e.target !== el) return;
    noRing();
    if (e.key === "Home") { e.preventDefault(); moveGlass(el, 0, 0); return; }
    const dir = KEYS[e.key];
    if (!dir) return;
    e.preventDefault();
    const step = DRAG_STEP * (e.shiftKey ? 4 : 1);
    moveGlass(el, state.x + dir[0] * step, state.y + dir[1] * step);
  };
  const on = [["pointerdown", down], ["pointermove", move], ["pointerup", up], ["pointercancel", up], ["keydown", key], ["blur", noRing]];
  for (const [t, f] of on) el.addEventListener(t, f);

  // the area got smaller (window, sidebar): keep the sheet inside
  const RO = doc.defaultView?.ResizeObserver;
  const area = areaOf(el);
  const ro = RO && area ? new RO(() => { if (state.x || state.y) moveGlass(el, state.x, state.y); }) : null;
  ro?.observe(area);

  return () => {
    if (!dragged.has(el)) return;
    for (const [t, f] of on) el.removeEventListener(t, f);
    ro?.disconnect();
    dragged.delete(el);
    for (const k of added) el.removeAttribute(k);
    el.removeAttribute("data-oc-dragging");
    noRing();
    el.style.translate = "";
  };
}

/** Makes every [data-oc-glass-drag] under `scope` draggable. */
export function initGlassDrag(scope = document) {
  const els = [...scope.querySelectorAll(DRAG_SELECTOR)];
  if (scope.nodeType === 1 && scope.matches(DRAG_SELECTOR)) els.unshift(scope);
  return els.map((el) => bindGlassDrag(el));
}

// Starts on its own as /js/oc-glass-lens.js (`npx omniaui copy-js glass-lens`), with ?auto in the URL or data-oc-auto
// on the tag. Dragging works in every browser; the lens only in Chromium.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-glass-lens") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => {
    if (!supportsGlassLens()) document.documentElement.classList.add("oc-no-lens");
    else initGlassLens(document);
    initGlassDrag(document);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
