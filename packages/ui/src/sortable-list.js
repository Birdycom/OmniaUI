// File: packages/ui/src/sortable-list.js
// Map: helpers (items, ids, live region) -> move (DOM or callback) -> keyboard (Space/Enter grab, arrows, Escape) -> arrow buttons
//      -> pointer drag (mouse, pen, touch: ghost + drop line) -> bind -> init -> boot
// Sortable list (0.18.0): <ol class="oc-sortable-list" data-oc-sortable> with li.oc-sortable-item[data-id] children, each with a
// button.oc-sortable-row-grip. Drag the grip with a finger, pen or mouse (pointer events, so it works on a tablet), or focus
// it and press Space (or Enter) to pick the item up, the arrow keys to move it and Space again to drop it (Escape puts it back).
// Optional arrow buttons: [data-oc-move="up"] / [data-oc-move="down"] in an item. Every change is announced in a polite
// live region and fires "oc-reorder" on the list ({ from, to, order: [ids] }). data-oc-reorder-call="method" also calls that
// method on the Livewire component around the list with the new order.
// Frameworks: bindSortableList(list, { move: false, onReorder }) leaves the DOM alone and only reports from / to, so React or
// Vue re-render the items themselves.

const ITEM = ".oc-sortable-item";
const GRIP = ".oc-sortable-row-grip";

/** The sortable items of a list, in DOM order (the drop line and the ghost do not count). */
export function sortableItems(list) {
  return [...list.children].filter((el) => el.matches(ITEM));
}

/** The ids of the items (data-id, else their text), in order. */
export function sortableOrder(list) {
  return sortableItems(list).map((el) => el.dataset.id ?? el.textContent.trim());
}

const labelOf = (item) => item.dataset.label || item.querySelector(".oc-sortable-item__body")?.textContent.trim() || item.textContent.trim();

/** A visually hidden live region next to the list (made once). */
function liveRegion(list) {
  if (list._ocLive?.isConnected) return list._ocLive;
  const live = list.ownerDocument.createElement("div");
  live.className = "oc-sr-only";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  live.style.cssText = "position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
  list.after(live);
  list._ocLive = live;
  return live;
}

/** Bind one list. Options: move (default true: move the DOM node), onReorder(from, to, order), messages
 *  { grabbed, moved, dropped, cancelled } with {label}, {pos} and {count}. Returns { destroy, order }. */
export function bindSortableList(list, options = {}) {
  if (!list || list._ocSortable) return list?._ocSortable;
  const doc = list.ownerDocument;
  const win = doc.defaultView;
  const opts = { move: list.dataset.ocSortableMove !== "false", ...options };
  let moving = false; // true while reorder() moves the node (see onBlur)
  const text = {
    grabbed: "{label} grabbed. Position {pos} of {count}. Use the arrow keys to move, Space to drop, Escape to cancel.",
    moved: "{label}: position {pos} of {count}.",
    dropped: "{label} dropped at position {pos} of {count}.",
    cancelled: "Move cancelled. {label} is back at position {pos} of {count}.",
    ...(opts.messages || {}),
  };
  const say = (key, item) => {
    const write = () => {
      const items = sortableItems(list);
      liveRegion(list).textContent = text[key]
        .replace("{label}", labelOf(item))
        .replace("{pos}", String(items.indexOf(item) + 1))
        .replace("{count}", String(items.length));
    };
    // a framework list (move: false) renders the new order after this handler: read the position after that
    if (opts.move) write();
    else win.setTimeout(write, 0);
  };

  /** Move the item at `from` to index `to` (in the list without the item), report it, keep the focus on its grip. */
  function reorder(from, to) {
    const items = sortableItems(list);
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return false;
    const item = items[from];
    const id = item.dataset.id;
    const hadFocus = item.contains(doc.activeElement) ? doc.activeElement : null;
    if (opts.move) {
      const rest = items.filter((el) => el !== item);
      const ref = rest[to] ?? null;
      // Chrome fires focusout on the grip while the node is taken out and put back: that is not the user leaving
      moving = true;
      try { list.insertBefore(item, ref ?? (rest.length ? rest[rest.length - 1].nextSibling : null)); } finally { moving = false; }
    }
    const order = sortableOrder(list);
    opts.onReorder?.(from, to, order);
    list.dispatchEvent(new win.CustomEvent("oc-reorder", { bubbles: true, detail: { from, to, order, id } }));
    const call = list.dataset.ocReorderCall;
    if (call && win.Livewire) {
      const host = list.closest("[wire\\:id]");
      const wire = host && win.Livewire.find(host.getAttribute("wire:id"));
      if (wire) (wire.call ? wire.call(call, order) : wire[call]?.(order));
    }
    // a moved node can lose focus; a re-rendered framework list gets the same item back by its data-id
    const refocus = () => {
      const again = id != null ? sortableItems(list).find((el) => el.dataset.id === id) : item;
      const target = hadFocus && again ? (again.contains(hadFocus) ? hadFocus : again.querySelector(GRIP)) : null;
      if (target && doc.activeElement !== target) target.focus({ preventScroll: true });
    };
    if (hadFocus) { refocus(); win.requestAnimationFrame?.(refocus); }
    return true;
  }

  // keyboard: Space / Enter picks up and drops, arrows move, Home / End to the ends, Escape cancels
  let grabbed = null; // { item, start }
  const setGrab = (item, on) => {
    item.classList.toggle("oc-sortable-item--grabbed", on);
    item.querySelector(GRIP)?.setAttribute("aria-pressed", String(on));
  };
  function onKey(e) {
    const grip = e.target.closest?.(GRIP);
    if (!grip || !list.contains(grip) || grip.disabled) return;
    const item = grip.closest(ITEM);
    const items = sortableItems(list);
    const index = items.indexOf(item);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (grabbed?.item === item) {
        setGrab(item, false);
        grabbed = null;
        say("dropped", item);
      } else {
        if (grabbed) setGrab(grabbed.item, false);
        grabbed = { item, start: index };
        setGrab(item, true);
        say("grabbed", item);
      }
      return;
    }
    if (!grabbed || grabbed.item !== item) return;
    let to = null;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = index - 1;
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") to = index + 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = items.length - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      reorder(index, grabbed.start);
      const back = sortableItems(list).find((el) => el.dataset.id != null && el.dataset.id === item.dataset.id) ?? item;
      setGrab(back, false);
      grabbed = null;
      say("cancelled", back);
      return;
    }
    if (to == null) return;
    e.preventDefault();
    if (reorder(index, Math.max(0, Math.min(items.length - 1, to)))) {
      const now = sortableItems(list).find((el) => el.dataset.id != null && el.dataset.id === item.dataset.id) ?? item;
      if (now !== item) { setGrab(item, false); setGrab(now, true); grabbed.item = now; }
      say("moved", now);
    }
  }
  function onBlur(e) {
    // Leaving the grabbed grip drops the item where it is. Moving a focused node also fires focusout in Chrome (our own
    // insertBefore, or a React / Vue re-render after onReorder): that is not the user leaving, so a focusout without a
    // new focus target is decided after reorder() gave the grip its focus back (next frames).
    const g = grabbed;
    if (moving || !g || e.target !== g.item.querySelector(GRIP) || g.item.contains(e.relatedTarget)) return;
    const drop = () => {
      if (grabbed !== g || g.item.contains(doc.activeElement)) return;
      setGrab(g.item, false);
      grabbed = null;
    };
    if (e.relatedTarget == null && win.requestAnimationFrame) win.requestAnimationFrame(() => win.requestAnimationFrame(drop));
    else drop();
  }

  // arrow buttons in an item
  function onClick(e) {
    const btn = e.target.closest?.("[data-oc-move]");
    if (!btn || !list.contains(btn) || btn.disabled) return;
    const item = btn.closest(ITEM);
    const index = sortableItems(list).indexOf(item);
    const to = btn.dataset.ocMove === "up" ? index - 1 : index + 1;
    if (reorder(index, to)) say("moved", sortableItems(list).find((el) => el.dataset.id != null && el.dataset.id === item.dataset.id) ?? item);
  }

  // pointer drag: the grip follows the pointer as a ghost; a drop line shows where it lands
  let drag = null; // { item, from, ghost, line, dx, dy, to, id }
  function targetIndex(y) {
    const rest = sortableItems(list).filter((el) => el !== drag.item);
    let to = rest.length;
    for (let i = 0; i < rest.length; i++) {
      const r = rest[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) { to = i; break; }
    }
    return { to, rest };
  }
  function onDown(e) {
    const grip = e.target.closest?.(GRIP);
    if (!grip || !list.contains(grip) || grip.disabled || e.button > 0 || drag) return;
    const item = grip.closest(ITEM);
    if (!item) return;
    e.preventDefault();
    const rect = item.getBoundingClientRect();
    const ghost = item.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.classList.add("oc-drag-ghost");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.inlineSize = `${rect.width}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    const line = doc.createElement("li");
    line.className = "oc-dropline";
    line.setAttribute("role", "presentation");
    line.setAttribute("aria-hidden", "true");
    doc.body.append(ghost);
    item.classList.add("oc-sortable-item--dragging");
    list.classList.add("is-sorting");
    drag = { item, from: sortableItems(list).indexOf(item), ghost, line, dx: e.clientX - rect.left, dy: e.clientY - rect.top, to: null, pointer: e.pointerId };
    try { grip.setPointerCapture?.(e.pointerId); } catch { /* jsdom, old browsers */ }
    onMove(e);
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointer) return;
    drag.ghost.style.left = `${e.clientX - drag.dx}px`;
    drag.ghost.style.top = `${e.clientY - drag.dy}px`;
    const { to, rest } = targetIndex(e.clientY);
    if (to === drag.to) return;
    drag.to = to;
    if (rest[to]) list.insertBefore(drag.line, rest[to]);
    else list.append(drag.line);
  }
  function finish(e, commit) {
    if (!drag || (e && e.pointerId !== drag.pointer)) return;
    const { item, from, ghost, line, to } = drag;
    drag = null;
    ghost.remove();
    line.remove();
    item.classList.remove("oc-sortable-item--dragging");
    list.classList.remove("is-sorting");
    if (commit && to != null && reorder(from, to)) say("dropped", sortableItems(list).find((el) => el.dataset.id != null && el.dataset.id === item.dataset.id) ?? item);
  }
  const onUp = (e) => finish(e, true);
  const onCancel = (e) => finish(e, false);

  list.addEventListener("keydown", onKey);
  list.addEventListener("focusout", onBlur);
  list.addEventListener("click", onClick);
  list.addEventListener("pointerdown", onDown);
  list.addEventListener("pointermove", onMove);
  list.addEventListener("pointerup", onUp);
  list.addEventListener("pointercancel", onCancel);
  list.addEventListener("lostpointercapture", onCancel);
  sortableItems(list).forEach((item) => item.querySelector(GRIP)?.setAttribute("aria-pressed", "false"));

  const api = {
    order: () => sortableOrder(list),
    reorder,
    destroy() {
      finish(null, false);
      list.removeEventListener("keydown", onKey);
      list.removeEventListener("focusout", onBlur);
      list.removeEventListener("click", onClick);
      list.removeEventListener("pointerdown", onDown);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerup", onUp);
      list.removeEventListener("pointercancel", onCancel);
      list.removeEventListener("lostpointercapture", onCancel);
      list._ocLive?.remove();
      delete list._ocLive;
      delete list._ocSortable;
    },
    /** Swap in new options (a framework re-render with a new callback). */
    set(next) { Object.assign(opts, next); },
  };
  list._ocSortable = api;
  return api;
}

/** Bind every [data-oc-sortable] list under scope (once each). */
export function initSortableLists(scope = document) {
  scope.querySelectorAll("[data-oc-sortable]").forEach((list) => bindSortableList(list));
}

// Starts on its own as /js/oc-sortable-list.js (`npx omniaui copy-js sortable-list`), with ?auto or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-sortable-list") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => {
    initSortableLists(document);
    // Livewire re-renders: bind new lists after every update
    document.addEventListener("livewire:navigated", () => initSortableLists(document));
    globalThis.Livewire?.hook?.("morphed", () => initSortableLists(document));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
