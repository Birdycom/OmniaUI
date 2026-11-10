// OmniaUI Pro v0.15.0 - commercial software, NOT open source and NOT under the MIT license.
// Copyright (c) 2026 Serge Cools (Birdycom). All rights reserved.
// Use only with a valid OmniaUI Pro license: https://omniaui.eu/legal/pro-license (buy: https://omniaui.eu/ui/pro).
// File: packages/pro/src/network-graph.js
// Map: read the data (list items or an object) -> ring layout (rings grow until no node touches another) -> SVG (edges,
//      nodes, center pulse) with a viewBox around everything -> tooltip -> select (click, Enter, Space) -> drag ->
//      highlight one node -> boot
// Network graph (.oc-network-graph): a center (a person, an account, a server) with every linked node on a ring around
// it. No dependency: the layout is a fixed ring, so a node never lands on the center or on another node, and the SVG
// scales with its box. The look is the free OmniaUI graph CSS (parts/data-graph.css); Pro adds parts/app-network-graph.css.
// Markup: <div class="oc-graph oc-network-graph" data-center="Customer 1"><svg class="oc-graph__svg"></svg>
//           <ol class="oc-network-graph__list"><li data-id="n1" data-level="high" data-meta="Email · Password">Site 1</li> …</ol></div>
// Event: oc-graph-select { id } on the graph when a node is clicked or chosen with Enter / Space.

const SVG = "http://www.w3.org/2000/svg";
const MARK = { critical: "!", high: "▲", medium: "●", low: "○" };
const LEVELS = ["critical", "high", "medium", "low"];
/** Minimum room per node along a ring, the first ring, the step between rings and the room for labels and glow. */
const SPACING = 72, MIN_RING = 120, RING_STEP = 72, PADDING = 45;

/** Rings for count nodes: how many sit on each ring and its radius. */
export function ringLayout(count, minRing = MIN_RING) {
  const rings = [];
  let left = count, radius = minRing;
  while (left > 0) {
    const room = Math.max(1, Math.floor((2 * Math.PI * radius) / SPACING));
    const take = Math.min(left, room);
    rings.push({ radius, count: take });
    left -= take;
    radius += RING_STEP;
  }
  return rings;
}

/** Positions around (0, 0): the first node at the top, clockwise; outer rings are turned half a step. */
export function positions(count, minRing = MIN_RING) {
  const out = [];
  ringLayout(count, minRing).forEach(({ radius, count: n }, r) => {
    for (let i = 0; i < n; i++) {
      const angle = ((i + (r % 2) / 2) / n) * 2 * Math.PI - Math.PI / 2;
      out.push({ x: Math.round(Math.cos(angle) * radius * 10) / 10, y: Math.round(Math.sin(angle) * radius * 10) / 10 });
    }
  });
  return out;
}

/** Data from the markup: the center and one node per list item. */
export function readGraph(graph) {
  const items = [...graph.querySelectorAll(".oc-network-graph__list > li")];
  return {
    center: { label: graph.dataset.center || "", mark: graph.dataset.centerMark || "◉" },
    nodes: items.map((li, i) => ({
      id: li.dataset.id || `n${i + 1}`,
      label: li.dataset.label || li.textContent.trim(),
      title: li.dataset.title || li.textContent.trim(),
      level: LEVELS.includes(li.dataset.level) ? li.dataset.level : "low",
      levelText: li.dataset.levelText || li.dataset.level || "",
      meta: (li.dataset.meta || "").split("·").map((s) => s.trim()).filter(Boolean),
    })),
  };
}

const el = (name, attrs = {}, parent) => {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, String(v));
  parent?.appendChild(node);
  return node;
};
const short = (text, max = 15) => (text.length > max ? `${text.slice(0, max)}…` : text);

/** Draw the graph into its svg. Returns { highlight(id | null), destroy() }. */
export function renderNetworkGraph(graph, data = readGraph(graph)) {
  const svg = graph.querySelector(".oc-graph__svg") || el("svg", { class: "oc-graph__svg" }, graph);
  svg.replaceChildren();
  graph.classList.remove("is-focused");
  const nodes = data.nodes || [];
  const spots = positions(nodes.length);
  const extent = Math.max(MIN_RING / 2, ...spots.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) + PADDING;
  svg.setAttribute("viewBox", `${-extent} ${-extent} ${extent * 2} ${extent * 2}`);
  svg.setAttribute("role", "group");
  if (!svg.hasAttribute("aria-label")) svg.setAttribute("aria-label", graph.dataset.label || `${data.center?.label || "Graph"}: ${nodes.length}`);

  const edgeLayer = el("g", {}, svg);
  const nodeLayer = el("g", {}, svg);
  const edges = new Map();
  const groups = new Map();

  // Center first, so the other nodes are drawn over its pulse.
  const center = el("g", { class: "oc-graph__node oc-graph__node--center", transform: "translate(0 0)" }, nodeLayer);
  el("circle", { class: "oc-graph__pulse", r: 21 }, center);
  el("circle", { class: "oc-graph__halo", r: 30 }, center);
  el("circle", { class: "oc-graph__dot", r: 21 }, center);
  el("text", { class: "oc-graph__mark" }, center).textContent = data.center?.mark || "◉";
  el("text", { class: "oc-graph__label", y: 35 }, center).textContent = short(data.center?.label || "");

  nodes.forEach((n, i) => {
    const { x, y } = spots[i];
    edges.set(n.id, el("line", { class: "oc-graph__edge", x1: 0, y1: 0, x2: x, y2: y }, edgeLayer));
    const g = el("g", {
      class: "oc-graph__node", "data-level": n.level, "data-id": n.id, transform: `translate(${x} ${y})`,
      tabindex: 0, role: "button", "aria-label": [n.title, n.levelText].filter(Boolean).join(", "), style: `--oc-graph-i: ${i}`,
    }, nodeLayer);
    el("circle", { class: "oc-graph__halo", r: 21 }, g);
    el("circle", { class: "oc-graph__dot", r: 14 }, g);
    el("text", { class: "oc-graph__mark" }, g).textContent = MARK[n.level];
    el("text", { class: "oc-graph__label", y: 27 }, g).textContent = short(n.label);
    groups.set(n.id, { g, n, x, y });
  });

  // Tooltip: level, title and meta lines, text only (the data can come from outside).
  let tip = graph.querySelector(".oc-graph__tip");
  if (!tip) { tip = document.createElement("div"); tip.className = "oc-graph__tip"; tip.setAttribute("aria-hidden", "true"); graph.appendChild(tip); }
  const line = (cls, text) => Object.assign(document.createElement("div"), { className: cls, textContent: text });
  const showTip = (id) => {
    const item = groups.get(id);
    if (!item) return;
    const { n, g } = item;
    tip.replaceChildren(line("oc-graph__tip-level", n.levelText || n.level), line("oc-graph__tip-title", n.title), ...n.meta.map((m) => line("oc-graph__tip-meta", m)));
    tip.dataset.level = n.level;
    // Beside the node: on the right when it fits, else on the left, never over the node itself.
    const box = graph.getBoundingClientRect(), dot = g.getBoundingClientRect();
    const width = tip.offsetWidth || 160;
    const right = dot.right - box.left + 8;
    const left = right + width <= box.width ? right : dot.left - box.left - width - 8;
    tip.style.left = `${Math.max(0, Math.min(left, box.width - width))}px`;
    tip.style.top = `${Math.max(0, dot.top - box.top - 8)}px`;
    tip.classList.add("is-visible");
  };
  const hideTip = () => tip.classList.remove("is-visible");

  const select = (id) => graph.dispatchEvent(new CustomEvent("oc-graph-select", { bubbles: true, detail: { id } }));
  const idOf = (event) => event.target.closest?.(".oc-graph__node[data-id]")?.dataset.id;

  // Drag a node to make room; its edge follows. A drag is not a click.
  let drag = null, dragged = false;
  const point = (event) => {
    const m = svg.getScreenCTM?.();
    if (!m) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const onDown = (event) => { const id = idOf(event); if (id && event.button === 0) { drag = id; dragged = false; } };
  const onMove = (event) => {
    if (drag) {
      const p = point(event);
      const item = groups.get(drag);
      if (!p || !item) return;
      dragged = true;
      item.x = p.x; item.y = p.y;
      item.g.setAttribute("transform", `translate(${p.x} ${p.y})`);
      edges.get(drag).setAttribute("x2", p.x);
      edges.get(drag).setAttribute("y2", p.y);
      hideTip();
      return;
    }
    const id = idOf(event);
    if (id) showTip(id); else hideTip();
  };
  const onUp = () => { drag = null; };
  const onClick = (event) => { const id = idOf(event); if (id && !dragged) select(id); dragged = false; };
  const onKey = (event) => {
    const id = idOf(event);
    if (!id || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    select(id);
  };
  const onFocus = (event) => { const id = idOf(event); if (id) showTip(id); };
  svg.addEventListener("pointerdown", onDown);
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerleave", hideTip);
  window.addEventListener("pointerup", onUp);
  svg.addEventListener("click", onClick);
  svg.addEventListener("keydown", onKey);
  svg.addEventListener("focusin", onFocus);
  svg.addEventListener("focusout", hideTip);

  /** Light one node and its edge, dim the rest (null: all back). The graph is not rebuilt. */
  const highlight = (id) => {
    graph.classList.toggle("is-focused", !!(id && groups.has(id)));
    for (const [key, { g }] of groups) g.classList.toggle("is-active", key === id);
    for (const [key, edge] of edges) edge.classList.toggle("is-active", key === id);
  };
  highlight(graph.dataset.highlight || null);

  return {
    highlight,
    destroy() {
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", hideTip);
      window.removeEventListener("pointerup", onUp);
      svg.removeEventListener("click", onClick);
      svg.removeEventListener("keydown", onKey);
      svg.removeEventListener("focusin", onFocus);
      svg.removeEventListener("focusout", hideTip);
      tip.remove();
    },
  };
}

/** Draw every .oc-network-graph under scope from its list (once). */
export function initNetworkGraphs(scope = document) {
  return [...scope.querySelectorAll(".oc-network-graph:not([data-oc-bound])")].map((graph) => {
    graph.setAttribute("data-oc-bound", "");
    return renderNetworkGraph(graph);
  });
}

// Starts on its own as /js/oc-network-graph.js (`npx omniaui copy-js`), with ?auto in the URL or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-network-graph") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initNetworkGraphs(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
