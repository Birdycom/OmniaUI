// File: packages/ui/src/data-table.js
// Map: page numbers -> compare -> csv -> row filter -> bind one table (search, sort, pages, columns, resize, drag, trash, bulk) -> boot
// The list table used in Korrekt and OmniaDesk. Markup stays plain HTML.
// This script adds the behaviour. Excel, PDF and the real delete API stay in the app:
// listen for oc-datatable-bulk, oc-datatable-reorder, oc-datatable-search and oc-datatable-import.

/** Page numbers with ellipses, same window as OmniaDesk (current and last are 1-based). */
export function pageItems(current, last) {
  if (last < 1) return [];
  if (last === 1) return [1];
  const range = [];
  for (let i = Math.max(2, current - 2); i <= Math.min(last - 1, current + 2); i++) range.push(i);
  const out = [1];
  if (range.length && range[0] > 2) out.push("…");
  for (const n of range) out.push(n);
  if (range.length && range[range.length - 1] < last - 1) out.push("…");
  if (last > 1) out.push(last);
  return out;
}

/** Sort two cell values. Numeric columns accept 5,15 and 5.15. */
export function compareValues(a, b, numeric) {
  if (numeric) {
    const n = (v) => Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
    const na = n(a);
    const nb = n(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

/** One CSV field. Quotes when the value contains a comma, quote or newline. */
function csvField(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/** Headers plus rows, as a CSV string the browser can download. */
export function toCsv(headers, rows) {
  return [headers, ...rows].map((line) => line.map(csvField).join(",")).join("\n");
}

/**
 * Does this row stay visible?
 * filter is "active", "deleted", "archived" or "all". query is already lower-case.
 */
export function rowPasses(status, filter, text, query) {
  const state = status || "active";
  if (filter === "active" && state !== "active") return false;
  if (filter === "deleted" && state !== "deleted") return false;
  if (filter === "archived" && state !== "archived") return false;
  if (!query) return true;
  return String(text).toLowerCase().includes(query);
}

const controls = new WeakMap();
const SKIP_COL = new Set(["select", "order", "actions"]);

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
    // Private mode can block storage. The table still works for this visit.
  }
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Wire one .oc-data-table. Calling it again only refreshes the rows. */
export function bindDataTable(root) {
  if (!root) return;
  const prev = controls.get(root);
  if (prev) {
    prev.apply();
    return;
  }

  const table = root.querySelector("table");
  const tbody = table?.tBodies[0];
  if (!table || !tbody) return;

  const id = root.id || "data-table";
  const search = root.querySelector(".oc-data-table-search");
  const summary = root.querySelector("[data-oc-summary]");
  const pager = root.querySelector("[data-oc-pager]");
  const pageSelect = root.querySelector("[data-oc-page-size]");
  const selectAll = root.querySelector("[data-oc-select-all]");
  const bulk = root.querySelector(".oc-data-table-bulk");
  const count = root.querySelector("[data-oc-selected-count]");
  const empty = root.querySelector(".oc-data-table-empty");
  const sortSummary = root.querySelector("[data-oc-sort-summary]");
  const frame = root.querySelector(".oc-data-table-frame") || table.parentElement;
  const live = root.dataset.ocLive === "true";

  let query = "";
  let filter = root.querySelector("[data-oc-filter][aria-current='true']")?.dataset.ocFilter
    || (root.querySelector("[data-oc-filter]") ? "active" : "all");
  let sortKey = "";
  let sortDir = "asc";
  let page = 0;
  let pageSize = Number(pageSelect?.value || root.dataset.pageSize || 15);
  const selected = new Set();

  // Remembered choices from the last visit: page size, density, view, column widths, hidden columns.
  const savedSize = readStore(id, "pageSize");
  if (savedSize && pageSelect?.querySelector(`option[value="${savedSize}"]`)) {
    pageSelect.value = String(savedSize);
    pageSize = Number(savedSize);
  }
  if (readStore(id, "density") === "compact") root.classList.add("oc-data-table--compact");
  if (readStore(id, "view") === "grid") root.classList.add("oc-data-table--grid");
  const savedWidths = readStore(id, "widths") || {};
  for (const th of table.tHead.rows[0].cells) {
    if (savedWidths[th.dataset.ocCol]) {
      th.style.width = savedWidths[th.dataset.ocCol];
      table.classList.add("oc-data-table-table--sized");
    }
  }
  const savedCols = readStore(id, "cols") || {};
  root.querySelectorAll("[data-col]").forEach((box) => {
    if (!box.disabled && savedCols[box.dataset.col] != null) box.checked = savedCols[box.dataset.col];
  });

  const rows = () => [...tbody.querySelectorAll("[data-oc-row]")];
  const textOf = (row) => [...row.cells]
    .filter((td) => td.dataset.ocCol && !SKIP_COL.has(td.dataset.ocCol))
    .map((td) => td.dataset.ocValue || td.textContent)
    .join(" ");
  const valueOf = (row, key) => {
    const td = [...row.cells].find((cell) => cell.dataset.ocCol === key);
    return td ? (td.dataset.ocValue || td.textContent.trim()) : "";
  };
  const matched = () => rows().filter((row) => rowPasses(row.dataset.ocStatus, filter, textOf(row), query));

  function paintChecks() {
    for (const row of rows()) {
      const on = selected.has(row.dataset.ocKey);
      row.setAttribute("aria-selected", on ? "true" : "false");
      const box = row.querySelector("[data-oc-select]");
      if (box) box.checked = on;
    }
    const keys = matched().map((row) => row.dataset.ocKey);
    const picked = keys.filter((key) => selected.has(key)).length;
    if (selectAll) {
      selectAll.checked = keys.length > 0 && picked === keys.length;
      selectAll.indeterminate = picked > 0 && picked < keys.length;
    }
    if (count) count.textContent = selected.size === 1 ? "1 selected" : `${selected.size} selected`;
    if (bulk) bulk.hidden = selected.size === 0;
  }

  function renderPager(current, last) {
    if (!pager) return;
    pager.replaceChildren();
    if (last <= 1) return;
    const add = (label, target, extra) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "oc-data-table-page";
      button.textContent = label;
      button.dataset.ocPage = String(target);
      if (extra?.current) button.setAttribute("aria-current", "page");
      if (extra?.disabled) button.disabled = true;
      if (extra?.label) button.setAttribute("aria-label", extra.label);
      pager.append(button);
    };
    add("«", 1, { disabled: current === 1, label: "First page" });
    add("‹", current - 1, { disabled: current === 1, label: "Previous page" });
    for (const item of pageItems(current, last)) {
      if (item === "…") {
        const span = document.createElement("span");
        span.className = "oc-data-table-ellipsis";
        span.textContent = "…";
        pager.append(span);
      } else add(String(item), item, { current: item === current });
    }
    add("›", current + 1, { disabled: current === last, label: "Next page" });
    add("»", last, { disabled: current === last, label: "Last page" });
  }

  function syncGrid(list) {
    let grid = root.querySelector(".oc-data-table-grid");
    if (!grid && frame) {
      grid = document.createElement("div");
      grid.className = "oc-data-table-grid";
      frame.append(grid);
    }
    if (!grid) return;
    const onPage = new Set(list.map((row) => row.dataset.ocKey));
    grid.replaceChildren();
    for (const row of rows()) {
      if (!onPage.has(row.dataset.ocKey)) continue;
      const card = document.createElement("article");
      card.className = "oc-data-table-card";
      card.dataset.ocKey = row.dataset.ocKey;
      const title = document.createElement("h3");
      title.className = "oc-data-table-card-title";
      const name = [...row.cells].find((td) => td.dataset.ocCol === "name") || [...row.cells].find((td) => td.dataset.ocCol && !SKIP_COL.has(td.dataset.ocCol));
      title.textContent = name ? name.textContent.trim() : row.dataset.ocKey;
      card.append(title);
      grid.append(card);
    }
  }

  function apply() {
    const all = rows();
    const list = matched();
    if (sortKey) {
      const th = [...table.tHead.rows[0].cells].find((cell) => cell.dataset.ocCol === sortKey);
      const numeric = th?.dataset.ocSort === "numeric" || th?.hasAttribute("data-numeric");
      const dir = sortDir === "desc" ? -1 : 1;
      list.sort((a, b) => dir * compareValues(valueOf(a, sortKey), valueOf(b, sortKey), numeric));
      const rest = all.filter((row) => !list.includes(row));
      for (const row of [...list, ...rest]) tbody.append(row);
    }
    const last = pageSize > 0 ? Math.max(1, Math.ceil(list.length / pageSize)) : 1;
    if (page > last - 1) page = Math.max(0, last - 1);
    const start = pageSize > 0 ? page * pageSize : 0;
    const visible = new Set((pageSize > 0 ? list.slice(start, start + pageSize) : list));
    for (const row of all) row.hidden = !visible.has(row);
    if (empty) empty.hidden = list.length !== 0;
    if (summary) {
      summary.textContent = list.length === 0
        ? "Showing 0 of 0"
        : `Showing ${start + 1}–${start + visible.size} of ${list.length}`;
    }
    if (sortSummary) {
      const label = sortKey ? table.querySelector(`th[data-oc-col="${sortKey}"] .oc-table-sort`)?.textContent?.trim() : "";
      sortSummary.textContent = label ? `Sorted by ${label}, ${sortDir === "asc" ? "ascending" : "descending"}` : "";
    }
    renderPager(page + 1, list.length === 0 ? 1 : last);
    syncGrid([...visible]);
    paintChecks();
  }

  function exportCsv(onlyKeys) {
    const hidden = new Set([...root.querySelectorAll("[data-col]:not(:checked)")].map((box) => box.dataset.col));
    const heads = [...table.tHead.rows[0].cells].filter((th, index) => {
      return th.dataset.ocCol && !SKIP_COL.has(th.dataset.ocCol) && !hidden.has(String(index + 1));
    });
    const source = onlyKeys
      ? rows().filter((row) => onlyKeys.has(row.dataset.ocKey))
      : matched();
    const body = source.map((row) => heads.map((th) => valueOf(row, th.dataset.ocCol)));
    download(`${id}.csv`, toCsv(heads.map((th) => th.textContent.trim()), body));
  }

  function emit(name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  // Live mode (the docs demo) changes the rows in the page. An app listens and updates its own data.
  function liveAction(action) {
    if (!live) return false;
    for (const key of selected) {
      const row = tbody.querySelector(`[data-oc-key="${CSS.escape(key)}"]`);
      if (!row) continue;
      if (action === "archive" && (row.dataset.ocStatus || "active") === "active") row.dataset.ocStatus = "deleted";
      if (action === "restore" && row.dataset.ocStatus === "deleted") row.dataset.ocStatus = "active";
      if (action === "delete") row.remove();
      if (action === "duplicate" && (row.dataset.ocStatus || "active") === "active") {
        const copy = row.cloneNode(true);
        copy.dataset.ocKey = `${key}-copy`;
        tbody.insertBefore(copy, row.nextSibling);
      }
    }
    selected.clear();
    apply();
    return true;
  }

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (target === search) {
      query = target.value.trim().toLowerCase();
      page = 0;
      apply();
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target === pageSelect) {
      pageSize = Number(target.value) || 0;
      page = 0;
      writeStore(id, "pageSize", pageSize);
      apply();
    }
    if (target.matches?.("[data-col]")) {
      const cols = {};
      root.querySelectorAll("[data-col]").forEach((box) => { cols[box.dataset.col] = box.checked; });
      writeStore(id, "cols", cols);
    }
    if (target.matches?.("[data-oc-select]")) {
      const row = target.closest("[data-oc-row]");
      if (!row || row.dataset.ocSelectable === "false") return;
      if (target.checked) selected.add(row.dataset.ocKey);
      else selected.delete(row.dataset.ocKey);
      paintChecks();
    }
    if (target === selectAll) {
      for (const row of matched()) {
        if (row.dataset.ocSelectable === "false") continue;
        if (target.checked) selected.add(row.dataset.ocKey);
        else selected.delete(row.dataset.ocKey);
      }
      paintChecks();
    }
    if (target.matches?.("[data-oc-file]")) {
      const file = target.files?.[0];
      if (file) emit("oc-datatable-import", { file });
      target.value = "";
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target === search) {
      emit("oc-datatable-search", { query: search.value });
    }
  });

  root.addEventListener("click", (event) => {
    const sortBtn = event.target.closest(".oc-table-sort");
    if (sortBtn && root.contains(sortBtn)) {
      const th = sortBtn.closest("th");
      if (!th?.dataset.ocCol) return;
      event.preventDefault();
      if (sortKey === th.dataset.ocCol) sortDir = sortDir === "asc" ? "desc" : "asc";
      else { sortKey = th.dataset.ocCol; sortDir = "asc"; }
      for (const head of table.tHead.rows[0].cells) head.removeAttribute("aria-sort");
      th.setAttribute("aria-sort", sortDir === "asc" ? "ascending" : "descending");
      page = 0;
      apply();
      return;
    }
    const filterBtn = event.target.closest("[data-oc-filter]");
    if (filterBtn && root.contains(filterBtn)) {
      filter = filterBtn.dataset.ocFilter;
      page = 0;
      root.querySelectorAll("[data-oc-filter]").forEach((btn) => {
        if (btn === filterBtn) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });
      apply();
      return;
    }
    const viewBtn = event.target.closest("[data-oc-view]");
    if (viewBtn && root.contains(viewBtn)) {
      const mode = viewBtn.dataset.ocView;
      root.classList.toggle("oc-data-table--grid", mode === "grid");
      root.querySelectorAll("[data-oc-view]").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === viewBtn ? "true" : "false");
      });
      writeStore(id, "view", mode);
      return;
    }
    const densityBtn = event.target.closest("[data-oc-density]");
    if (densityBtn && root.contains(densityBtn)) {
      const compact = densityBtn.dataset.ocDensity === "compact";
      root.classList.toggle("oc-data-table--compact", compact);
      writeStore(id, "density", compact ? "compact" : "comfortable");
      return;
    }
    const pageBtn = event.target.closest("[data-oc-page]");
    if (pageBtn && root.contains(pageBtn) && !pageBtn.disabled) {
      page = Number(pageBtn.dataset.ocPage) - 1;
      apply();
      return;
    }
    if (event.target.closest("[data-oc-export]")) {
      exportCsv(null);
      return;
    }
    if (event.target.closest("[data-oc-reset-widths]")) {
      for (const th of table.tHead.rows[0].cells) th.style.width = "";
      table.classList.remove("oc-data-table-table--sized");
      writeStore(id, "widths", {});
      return;
    }
    if (event.target.closest("[data-oc-import]")) {
      root.querySelector("[data-oc-file]")?.click();
      return;
    }
    const bulkBtn = event.target.closest("[data-oc-bulk]");
    if (bulkBtn && root.contains(bulkBtn)) {
      const action = bulkBtn.dataset.ocBulk;
      // Snapshot first: live mode clears the selection while it updates the rows.
      const keys = [...selected];
      if (action === "clear") { selected.clear(); paintChecks(); return; }
      if (action === "export") { exportCsv(selected); return; }
      liveAction(action);
      emit("oc-datatable-bulk", { action, keys });
      return;
    }
    // Row click opens data-oc-href, except when the click is on a control inside the row.
    if (event.target.closest("a, button, input, select, textarea, label")) return;
    const row = event.target.closest("[data-oc-row]");
    if (!row || !root.contains(row) || !row.dataset.ocHref) return;
    if (event.metaKey || event.ctrlKey) window.open(row.dataset.ocHref, "_blank", "noopener");
    else window.location.href = row.dataset.ocHref;
  });

  // Column resize: drag the handle on the header. Width is remembered per table id.
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
    const move = (ev) => {
      const width = Math.max(min, Math.round(startW + ev.clientX - startX));
      th.style.width = `${width}px`;
    };
    const up = () => {
      root.classList.remove("is-resizing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const widths = {};
      for (const head of table.tHead.rows[0].cells) if (head.style.width) widths[head.dataset.ocCol] = head.style.width;
      writeStore(id, "widths", widths);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });

  // Row drag starts from the grip only, so selecting text in a cell still works.
  let dragKey = "";
  root.addEventListener("pointerdown", (event) => {
    const grip = event.target.closest(".oc-sortable-row-grip");
    const row = grip?.closest("[data-oc-row]");
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
    emit("oc-datatable-reorder", { keys: rows().map((item) => item.dataset.ocKey) });
    apply();
  });
  root.addEventListener("dragend", () => {
    dragKey = "";
    for (const row of rows()) {
      row.draggable = false;
      row.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
    }
  });

  root.querySelectorAll("[data-oc-view]").forEach((btn) => {
    const on = (btn.dataset.ocView === "grid") === root.classList.contains("oc-data-table--grid");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });

  apply();
  controls.set(root, { apply });
}

/** Wire every table under scope that is not wired yet. */
export function initDataTables(scope = document) {
  scope.querySelectorAll(".oc-data-table").forEach((root) => bindDataTable(root));
}

// Starts on its own when loaded straight from a <script type="module"> tag: as /js/oc-data-table.js (the docs site,
// `npx omniaui copy-js`), with ?auto in the URL, or with data-oc-auto on the tag. An import from a bundler or a
// wrapper does not scan the page: call the init function yourself there.
function autoStart() {
  if (typeof document === "undefined") return false;
  const url = String(import.meta.url);
  if (url.includes("oc-data-table") || /[?&]auto(=|&|$)/.test(url)) return true;
  const file = url.split(/[?#]/)[0];
  return [...document.querySelectorAll("script[data-oc-auto][src]")].some((s) => s.src.split(/[?#]/)[0] === file);
}
if (autoStart()) {
  const boot = () => initDataTables(document);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
