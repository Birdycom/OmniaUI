// File: packages/pro/src/ecosystem-map.js
// Map: nodes (data-oc-node, data-oc-parents) -> edges -> SVG curves from the bottom of a parent to the top of its child
//      (redrawn on resize) -> pointing at a node: its way up + its children light up, caption -> boot
// Ecosystem map (.oc-block-ecosystem-map[data-oc-ecosystem]): the lines between your logo and your apps, and the
// highlighting when you point at (or focus) an app. The CSS is parts/site-ecosystem-map.css.
// Caption texts come from the map's data attributes, so the block works in any language:
//   data-label-parents ("builds on"), data-label-children ("basis for"), data-label-alone ("an app on its own"),
//   data-label-root ("the maker of every app"); the default caption is the figcaption's own text.

const SVG = "http://www.w3.org/2000/svg";

/** A curve from (x1, y1) down to (x2, y2): leaves straight down, arrives straight down. */
export function curve(x1, y1, x2, y2) {
  const middle = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${middle} ${x2} ${middle} ${x2} ${y2}`;
}

/** Nodes on the way up from a node (its parents, their parents …), the node itself included. */
export function ancestors(node, edges) {
  const found = new Set([node]);
  const todo = [node];
  while (todo.length) {
    const current = todo.pop();
    for (const e of edges) if (e.to === current && !found.has(e.from)) { found.add(e.from); todo.push(e.from); }
  }
  return found;
}

/** Wire up one map (once). Returns a cleanup function. */
export function bindEcosystemMap(map) {
  if (map.hasAttribute("data-oc-ecosystem-bound")) return () => {};
  const canvas = map.querySelector(".oc-block-ecosystem-canvas");
  const svg = map.querySelector(".oc-block-ecosystem-lines");
  if (!canvas || !svg) return () => {};
  const caption = map.querySelector(".oc-block-ecosystem-caption");
  const fallback = caption ? caption.textContent : "";
  const nodes = [...map.querySelectorAll("[data-oc-node]")];
  const byId = Object.fromEntries(nodes.map((n) => [n.dataset.ocNode, n]));
  const edges = nodes.flatMap((to) => (to.dataset.ocParents || "").split(/\s+/).filter((id) => byId[id]).map((id) => ({
    from: byId[id], to, path: document.createElementNS(SVG, "path"),
  })));
  edges.forEach((e) => svg.appendChild(e.path));

  // Position inside the canvas from offsetLeft/Top: they ignore transforms (hover scale, entry animations).
  const box = (node, icon) => {
    const target = (icon && node.querySelector(".oc-icon-tile, img, svg")) || node;
    let x = 0, y = 0;
    for (let el = target; el && el !== canvas; el = el.offsetParent) { x += el.offsetLeft; y += el.offsetTop; }
    return { x, y, w: target.offsetWidth, h: target.offsetHeight };
  };
  const draw = () => {
    svg.setAttribute("viewBox", `0 0 ${canvas.offsetWidth} ${canvas.offsetHeight}`);
    for (const { from, to, path } of edges) {
      const a = box(from, false), b = box(to, true);
      path.setAttribute("d", curve(a.x + a.w / 2, a.y + a.h + 4, b.x + b.w / 2, b.y - 4));
    }
  };
  draw();
  const resize = typeof ResizeObserver === "function" ? new ResizeObserver(draw) : null;
  resize?.observe(canvas);

  const label = (key, fallbackText) => map.dataset[key] || fallbackText;
  const names = (list) => list.map((n) => n.dataset.ocName || n.textContent.trim()).join(", ");
  const isRoot = (n) => !n.dataset.ocParents;
  const focus = (node) => {
    const up = ancestors(node, edges);
    const children = edges.filter((e) => e.from === node).map((e) => e.to);
    const linked = new Set([...up, ...children]);
    for (const e of edges) e.path.classList.toggle("is-active", (up.has(e.from) && up.has(e.to)) || e.from === node);
    for (const n of nodes) n.classList.toggle("is-linked", linked.has(n));
    map.classList.add("is-focused");
    if (!caption) return;
    const name = node.dataset.ocName || node.textContent.trim();
    if (isRoot(node)) { caption.textContent = `${name}: ${label("labelRoot", "the maker of every app")}.`; return; }
    const parents = edges.filter((e) => e.to === node && !isRoot(e.from)).map((e) => e.from);
    const parts = [];
    if (parents.length) parts.push(`${label("labelParents", "builds on")} ${names(parents)}`);
    if (children.length) parts.push(`${label("labelChildren", "basis for")} ${names(children)}`);
    caption.textContent = `${name}: ${parts.length ? parts.join("; ") : label("labelAlone", "an app on its own")}.`;
  };
  const reset = () => {
    map.classList.remove("is-focused");
    for (const n of nodes) n.classList.remove("is-linked");
    for (const e of edges) e.path.classList.remove("is-active");
    if (caption) caption.textContent = fallback;
  };
  const listeners = nodes.map((node) => {
    const on = () => focus(node);
    node.addEventListener("pointerenter", on);
    node.addEventListener("focus", on);
    node.addEventListener("pointerleave", reset);
    node.addEventListener("blur", reset);
    return [node, on];
  });
  map.setAttribute("data-oc-ecosystem-bound", "");

  return () => {
    resize?.disconnect();
    for (const [node, on] of listeners) {
      node.removeEventListener("pointerenter", on);
      node.removeEventListener("focus", on);
      node.removeEventListener("pointerleave", reset);
      node.removeEventListener("blur", reset);
    }
    edges.forEach((e) => e.path.remove());
    reset();
    map.removeAttribute("data-oc-ecosystem-bound");
  };
}

/** Wire up every [data-oc-ecosystem] under scope. */
export function initEcosystemMaps(scope = document) {
  scope.querySelectorAll("[data-oc-ecosystem]").forEach((map) => bindEcosystemMap(map));
}

// Loaded as /js/oc-ecosystem-map.js (the docs site, or a copy in your project): start on its own.
if (typeof document !== "undefined" && String(import.meta.url).includes("oc-ecosystem-map")) {
  const boot = () => initEcosystemMaps(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
