// OmniaUI Pro v0.15.0 - commercial software, NOT open source and NOT under the MIT license.
// Copyright (c) 2026 Serge Cools (Birdycom). All rights reserved.
// Use only with a valid OmniaUI Pro license: https://omniaui.eu/legal/pro-license (buy: https://omniaui.eu/ui/pro).
// File: packages/pro/src/data-table-pro.js
// Map: store -> column width (handle, remembered, reset) -> row drag (grip, drop line, reorder event) -> bind -> boot
// OmniaUI Pro on top of the free data table (@birdycom/omniaui/data-table.js): drag a column edge
// (.oc-data-table-resize in the header) to set its width, and drag a row by its grip (.oc-sortable-row-grip).
// Widths are remembered per table id; [data-oc-reset-widths] clears them. A drop fires oc-datatable-reorder { keys }.

function readStore(id, name) {
  try {
    return JSON.parse(localStorage.getItem(`oc-data-table:${id}:${name}`) || "null");
  } catch {
    return null;
  }
}

function writeStore(id, name, value) {
  try {
    localStorage.setItem(`oc-data-table:${id}:${name}`, JSON.stringify(value));
  } catch {
    // Private mode can block storage. The widths still work for this visit.
  }
}

const bound = new WeakSet();

/** Column width and row drag for one .oc-data-table. */
export function bindDataTablePro(root) {
  const table = root?.querySelector("table");
  const tbody = table?.tBodies[0];
  if (!table || !tbody || bound.has(root)) return;
  bound.add(root);
  const id = root.id || "data-table";
  const heads = () => [...table.tHead.rows[0].cells];
  const rows = () => [...tbody.querySelectorAll("[data-oc-row]")];
  const refresh = () => root.dispatchEvent(new CustomEvent("oc-datatable-refresh"));

  // Remembered widths from the last visit.
  const saved = readStore(id, "widths") || {};
  for (const th of heads()) {
    if (saved[th.dataset.ocCol]) {
      th.style.width = saved[th.dataset.ocCol];
      table.classList.add("oc-data-table-table--sized");
    }
  }

  root.addEventListener("click", (event) => {
    if (!event.target.closest("[data-oc-reset-widths]")) return;
    for (const th of heads()) th.style.width = "";
    table.classList.remove("oc-data-table-table--sized");
    writeStore(id, "widths", {});
  });

  // Column width: drag the handle at the edge of a header cell.
  root.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".oc-data-table-resize");
    if (!handle || !root.contains(handle)) return;
    const th = handle.closest("th");
    if (!th) return;
    event.preventDefault();
    const startX = event.clientX;
    const startW = th.getBoundingClientRect().width;
    const min = Number(th.dataset.ocMin || 64);
    root.classList.add("is-resizing");
    table.classList.add("oc-data-table-table--sized");
    const move = (ev) => { th.style.width = `${Math.max(min, Math.round(startW + ev.clientX - startX))}px`; };
    const up = () => {
      root.classList.remove("is-resizing");
      // The click that ends the drag must not sort the column (the whole header cell sorts).
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const widths = {};
      for (const head of heads()) if (head.style.width) widths[head.dataset.ocCol] = head.style.width;
      writeStore(id, "widths", widths);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });

  // Row drag starts from the grip only, so selecting text in a cell still works.
  let dragKey = "";
  root.addEventListener("pointerdown", (event) => {
    const row = event.target.closest(".oc-sortable-row-grip")?.closest("[data-oc-row]");
    if (row && root.contains(row)) row.draggable = true;
  });
  root.addEventListener("dragstart", (event) => {
    const row = event.target.closest?.("[data-oc-row]");
    if (!row?.draggable) return;
    dragKey = row.dataset.ocKey;
    row.classList.add("is-dragging", "oc-sortable-row");
    event.dataTransfer.effectAllowed = "move";
  });
  root.addEventListener("dragover", (event) => {
    const row = event.target.closest?.("[data-oc-row]");
    if (!row || !dragKey || row.dataset.ocKey === dragKey) return;
    event.preventDefault();
    const box = row.getBoundingClientRect();
    const after = event.clientY > box.top + box.height / 2;
    tbody.querySelectorAll(".is-drop-before, .is-drop-after").forEach((el) => el.classList.remove("is-drop-before", "is-drop-after"));
    row.classList.add("oc-sortable-row", after ? "is-drop-after" : "is-drop-before");
  });
  root.addEventListener("drop", (event) => {
    const row = event.target.closest?.("[data-oc-row]");
    const from = dragKey ? tbody.querySelector(`[data-oc-key="${CSS.escape(dragKey)}"]`) : null;
    if (!row || !from || row === from) return;
    event.preventDefault();
    tbody.insertBefore(from, row.classList.contains("is-drop-after") ? row.nextSibling : row);
    root.dispatchEvent(new CustomEvent("oc-datatable-reorder", { bubbles: true, detail: { keys: rows().map((item) => item.dataset.ocKey) } }));
    refresh();
  });
  root.addEventListener("dragend", () => {
    dragKey = "";
    for (const row of rows()) {
      row.draggable = false;
      row.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
    }
  });
}

/** Column width and row drag for every .oc-data-table under scope. */
export function initDataTablesPro(scope = document) {
  scope.querySelectorAll(".oc-data-table").forEach(bindDataTablePro);
}

// Starts on its own as /js/oc-data-table-pro.js (`npx omniaui copy-js`), with ?auto or data-oc-auto on the tag.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-data-table-pro") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initDataTablesPro(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
