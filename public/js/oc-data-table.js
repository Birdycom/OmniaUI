// File: packages/ui/src/data-table.js
// Map: page numbers -> compare -> csv -> row filter -> bind one table (search, column filters, sort, pages, columns, trash,
//      bulk, cards) -> server mode (state from the DOM, oc-datatable-query) -> updateDataTable / setDataTableSelection -> boot.
//      Column width and row drag are OmniaUI Pro (data-table-pro.js).
// The list table for business apps. Markup stays plain HTML.
// This script adds the behaviour. Excel, PDF and the real delete API stay in the app:
// listen for oc-datatable-bulk, oc-datatable-row, oc-datatable-search and oc-datatable-import.
// Server mode (0.17.0): data-oc-server="true" on the root. The rows in the page ARE the current page: the script does not
// filter, sort or slice them. It keeps the controls (sort headers, trash pills, search, pager, rows per page, column
// filters) and fires oc-datatable-query { reason, sort, dir, page, pageSize, search, trashed, filters } on every change;
// the app fetches and puts the new rows in, with data-oc-total (all matches) and data-oc-current-page (1-based) on the root, and
// calls updateDataTable(root, state) or bindDataTable(root) again. aria-busy="true" on the root = loading (no empty text).
// Selection is kept by key over pages: oc-datatable-selection { keys } on every change.
// Column chooser: checkboxes [data-oc-visible-col="key"] fire oc-datatable-columns { visible } (the app renders the columns).

/** Page numbers with ellipses, a window around the current page (current and last are 1-based). */
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
  // Texts the script writes itself (pager, selection count, sort line), translated with data-oc-labels on the root:
  // data-oc-labels='{"nextPage":"Volgende pagina","selected":"{n} geselecteerd"}' (0.17.0). Missing keys stay English.
  let T = {};
  try { T = JSON.parse(root.dataset.ocLabels || "{}"); } catch { T = {}; }
  const t = (key, fallback, vars = {}) => String(T[key] ?? fallback).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  // data-oc-no-grid: no card view (the table only), also not from a stored choice.
  const noGrid = root.hasAttribute("data-oc-no-grid");

  let query = "";
  let filter = root.querySelector("[data-oc-filter][aria-current='true']")?.dataset.ocFilter
    || (root.querySelector("[data-oc-filter]") ? "active" : "all");
  // Column filters: a <select data-oc-col-filter="type"> or tab buttons with data-oc-col-filter="type" data-oc-value="…".
  // A row passes when its cell in that column has that value (data-oc-value or its text); "" means all.
  const colFilters = new Map();
  root.querySelectorAll("select[data-oc-col-filter]").forEach((sel) => colFilters.set(sel.dataset.ocColFilter, sel.value));
  root.querySelectorAll("[data-oc-col-filter][aria-selected='true']").forEach((tab) => colFilters.set(tab.dataset.ocColFilter, tab.dataset.ocValue ?? ""));
  // aria-sort on a header in the HTML: that column is sorted when the table starts.
  const sortedTh = [...table.tHead.rows[0].cells].find((th) => th.dataset.ocCol && th.hasAttribute("aria-sort"));
  let sortKey = sortedTh ? sortedTh.dataset.ocCol : "";
  let sortDir = sortedTh?.getAttribute("aria-sort") === "descending" ? "desc" : "asc";
  let page = 0;
  let pageSize = Number(pageSelect?.value || root.dataset.pageSize || 15);
  const selected = new Set();
  // Server mode is read live, so a wrapper can switch it on later. The page attribute only wins when it changed: a click
  // on the pager moves at once and the app confirms it with the next data-oc-current-page.
  const server = () => root.dataset.ocServer === "true";
  let pageAttr;
  let searchTimer = 0;
  const searchDelay = () => {
    const n = Number(root.dataset.ocSearchDelay);
    return Number.isFinite(n) && n >= 0 ? n : 300;
  };

  // Remembered choices from the last visit: page size, density, view, hidden columns.
  const savedSize = readStore(id, "pageSize");
  // Server mode: the app owns the page size (it fetched that many rows), so no stored size.
  if (!server() && savedSize && pageSelect?.querySelector(`option[value="${savedSize}"]`)) {
    pageSelect.value = String(savedSize);
    pageSize = Number(savedSize);
  }
  if (readStore(id, "density") === "compact") root.classList.add("oc-data-table--compact");
  if (!noGrid && readStore(id, "view") === "grid") root.classList.add("oc-data-table--grid");
  const savedCols = readStore(id, "cols") || {};
  root.querySelectorAll("[data-col]").forEach((box) => {
    if (!box.disabled && savedCols[box.dataset.col] != null) box.checked = savedCols[box.dataset.col];
  });

  const rows = () => [...tbody.querySelectorAll("[data-oc-row]")];
  // Move a row to the end without taking it out of the page (Element.moveBefore), so <iconify-icon> and other web
  // components keep their content; where moveBefore is missing, append and let the icons draw again.
  // <iconify-icon> empties itself while its row is hidden (another page, another filter) and does not always draw
  // again when the row comes back: set its icon again so it renders.
  const redrawIcons = (row) => {
    row.querySelectorAll("iconify-icon[icon]").forEach((icon) => {
      if (icon.shadowRoot?.querySelector("svg")) return;
      const name = icon.getAttribute("icon");
      icon.removeAttribute("icon");
      icon.setAttribute("icon", name);
    });
  };
  const moveRow = (row) => {
    if (tbody.lastElementChild === row) return;
    if (typeof tbody.moveBefore === "function") { tbody.moveBefore(row, null); return; }
    tbody.append(row);
    redrawIcons(row);
  };
  const textOf = (row) => [...row.cells]
    .filter((td) => td.dataset.ocCol && !SKIP_COL.has(td.dataset.ocCol))
    .map((td) => td.dataset.ocValue || td.textContent)
    .join(" ");
  const valueOf = (row, key) => {
    const td = [...row.cells].find((cell) => cell.dataset.ocCol === key);
    return td ? (td.dataset.ocValue || td.textContent.trim()) : "";
  };
  const passesColumns = (row) => [...colFilters].every(([key, want]) => !want || valueOf(row, key) === want);
  // Server mode: every row in the page is a match (the server filtered them).
  const matched = () => (server() ? rows() : rows().filter((row) => rowPasses(row.dataset.ocStatus, filter, textOf(row), query) && passesColumns(row)));

  function emit(name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }
  const emitSelection = () => emit("oc-datatable-selection", { keys: [...selected] });

  /** Server mode: the state the app asked for, read from the markup (sort header, trash pill, page, rows per page). */
  function readServerState() {
    const sortedHead = [...table.tHead.rows[0].cells].find((th) => th.dataset.ocCol && th.hasAttribute("aria-sort") && th.getAttribute("aria-sort") !== "none");
    sortKey = sortedHead ? sortedHead.dataset.ocCol : "";
    sortDir = sortedHead?.getAttribute("aria-sort") === "descending" ? "desc" : "asc";
    const pill = root.querySelector("[data-oc-filter][aria-current='true']");
    if (pill) filter = pill.dataset.ocFilter;
    if (root.dataset.ocCurrentPage !== pageAttr) {
      pageAttr = root.dataset.ocCurrentPage;
      if (pageAttr != null) page = Math.max(0, (Number(pageAttr) || 1) - 1);
    }
    if (pageSelect && Number(pageSelect.value)) pageSize = Number(pageSelect.value);
  }

  /** Server mode: tell the app what to fetch. */
  function emitQuery(reason) {
    emit("oc-datatable-query", {
      reason,
      sort: sortKey || null,
      dir: sortDir,
      page: page + 1,
      pageSize,
      search: search ? search.value.trim() : "",
      trashed: filter,
      filters: Object.fromEntries(colFilters),
    });
  }

  /** Server mode: the rows stay as they are; only the summary, pager, empty text, cards and checks follow the state. */
  function applyServer() {
    readServerState();
    const all = rows();
    for (const row of all) {
      if (row.hidden) queueMicrotask(() => redrawIcons(row));
      row.hidden = false;
    }
    const busy = root.getAttribute("aria-busy") === "true";
    const total = Math.max(0, Number(root.dataset.ocTotal ?? all.length) || 0);
    const last = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const start = pageSize > 0 ? page * pageSize : 0;
    if (empty) empty.hidden = busy || all.length !== 0;
    if (summary) {
      const template = summary.dataset.ocSummary || t("summary", "Showing {from}–{to} of {total}");
      const values = { from: all.length ? start + 1 : 0, to: Math.min(total, start + all.length), total };
      summary.textContent = template.replace(/\{(from|to|total)\}/g, (_, key) => String(values[key]));
    }
    if (sortSummary) {
      const label = sortKey ? table.querySelector(`th[data-oc-col="${sortKey}"] .oc-table-sort`)?.textContent?.trim() : "";
      sortSummary.textContent = label ? t("sortedBy", "Sorted by {label}, {dir}", { label, dir: sortDir === "asc" ? t("ascending", "ascending") : t("descending", "descending") }) : "";
    }
    renderPager(Math.min(page + 1, last), total === 0 ? 1 : last);
    syncGrid(all);
    paintChecks();
  }

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
    if (count) count.textContent = t("selected", "{n} selected", { n: selected.size });
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
    add("«", 1, { disabled: current === 1, label: t("firstPage", "First page") });
    add("‹", current - 1, { disabled: current === 1, label: t("previousPage", "Previous page") });
    for (const item of pageItems(current, last)) {
      if (item === "…") {
        const span = document.createElement("span");
        span.className = "oc-data-table-ellipsis";
        span.textContent = "…";
        pager.append(span);
      } else add(String(item), item, { current: item === current });
    }
    add("›", current + 1, { disabled: current === last, label: t("nextPage", "Next page") });
    add("»", last, { disabled: current === last, label: t("lastPage", "Last page") });
  }

  function syncGrid(list) {
    if (noGrid) return;
    let grid = root.querySelector(".oc-data-table-grid");
    if (!grid && frame) {
      grid = document.createElement("div");
      grid.className = "oc-data-table-grid";
      frame.append(grid);
    }
    if (!grid) return;
    const onPage = new Set(list.map((row) => row.dataset.ocKey));
    const heads = [...table.tHead.rows[0].cells];
    const hiddenCols = new Set([...root.querySelectorAll("[data-col]:not(:checked)")].map((box) => box.dataset.col));
    grid.replaceChildren();
    for (const row of rows()) {
      if (!onPage.has(row.dataset.ocKey)) continue;
      const card = document.createElement("article");
      card.className = "oc-data-table-card";
      card.dataset.ocKey = row.dataset.ocKey;
      const cells = [...row.cells];
      const name = cells.find((td) => td.dataset.ocCol === "name") || cells.find((td) => td.dataset.ocCol && !SKIP_COL.has(td.dataset.ocCol));
      // Title: the rich name cell (avatar, badge, second line) when there is one, else its text.
      const title = document.createElement("div");
      title.className = "oc-data-table-card-title";
      if (name?.querySelector(".oc-data-table-name")) title.append(name.querySelector(".oc-data-table-name").cloneNode(true));
      else title.textContent = name ? name.textContent.trim() : row.dataset.ocKey;
      card.append(title);
      // The other visible columns as label / value.
      const fields = document.createElement("dl");
      fields.className = "oc-data-table-card-fields";
      cells.forEach((td, index) => {
        const col = td.dataset.ocCol;
        if (!col || td === name || SKIP_COL.has(col) || hiddenCols.has(String(index + 1))) return;
        const dt = document.createElement("dt");
        dt.textContent = heads[index]?.textContent.trim() || col;
        const dd = document.createElement("dd");
        dd.append(...[...td.childNodes].map((node) => node.cloneNode(true)));
        if (dd.textContent.trim()) fields.append(dt, dd);
      });
      if (fields.childElementCount) card.append(fields);
      // Row actions (buttons and links; popover ids are not copied).
      const actions = cells.find((td) => td.dataset.ocCol === "actions");
      if (actions?.children.length) {
        const bar = document.createElement("div");
        bar.className = "oc-data-table-card-actions";
        const trashed = row.dataset.ocStatus === "deleted";
        for (const el of actions.querySelectorAll("button, a")) {
          const when = el.closest("[data-oc-when]")?.dataset.ocWhen;
          if (when && (when === "deleted") !== trashed) continue;
          const copy = el.cloneNode(true);
          copy.removeAttribute("id");
          copy.removeAttribute("popovertarget");
          bar.append(copy);
        }
        card.append(bar);
      }
      grid.append(card);
    }
  }

  function apply() {
    if (server()) {
      applyServer();
      return;
    }
    const all = rows();
    const list = matched();
    if (sortKey) {
      const th = [...table.tHead.rows[0].cells].find((cell) => cell.dataset.ocCol === sortKey);
      const numeric = th?.dataset.ocSort === "numeric" || th?.hasAttribute("data-numeric");
      const dir = sortDir === "desc" ? -1 : 1;
      list.sort((a, b) => dir * compareValues(valueOf(a, sortKey), valueOf(b, sortKey), numeric));
      const rest = all.filter((row) => !list.includes(row));
      for (const row of [...list, ...rest]) moveRow(row);
    }
    const last = pageSize > 0 ? Math.max(1, Math.ceil(list.length / pageSize)) : 1;
    if (page > last - 1) page = Math.max(0, last - 1);
    const start = pageSize > 0 ? page * pageSize : 0;
    const visible = new Set((pageSize > 0 ? list.slice(start, start + pageSize) : list));
    for (const row of all) {
      const shown = visible.has(row);
      if (row.hidden && shown) queueMicrotask(() => redrawIcons(row));
      row.hidden = !shown;
    }
    if (empty) empty.hidden = list.length !== 0;
    if (summary) {
      // data-oc-summary="Toont {from} t/m {to} van {total} resultaten" translates the line; empty = English.
      const template = summary.dataset.ocSummary || t("summary", "Showing {from}–{to} of {total}");
      const values = { from: list.length ? start + 1 : 0, to: start + visible.size, total: list.length };
      summary.textContent = template.replace(/\{(from|to|total)\}/g, (_, key) => String(values[key]));
    }
    if (sortSummary) {
      const label = sortKey ? table.querySelector(`th[data-oc-col="${sortKey}"] .oc-table-sort`)?.textContent?.trim() : "";
      sortSummary.textContent = label ? t("sortedBy", "Sorted by {label}, {dir}", { label, dir: sortDir === "asc" ? t("ascending", "ascending") : t("descending", "descending") }) : "";
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
    emitSelection();
    return true;
  }

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (target === search) {
      query = target.value.trim().toLowerCase();
      page = 0;
      if (server()) {
        // Wait until the typing stops (data-oc-search-delay, default 300 ms), then ask the app once.
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => { page = 0; emitQuery("search"); apply(); }, searchDelay());
        return;
      }
      apply();
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target === pageSelect) {
      pageSize = Number(target.value) || 0;
      page = 0;
      writeStore(id, "pageSize", pageSize);
      if (server()) emitQuery("pageSize");
      apply();
    }
    if (target.matches?.("select[data-oc-col-filter]")) {
      colFilters.set(target.dataset.ocColFilter, target.value);
      page = 0;
      if (server()) emitQuery("filter");
      apply();
    }
    if (target.matches?.("[data-oc-visible-col]")) {
      // Column chooser: the app shows the columns (React/Vue/Livewire render only the visible ones).
      const visible = [...root.querySelectorAll("[data-oc-visible-col]")].filter((box) => box.checked).map((box) => box.dataset.ocVisibleCol);
      emit("oc-datatable-columns", { visible, key: target.dataset.ocVisibleCol, checked: target.checked });
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
      emitSelection();
    }
    if (target === selectAll) {
      for (const row of matched()) {
        if (row.dataset.ocSelectable === "false") continue;
        if (target.checked) selected.add(row.dataset.ocKey);
        else selected.delete(row.dataset.ocKey);
      }
      paintChecks();
      emitSelection();
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
      // Server mode: Enter does not wait for the typing delay.
      if (server() && searchTimer) {
        clearTimeout(searchTimer);
        searchTimer = 0;
        page = 0;
        emitQuery("search");
        apply();
      }
    }
  });

  root.addEventListener("click", (event) => {
    // The whole header cell sorts, not only its label (wide columns leave a lot of empty cell around the label).
    const headCell = event.target.closest("thead th");
    const sortBtn = event.target.closest(".oc-table-sort")
      || (headCell && !event.target.closest("a, button, input, select, label, .oc-data-table-resize") ? headCell.querySelector(".oc-table-sort") : null);
    if (sortBtn && root.contains(sortBtn)) {
      const th = sortBtn.closest("th");
      if (!th?.dataset.ocCol) return;
      event.preventDefault();
      if (sortKey === th.dataset.ocCol) sortDir = sortDir === "asc" ? "desc" : "asc";
      else { sortKey = th.dataset.ocCol; sortDir = "asc"; }
      for (const head of table.tHead.rows[0].cells) head.removeAttribute("aria-sort");
      th.setAttribute("aria-sort", sortDir === "asc" ? "ascending" : "descending");
      page = 0;
      if (server()) emitQuery("sort");
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
      if (server()) emitQuery("trashed");
      apply();
      return;
    }
    // Per-row actions of a trashed row: data-oc-row-action="restore" or "delete" fires oc-datatable-row { action, key };
    // in the demo (data-oc-live) restore makes the row active again and delete removes it.
    const rowBtn = event.target.closest("[data-oc-row-action]");
    if (rowBtn && root.contains(rowBtn)) {
      const row = rowBtn.closest("[data-oc-row]");
      if (!row) return;
      const action = rowBtn.dataset.ocRowAction;
      emit("oc-datatable-row", { action, key: row.dataset.ocKey });
      if (live && action === "restore") row.dataset.ocStatus = "active";
      if (live && action === "delete") { selected.delete(row.dataset.ocKey); row.remove(); }
      apply();
      return;
    }
    // The sliders button next to the title shows or hides the filter row.
    const filtersBtn = event.target.closest("[data-oc-filters-toggle]");
    if (filtersBtn && root.contains(filtersBtn)) {
      const row = root.querySelector(".oc-data-table-filters");
      if (row) {
        row.hidden = !row.hidden;
        filtersBtn.setAttribute("aria-expanded", row.hidden ? "false" : "true");
      }
      return;
    }
    const colTab = event.target.closest("button[data-oc-col-filter]");
    if (colTab && root.contains(colTab)) {
      const key = colTab.dataset.ocColFilter;
      colFilters.set(key, colTab.dataset.ocValue ?? "");
      root.querySelectorAll(`button[data-oc-col-filter="${key}"]`).forEach((tab) => {
        tab.setAttribute("aria-selected", tab === colTab ? "true" : "false");
      });
      page = 0;
      if (server()) emitQuery("filter");
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
    const pageBtn = event.target.closest("button[data-oc-page]");
    if (pageBtn && root.contains(pageBtn) && !pageBtn.disabled) {
      page = Number(pageBtn.dataset.ocPage) - 1;
      if (server()) emitQuery("page");
      apply();
      return;
    }
    if (event.target.closest("[data-oc-export]")) {
      exportCsv(null);
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
      if (action === "clear") { selected.clear(); paintChecks(); emitSelection(); return; }
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

  // OmniaUI Pro (data-table-pro.js) changes the rows (drag) and asks the table to show them again.
  root.addEventListener("oc-datatable-refresh", () => apply());

  // Column widths from all rows (every page, also the trash), measured before the first page is shown, so the header
  // does not jump when sorting or paging brings other rows. Pro column resizing sets its own widths.
  for (const th of table.tHead.rows[0].cells) {
    const width = th.getBoundingClientRect().width;
    if (width && !th.style.width) th.style.minWidth = `${Math.ceil(width)}px`;
  }

  root.querySelectorAll("[data-oc-view]").forEach((btn) => {
    const on = (btn.dataset.ocView === "grid") === root.classList.contains("oc-data-table--grid");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });

  apply();
  controls.set(root, {
    apply,
    // Replace the selection (a controlled selectedKeys); no event, the caller already knows.
    setSelection(keys) {
      selected.clear();
      for (const key of keys || []) selected.add(String(key));
      paintChecks();
    },
    getSelection: () => [...selected],
  });
}

/** The selected row keys of a wired table (kept over pages and filters). */
export function getDataTableSelection(root) {
  return controls.get(root)?.getSelection() ?? [];
}

/** Set the selected row keys of a wired table (selection over pages: keys that are not on this page stay selected). */
export function setDataTableSelection(root, keys) {
  if (!root) return;
  if (!controls.get(root)) bindDataTable(root);
  controls.get(root)?.setSelection(keys);
}

/**
 * Server mode helper for plain HTML / Blade: put the state the server answered on the table and show it again.
 * state: { total, page (1-based), sort (column key or null), dir ("asc" | "desc"), trashed, loading, selected }.
 * Replace the <tbody> rows yourself first (each tr[data-oc-row][data-oc-key]).
 */
export function updateDataTable(root, state = {}) {
  if (!root) return;
  root.dataset.ocServer = root.dataset.ocServer || "true";
  if (state.total != null) root.dataset.ocTotal = String(state.total);
  if (state.page != null) root.dataset.ocCurrentPage = String(state.page);
  if (state.loading != null) {
    if (state.loading) root.setAttribute("aria-busy", "true");
    else root.removeAttribute("aria-busy");
  }
  const head = root.querySelector("table")?.tHead?.rows[0];
  if (head && "sort" in state) {
    for (const th of head.cells) {
      if (!th.dataset.ocCol) continue;
      if (state.sort && th.dataset.ocCol === state.sort) th.setAttribute("aria-sort", state.dir === "desc" ? "descending" : "ascending");
      else th.removeAttribute("aria-sort");
    }
  }
  if (state.trashed) {
    root.querySelectorAll("[data-oc-filter]").forEach((btn) => {
      if (btn.dataset.ocFilter === state.trashed) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }
  bindDataTable(root);
  if (state.selected) setDataTableSelection(root, state.selected);
}

/** Wire every table under scope that is not wired yet (also the data table block: [data-oc-data-table]). */
export function initDataTables(scope = document) {
  scope.querySelectorAll(".oc-data-table, [data-oc-data-table]").forEach((root) => bindDataTable(root));
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
