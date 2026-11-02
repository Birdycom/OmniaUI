<!-- File: packages/vue/src/components/OcDataTable.vue | Map: props -> markup (tabs, toolbar, filters, table, footer) -> bind the list-table script on mount -->
<script setup lang="ts">
/**
 * List table for business apps. Same markup as packages/ui/snippets/data-table.html.
 * Search, column filters, sort, pages, columns, resize, drag and bulk actions come from data-table.js.
 * Listen on the root for oc-datatable-bulk, oc-datatable-reorder, oc-datatable-search, oc-datatable-import.
 * Slots: cell-<key> ({ row }) for a rich cell (an OcDataTableName, a badge …), actions ({ row }) for the row buttons
 * (default: one soft edit button), page-actions for the toolbar (New customer …).
 * Icons of tabs and filters are webicon names (mdi:account-outline …), drawn with <iconify-icon>.
 */
import { onMounted, useTemplateRef } from 'vue'
import { bindDataTable } from '../../../ui/src/data-table.js'

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
  }>(),
  { title: 'List', pageSize: 15, searchPlaceholder: 'Search...', selectable: true, draggable: false, resizable: false, columnMenu: false, filters: true, archive: true, summary: '', importable: false, variant: 'default', striped: true, live: false },
)

const root = useTemplateRef<HTMLElement>('root')
const sizes = [...new Set([10, 15, 20, 50, 100, props.pageSize])].sort((a, b) => a - b)
const lead = (props.selectable ? 1 : 0) + (props.draggable ? 1 : 0)
const id = props.tableId || `oc-dt-${Math.random().toString(36).slice(2, 8)}`
const label = (row: DataTableRow) => row.values?.name ?? row.cells.name ?? row.key

onMounted(() => {
  if (root.value) bindDataTable(root.value)
})
</script>

<template>
  <div ref="root" :class="['oc-data-table', variant === 'bordered' && 'oc-data-table--bordered', !striped && 'oc-data-table--plain', columnMenu && 'oc-column-menu-scope']" :id="id" :data-page-size="pageSize" :data-oc-live="live ? 'true' : undefined">
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
      ><iconify-icon v-if="tab.icon" :icon="tab.icon" aria-hidden="true" />{{ tab.label }}<span v-if="tab.count != null" :class="['oc-data-table-tab-count', tab.tone && `oc-data-table-tab-count--${tab.tone}`]">{{ tab.count }}</span></button>
    </div>
    <div class="oc-data-table-toolbar">
      <div class="oc-data-table-heading">
        <span class="oc-data-table-title">{{ title }}</span>
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" :popovertarget="`${id}-menu`" aria-label="List actions" title="List actions"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 13c-1.86 0-3.41 1.28-3.86 3H2v2h2.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22v-2H11.86c-.45-1.72-2-3-3.86-3m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M19.86 6c-.45-1.72-2-3-3.86-3s-3.41 1.28-3.86 3H2v2h10.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22V6zM16 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2" /></svg></button>
        <div class="oc-dropdown-menu" :id="`${id}-menu`" popover>
          <button class="oc-dropdown-item" type="button" data-oc-export>Export CSV</button>
          <template v-if="importable">
            <button class="oc-dropdown-item" type="button" data-oc-import>Import CSV</button>
            <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
          </template>
          <button class="oc-dropdown-item" type="button" data-oc-bulk="duplicate">Duplicate selection</button>
          <button class="oc-dropdown-item" type="button" data-oc-bulk="archive">Move selection to trash</button>
          <div class="oc-dropdown-separator"></div>
          <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">Comfortable rows</button>
          <button class="oc-dropdown-item" type="button" data-oc-density="compact">Compact rows</button>
        </div>
      </div>
      <input class="oc-input oc-data-table-search" type="search" :placeholder="searchPlaceholder" :aria-label="`Search ${title}`">
      <div v-if="filters" class="oc-filter-pills" role="group" aria-label="Trash filter">
        <button class="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active only</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="all">Including trash</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="deleted">Trash only</button>
        <button v-if="archive" class="oc-filter-pill" type="button" data-oc-filter="archived">Archive only</button>
      </div>
      <div class="oc-data-table-view" role="group" aria-label="View">
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true" aria-label="Table"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5" /></svg></button>
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="grid" aria-label="Cards"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z" /></svg></button>
      </div>
      <div v-if="$slots['page-actions']" class="oc-data-table-actions"><slot name="page-actions" /></div>
      <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    <div v-if="columnFilters?.length" :id="`${id}-filters`" class="oc-data-table-filters">
      <label v-for="f in columnFilters" :key="f.column" class="oc-data-table-filter">
        <iconify-icon v-if="f.icon" :icon="f.icon" aria-hidden="true" />
        <template v-else><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z" /></svg></template>
        <select class="oc-select" :data-oc-col-filter="f.column" :aria-label="f.label">
          <option v-for="o in f.options" :key="o.value" :value="o.value" :selected="o.value === ''">{{ o.label }}</option>
        </select>
      </label>
    </div>
    <div v-if="columnMenu" class="oc-column-menu" :id="`${id}-columns`" popover>
      <p class="oc-column-menu-title">Columns</p>
      <template v-if="resizable">
        <button class="oc-dropdown-item" type="button" data-oc-reset-widths>Reset column widths</button>
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
    <div class="oc-data-table-bulk" hidden>
      <span data-oc-selected-count>0 selected</span>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export">Export selection</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="duplicate">Duplicate</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="archive">Move to trash</button>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="restore">Restore</button>
      <button class="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete">Delete permanently</button>
      <button class="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="clear">Clear</button>
    </div>
    <div class="oc-data-table-frame">
      <div class="oc-data-table-scroll">
        <table class="oc-table oc-data-table-table">
          <thead>
            <tr>
              <th v-if="selectable" data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select-all aria-label="Select all"></th>
              <th v-if="draggable" data-oc-col="order"><span class="oc-visually-hidden">Order</span></th>
              <th v-for="col in columns" :key="col.key" :data-oc-col="col.key" :data-oc-sort="col.numeric ? 'numeric' : 'text'" :data-numeric="col.numeric ? '' : undefined" :aria-sort="col.defaultSort">
                <span class="oc-data-table-th">
                  <button v-if="col.sortable !== false" class="oc-table-sort" type="button">{{ col.header }}</button>
                  <template v-else>{{ col.header }}</template>
                  <span v-if="resizable" class="oc-data-table-resize" role="separator" aria-orientation="vertical" :aria-label="`Resize ${col.header}`"></span>
                </span>
              </th>
              <th data-oc-col="actions">
                <span class="oc-data-table-th">Actions<button v-if="columnMenu" class="oc-btn oc-btn--plain oc-data-table-columns-btn" type="button" :popovertarget="`${id}-columns`" aria-label="Columns" title="Columns"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5v13h17V5zm10 2v9h-3V7zM6 7h3v9H6zm13 9h-3V7h3z" /></svg></button></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" data-oc-row :data-oc-key="row.key" :data-oc-status="row.status || 'active'" :data-oc-href="row.href">
              <td v-if="selectable" data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select :aria-label="`Select ${label(row)}`"></td>
              <td v-if="draggable" data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" :aria-label="`Move ${label(row)}`"></button></td>
              <td v-for="col in columns" :key="col.key" :data-oc-col="col.key" :data-numeric="col.numeric ? '' : undefined" :data-oc-value="row.values?.[col.key]">
                <slot :name="`cell-${col.key}`" :row="row">
                  <span v-if="col.truncate" class="oc-data-table-truncate" :style="{ '--oc-data-table-truncate': col.truncate }" :title="row.cells[col.key]">{{ row.cells[col.key] ?? '' }}</span>
                  <template v-else>{{ row.cells[col.key] ?? '' }}</template>
                </slot>
              </td>
              <td data-oc-col="actions">
                <div style="display: flex; gap: 0.375rem; justify-content: flex-end">
                  <slot name="actions" :row="row">
                    <button class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" type="button" :aria-label="`Edit ${label(row)}`" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z" /></svg></button>
                  </slot>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="oc-data-table-empty" hidden>No results</p>
    </div>
    <div class="oc-data-table-footer">
      <p class="oc-data-table-summary" :data-oc-summary="summary"></p>
      <label class="oc-data-table-per-page">Rows per page
        <select class="oc-select" data-oc-page-size aria-label="Rows per page">
          <option v-for="n in sizes" :key="n" :value="n" :selected="n === pageSize">{{ n }}</option>
        </select>
      </label>
      <nav class="oc-data-table-pager" data-oc-pager aria-label="Pagination"></nav>
    </div>
  </div>
</template>
