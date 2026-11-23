<!-- File: packages/vue/src/components/OcDataTable.vue | Map: props -> server state (page, sort, search, trash, columns, selection) -> markup (tabs, toolbar, filters, table with skeleton rows, footer) -> bind the list-table script, query events -> emits -->
<script setup lang="ts">
/**
 * List table for business apps. Same markup as packages/ui/snippets/data-table.html.
 * Search, column filters, sort, pages, columns, resize, drag and bulk actions come from data-table.js.
 * Listen on the root for oc-datatable-bulk, oc-datatable-reorder, oc-datatable-search, oc-datatable-import.
 * Slots: cell-<key> ({ row }) for a rich cell (an OcDataTableName, a badge …), actions ({ row }) for the row buttons
 * (default: one soft edit button), page-actions for the toolbar (New customer …).
 * @reorder (keys, { key, server }) (v0.17.1): a row was dropped; the drag itself is OmniaUI Pro (data-table-pro.js).
 * In server mode the script does not move the row: save the order and pass the rows again.
 * Icons of tabs and filters are webicon names (mdi:account-outline …), drawn as inline SVG (OcWebicon).
 *
 * Server mode (0.17.0): `server` + `total`; `rows` is the current page from your API. The table does not filter, sort or
 * slice; every control emits instead: v-model:page (1-based), v-model:page-size, v-model:sort ({ key, dir } | null),
 * v-model:search (after search-delay, default 300 ms), v-model:trashed, column-filter (column, value) and query (all at
 * once, handy for one fetch). loading: skeleton rows + aria-busy. Slot empty: the text when there are no rows.
 * Column chooser (free): v-model:visible-columns (keys); a columns button in the actions header, unchecked columns are
 * not rendered (hideable false always shows). v-model:selected-keys: the selection, kept over pages.
 */
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { bindDataTable, setDataTableSelection } from '../../../ui/src/data-table.js'
import OcWebicon from './OcWebicon.vue'

export interface DataTableColumn {
  key: string
  header: string
  numeric?: boolean
  sortable?: boolean
  hideable?: boolean
  defaultHidden?: boolean
  /** Cut long text with an ellipsis at this width (e.g. "12rem"); the full text goes in the title. */
  truncate?: string
  /** Sort the table on this column when it starts. */
  defaultSort?: 'ascending' | 'descending'
  /** Hide the column (th and tds, data-hide-below) when the table is narrower than 24rem (sm), 32rem (md) or 48rem (lg). */
  hideBelow?: 'sm' | 'md' | 'lg'
}
export interface DataTableRow {
  key: string
  status?: 'active' | 'deleted' | 'archived'
  cells: Record<string, string>
  /** Sort, filter, search and export value when it differs from the visible text. */
  values?: Record<string, string>
  href?: string
}
export interface DataTableTabs {
  column: string
  label?: string
  /** tone colors the count like the type badge in the table. */
  items: { value: string; label: string; icon?: string; count?: number; tone?: 'success' | 'info' | 'warning' }[]
}
export interface DataTableColumnFilter {
  column: string
  label: string
  icon?: string
  options: { value: string; label: string }[]
}
/** The sorted column in server mode. */
export interface DataTableSort {
  key: string
  dir: 'asc' | 'desc'
}
export type DataTableTrashed = 'active' | 'all' | 'deleted' | 'archived'
/** Everything the server needs for one page (the query event). page is 1-based. */
export interface DataTableQuery {
  reason: 'sort' | 'page' | 'pageSize' | 'search' | 'trashed' | 'filter'
  sort: string | null
  dir: 'asc' | 'desc'
  page: number
  pageSize: number
  search: string
  trashed: DataTableTrashed
  filters: Record<string, string>
}

const props = withDefaults(
  defineProps<{
    tableId?: string
    title?: string
    columns: DataTableColumn[]
    rows: DataTableRow[]
    pageSize?: number
    searchPlaceholder?: string
    selectable?: boolean
    /** Grip column to drag rows; the drag is OmniaUI Pro (data-table-pro.js). */
    draggable?: boolean
    /** Handles to drag a column width; the resize is OmniaUI Pro (data-table-pro.js). */
    resizable?: boolean
    /** Column chooser in the actions header (show or hide columns). Needs the OmniaUI Pro CSS. */
    columnMenu?: boolean
    filters?: boolean
    archive?: boolean
    tabs?: DataTableTabs
    columnFilters?: DataTableColumnFilter[]
    /** Footer count, e.g. "Showing {from}–{to} of {total} customers". */
    summary?: string
    /** Offer "Import CSV" in the settings (fires oc-datatable-import with the file). */
    importable?: boolean
    /** 'bordered' = version 2: tinted header, lines between the columns, sort chevrons always visible. */
    variant?: 'default' | 'bordered'
    /** Striped rows (default true). */
    striped?: boolean
    live?: boolean
    /** Texts in another language (any subset; the rest stays English). See DataTableLabels. */
    labels?: Record<string, string>
    /** false: no table / cards switch. */
    view?: boolean
    /** false: every row on one page, no pager (a report to print). */
    pagination?: boolean
    /** The selection bar and the selection items of the list menu (default: as filters). */
    bulk?: boolean
    /** Server mode (0.17.0): rows is the current page; the controls emit instead of filtering, sorting and slicing. */
    server?: boolean
    /** Server mode: all matches on the server, for the pager and the "Showing" line. */
    total?: number
    /** Server mode: the current page, 1-based (v-model:page). */
    page?: number
    /** The sorted column (v-model:sort): { key, dir } or null. Without it: the columns' defaultSort. */
    sort?: DataTableSort | null
    /** Text in the search field (v-model:search). */
    search?: string
    /** Server mode: wait this long after the last key (ms). Default 300. */
    searchDelay?: number
    /** The trash pill that is on (v-model:trashed). Default "active". */
    trashed?: DataTableTrashed
    /** Skeleton rows instead of the rows, and aria-busy. */
    loading?: boolean
    /** Number of skeleton rows (default: the page size). */
    skeletonRows?: number
    /** Column chooser: the keys of the visible columns (v-model:visible-columns). */
    visibleColumns?: string[]
    /** The selected row keys (v-model:selected-keys), kept over pages. */
    selectedKeys?: string[]
  }>(),
  { title: 'List', pageSize: 15, searchPlaceholder: 'Search...', selectable: true, draggable: false, resizable: false, columnMenu: false, filters: true, archive: true, summary: '', importable: false, variant: 'default', striped: true, live: false, view: true, pagination: true, bulk: undefined, server: false, total: undefined, page: undefined, sort: undefined, search: undefined, searchDelay: undefined, trashed: undefined, loading: false, skeletonRows: undefined, visibleColumns: undefined, selectedKeys: undefined },
)
const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'update:sort': [sort: DataTableSort | null]
  'update:search': [search: string]
  'update:trashed': [trashed: DataTableTrashed]
  'update:visibleColumns': [keys: string[]]
  'update:selectedKeys': [keys: string[]]
  'column-filter': [column: string, value: string]
  query: [query: DataTableQuery]
  bulk: [action: string, keys: string[]]
  /** v0.17.1: a row was dropped (drag = OmniaUI Pro data-table-pro.js); keys in the new order. Server mode: render again. */
  reorder: [keys: string[], detail: { key?: string; server?: boolean }]
}>()
const L = computed(() => ({ ...DATA_TABLE_EN, ...props.labels }) as typeof DATA_TABLE_EN)
const fill = (s: string, name: unknown) => s.replace('{name}', String(name))
const showBulk = computed(() => props.bulk ?? props.filters)
const SCRIPT_KEYS = ['selected', 'summary', 'firstPage', 'previousPage', 'nextPage', 'lastPage', 'sortedBy', 'ascending', 'descending'] as const
const scriptLabels = computed(() => {
  const l = props.labels
  if (!l) return undefined
  const picked = Object.fromEntries(SCRIPT_KEYS.filter((k) => l[k] != null).map((k) => [k, l[k]]))
  return Object.keys(picked).length ? JSON.stringify(picked) : undefined
})

/** Every text of the table in English; pass `labels` with any subset in another language (0.17.0). */
const DATA_TABLE_EN = {
  listActions: 'List actions', exportCsv: 'Export CSV', importCsv: 'Import CSV', duplicateSelection: 'Duplicate selection',
  trashSelection: 'Move selection to trash', comfortable: 'Comfortable rows', compact: 'Compact rows', search: 'Search {name}',
  trashFilter: 'Trash filter', activeOnly: 'Active only', includingTrash: 'Including trash', trashOnly: 'Trash only',
  archiveOnly: 'Archive only', view: 'View', table: 'Table', cards: 'Cards', columns: 'Columns', resetWidths: 'Reset column widths',
  selected: '{n} selected', exportSelection: 'Export selection', duplicate: 'Duplicate', moveToTrash: 'Move to trash',
  restore: 'Restore', deletePermanently: 'Delete permanently', clear: 'Clear', selectAll: 'Select all', select: 'Select {name}',
  order: 'Order', move: 'Move {name}', resize: 'Resize {name}', actions: 'Actions', noResults: 'No results',
  summary: 'Showing {from}–{to} of {total}', rowsPerPage: 'Rows per page', pagination: 'Pagination', firstPage: 'First page',
  previousPage: 'Previous page', nextPage: 'Next page', lastPage: 'Last page', sortedBy: 'Sorted by {label}, {dir}',
  ascending: 'ascending', descending: 'descending', edit: 'Edit {name}',
}
const root = useTemplateRef<HTMLElement>('root')
const sizes = [...new Set([10, 15, 20, 50, 100, props.pageSize])].sort((a, b) => a - b)
const lead = (props.selectable ? 1 : 0) + (props.draggable ? 1 : 0)
const id = props.tableId || `oc-dt-${Math.random().toString(36).slice(2, 8)}`
const label = (row: DataTableRow) => row.values?.name ?? row.cells.name ?? row.key

// Server state (0.17.0): the page is v-model:page or kept here; the column chooser likewise.
const innerPage = ref(1)
const currentPage = computed(() => props.page ?? innerPage.value)
const picker = computed(() => props.visibleColumns !== undefined)
const visible = computed(() => props.visibleColumns ?? props.columns.filter((c) => !c.defaultHidden).map((c) => c.key))
const shown = computed(() => (picker.value ? props.columns.filter((c) => c.hideable === false || visible.value.includes(c.key)) : props.columns))
const toggleColumn = (key: string, on: boolean) => {
  emit('update:visibleColumns', props.columns.map((c) => c.key).filter((k) => (k === key ? on : visible.value.includes(k))))
}
const ariaSort = (col: DataTableColumn) => {
  if (props.sort === undefined) return col.defaultSort
  return props.sort && props.sort.key === col.key ? (props.sort.dir === 'desc' ? 'descending' : 'ascending') : undefined
}
const pill = (value: DataTableTrashed) => ((props.trashed ?? 'active') === value ? 'true' : undefined)
const skeletons = computed(() => (props.loading ? Array.from({ length: props.skeletonRows ?? (props.pagination && props.pageSize > 0 ? props.pageSize : 5) }, (_, i) => i) : []))
let lastFilters: Record<string, string> = {}

function onQuery(event: Event) {
  const q = (event as CustomEvent<DataTableQuery>).detail
  emit('query', q)
  if (q.reason === 'sort') emit('update:sort', q.sort ? { key: q.sort, dir: q.dir } : null)
  if (q.reason === 'search') emit('update:search', q.search)
  if (q.reason === 'trashed') emit('update:trashed', q.trashed)
  if (q.reason === 'pageSize') emit('update:pageSize', q.pageSize)
  if (q.reason === 'filter') {
    for (const [key, value] of Object.entries(q.filters)) if ((lastFilters[key] ?? '') !== value) emit('column-filter', key, value)
  }
  lastFilters = { ...q.filters }
  if (q.page !== currentPage.value) {
    if (props.page === undefined) innerPage.value = q.page
    emit('update:page', q.page)
  }
}

onMounted(() => {
  const el = root.value
  if (!el) return
  const input = el.querySelector<HTMLInputElement>('.oc-data-table-search')
  if (input && props.search) input.value = props.search
  bindDataTable(el)
  el.addEventListener('oc-datatable-query', onQuery)
  el.addEventListener('oc-datatable-selection', (e) => emit('update:selectedKeys', (e as CustomEvent<{ keys: string[] }>).detail.keys))
  el.addEventListener('oc-datatable-bulk', (e) => {
    const d = (e as CustomEvent<{ action: string; keys: string[] }>).detail
    emit('bulk', d.action, d.keys)
  })
  el.addEventListener('oc-datatable-reorder', (e) => {
    const { keys, key, server } = (e as CustomEvent<{ keys: string[]; key?: string; server?: boolean }>).detail
    emit('reorder', keys, { key, server })
  })
  if (props.selectedKeys) setDataTableSelection(el, props.selectedKeys)
})
// Bind again after the rows or the server state changed (after the DOM update): the script keeps the selection.
watch(
  () => [props.rows, props.columns, props.server, currentPage.value, props.total, props.sort, props.trashed, props.loading, shown.value.length],
  () => { if (root.value) bindDataTable(root.value) },
  { flush: 'post' },
)
watch(() => props.search, (value) => {
  const input = root.value?.querySelector<HTMLInputElement>('.oc-data-table-search')
  if (input && value !== undefined && input.value !== value) input.value = value
})
watch(() => props.pageSize, (value) => {
  const select = root.value?.querySelector<HTMLSelectElement>('[data-oc-page-size]')
  if (props.server && select && select.value !== String(value)) select.value = String(value)
})
watch(() => props.selectedKeys, (keys) => { if (keys && root.value) setDataTableSelection(root.value, keys) })
</script>

<template>
  <div ref="root" :class="['oc-data-table', variant === 'bordered' && 'oc-data-table--bordered', !striped && 'oc-data-table--plain', columnMenu && 'oc-column-menu-scope']" :id="id" :data-page-size="pagination ? pageSize : 0" :data-oc-live="live ? 'true' : undefined" :data-oc-labels="scriptLabels" :data-oc-no-grid="view ? undefined : ''" :data-oc-server="server ? 'true' : undefined" :data-oc-total="server ? (total ?? rows.length) : undefined" :data-oc-current-page="server ? currentPage : undefined" :data-oc-search-delay="searchDelay" :aria-busy="loading ? 'true' : undefined">
    <div v-if="tabs" class="oc-tab-list oc-data-table-tabs" role="tablist" :aria-label="tabs.label ?? 'Filter'">
      <button
        v-for="(tab, i) in tabs.items"
        :key="tab.value"
        class="oc-tab-trigger"
        role="tab"
        type="button"
        :data-oc-col-filter="tabs.column"
        :data-oc-value="tab.value"
        :aria-selected="i === 0 ? 'true' : 'false'"
      ><OcWebicon v-if="tab.icon" :name="tab.icon" bare fallback="iconify" />{{ tab.label }}<span v-if="tab.count != null" :class="['oc-data-table-tab-count', tab.tone && `oc-data-table-tab-count--${tab.tone}`]">{{ tab.count }}</span></button>
    </div>
    <div class="oc-data-table-toolbar">
      <div class="oc-data-table-heading">
        <span class="oc-data-table-title">{{ title }}</span>
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" :popovertarget="`${id}-menu`" :aria-label="L.listActions" :title="L.listActions"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 13c-1.86 0-3.41 1.28-3.86 3H2v2h2.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22v-2H11.86c-.45-1.72-2-3-3.86-3m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M19.86 6c-.45-1.72-2-3-3.86-3s-3.41 1.28-3.86 3H2v2h10.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22V6zM16 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2" /></svg></button>
        <div class="oc-dropdown-menu" :id="`${id}-menu`" popover>
          <button class="oc-dropdown-item" type="button" data-oc-export>{{ L.exportCsv }}</button>
          <template v-if="importable">
            <button class="oc-dropdown-item" type="button" data-oc-import>{{ L.importCsv }}</button>
            <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
          </template>
          <button v-if="showBulk" class="oc-dropdown-item" type="button" data-oc-bulk="duplicate">{{ L.duplicateSelection }}</button>
          <button v-if="showBulk" class="oc-dropdown-item" type="button" data-oc-bulk="archive">{{ L.trashSelection }}</button>
          <div class="oc-dropdown-separator"></div>
          <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">{{ L.comfortable }}</button>
          <button class="oc-dropdown-item" type="button" data-oc-density="compact">{{ L.compact }}</button>
        </div>
      </div>
      <input class="oc-input oc-data-table-search" type="search" :placeholder="searchPlaceholder" :aria-label="fill(L.search, title)">
      <div v-if="filters" class="oc-filter-pills" role="group" :aria-label="L.trashFilter">
        <button class="oc-filter-pill" type="button" data-oc-filter="active" :aria-current="pill('active')">{{ L.activeOnly }}</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="all" :aria-current="pill('all')">{{ L.includingTrash }}</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="deleted" :aria-current="pill('deleted')">{{ L.trashOnly }}</button>
        <button v-if="archive" class="oc-filter-pill" type="button" data-oc-filter="archived" :aria-current="pill('archived')">{{ L.archiveOnly }}</button>
      </div>
      <div v-if="view" class="oc-data-table-view" role="group" :aria-label="L.view">
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true" :aria-label="L.table"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5" /></svg></button>
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="grid" :aria-label="L.cards"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z" /></svg></button>
      </div>
      <div v-if="$slots['page-actions']" class="oc-data-table-actions"><slot name="page-actions" /></div>
      <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    <div v-if="columnFilters?.length" :id="`${id}-filters`" class="oc-data-table-filters">
      <label v-for="f in columnFilters" :key="f.column" class="oc-data-table-filter">
        <OcWebicon v-if="f.icon" :name="f.icon" bare fallback="iconify" />
        <template v-else><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z" /></svg></template>
        <select class="oc-select" :data-oc-col-filter="f.column" :aria-label="f.label">
          <option v-for="o in f.options" :key="o.value" :value="o.value" :selected="o.value === ''">{{ o.label }}</option>
        </select>
      </label>
    </div>
    <div v-if="picker" class="oc-dropdown-menu oc-data-table-colpick" :id="`${id}-colpick`" popover>
      <p class="oc-data-table-colpick-title">{{ L.columns }}</p>
      <label v-for="col in columns" :key="col.key" class="oc-dropdown-item">
        <input type="checkbox" :data-oc-visible-col="col.key" :checked="col.hideable === false || visible.includes(col.key)" :disabled="col.hideable === false" @change="toggleColumn(col.key, ($event.target as HTMLInputElement).checked)"> {{ col.header }}
      </label>
    </div>
    <div v-if="columnMenu && !picker" class="oc-column-menu" :id="`${id}-columns`" popover>
      <p class="oc-column-menu-title">{{ L.columns }}</p>
      <template v-if="resizable">
        <button class="oc-dropdown-item" type="button" data-oc-reset-widths>{{ L.resetWidths }}</button>
        <div class="oc-dropdown-separator"></div>
      </template>
      <form class="oc-column-menu-list">
        <template v-for="(col, index) in columns" :key="col.key">
          <label v-if="col.hideable !== false" class="oc-column-menu-item">
            <input type="checkbox" :data-col="lead + index + 1" :checked="!col.defaultHidden"> {{ col.header }}
          </label>
        </template>
      </form>
    </div>
    <div v-if="showBulk" class="oc-data-table-bulk" hidden>
      <span data-oc-selected-count>{{ L.selected.replace('{n}', '0') }}</span>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export">{{ L.exportSelection }}</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="duplicate">{{ L.duplicate }}</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="archive">{{ L.moveToTrash }}</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="restore">{{ L.restore }}</button>
      <button class="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete">{{ L.deletePermanently }}</button>
      <button class="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="clear">{{ L.clear }}</button>
    </div>
    <div class="oc-data-table-frame">
      <div class="oc-data-table-scroll">
        <table class="oc-table oc-data-table-table">
          <thead>
            <tr>
              <th v-if="selectable" data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select-all :aria-label="L.selectAll"></th>
              <th v-if="draggable" data-oc-col="order"><span class="oc-visually-hidden">{{ L.order }}</span></th>
              <th v-for="col in shown" :key="col.key" :data-oc-col="col.key" :data-oc-sort="col.numeric ? 'numeric' : 'text'" :data-numeric="col.numeric ? '' : undefined" :data-hide-below="col.hideBelow" :aria-sort="ariaSort(col)">
                <span class="oc-data-table-th">
                  <button v-if="col.sortable !== false" class="oc-table-sort" type="button">{{ col.header }}</button>
                  <template v-else>{{ col.header }}</template>
                  <span v-if="resizable" class="oc-data-table-resize" role="separator" aria-orientation="vertical" :aria-label="fill(L.resize, col.header)"></span>
                </span>
              </th>
              <th data-oc-col="actions">
                <span class="oc-data-table-th">{{ L.actions }}<button v-if="columnMenu || picker" class="oc-btn oc-btn--plain oc-data-table-columns-btn" type="button" :popovertarget="picker ? `${id}-colpick` : `${id}-columns`" :aria-label="L.columns" :title="L.columns"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5v13h17V5zm10 2v9h-3V7zM6 7h3v9H6zm13 9h-3V7h3z" /></svg></button></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in skeletons" :key="`oc-skeleton-${i}`" class="oc-data-table-skeleton" aria-hidden="true">
              <td v-if="selectable" data-oc-col="select"><span class="oc-skeleton oc-data-table-skeleton-box"></span></td>
              <td v-if="draggable" data-oc-col="order"></td>
              <td v-for="col in shown" :key="col.key" :data-numeric="col.numeric ? '' : undefined" :data-hide-below="col.hideBelow"><span class="oc-skeleton oc-data-table-skeleton-bar"></span></td>
              <td data-oc-col="actions"></td>
            </tr>
            <tr v-for="row in (loading ? [] : rows)" :key="row.key" data-oc-row :data-oc-key="row.key" :data-oc-status="row.status || 'active'" :data-oc-href="row.href">
              <td v-if="selectable" data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select :aria-label="fill(L.select, label(row))"></td>
              <td v-if="draggable" data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" :aria-label="fill(L.move, label(row))"></button></td>
              <td v-for="col in shown" :key="col.key" :data-oc-col="col.key" :data-numeric="col.numeric ? '' : undefined" :data-hide-below="col.hideBelow" :data-oc-value="row.values?.[col.key]">
                <slot :name="`cell-${col.key}`" :row="row">
                  <span v-if="col.truncate" class="oc-data-table-truncate" :style="{ '--oc-data-table-truncate': col.truncate }" :title="row.cells[col.key]">{{ row.cells[col.key] ?? '' }}</span>
                  <template v-else>{{ row.cells[col.key] ?? '' }}</template>
                </slot>
              </td>
              <td data-oc-col="actions">
                <div style="display: flex; gap: 0.375rem; justify-content: flex-end">
                  <slot name="actions" :row="row">
                    <button class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" type="button" :aria-label="fill(L.edit, label(row))" :title="fill(L.edit, '').trim()"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z" /></svg></button>
                  </slot>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="$slots.empty" class="oc-data-table-empty" hidden><slot name="empty" /></div>
      <p v-else class="oc-data-table-empty" hidden>{{ L.noResults }}</p>
    </div>
    <div class="oc-data-table-footer">
      <p class="oc-data-table-summary" :data-oc-summary="summary || labels?.summary || ''"></p>
      <label v-if="pagination" class="oc-data-table-per-page">{{ L.rowsPerPage }}
        <select class="oc-select" data-oc-page-size :aria-label="L.rowsPerPage">
          <option v-for="n in sizes" :key="n" :value="n" :selected="n === pageSize">{{ n }}</option>
        </select>
      </label>
      <nav v-if="pagination" class="oc-data-table-pager" data-oc-pager :aria-label="L.pagination"></nav>
    </div>
  </div>
</template>
