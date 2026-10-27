<!-- File: packages/vue/src/components/OcDataTable.vue | Map: props -> markup (toolbar, table, footer) -> bind the list-table script on mount -->
<script setup lang="ts">
/**
 * Korrekt / OmniaDesk list table. Same markup as packages/ui/snippets/data-table.html.
 * Search, sort, pages, columns, resize, drag and bulk actions come from data-table.js.
 * Listen on the root for oc-datatable-bulk, oc-datatable-reorder, oc-datatable-search, oc-datatable-import.
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
}
export interface DataTableRow {
  key: string
  status?: 'active' | 'deleted' | 'archived'
  cells: Record<string, string>
  values?: Record<string, string>
  href?: string
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
    draggable?: boolean
    filters?: boolean
    live?: boolean
  }>(),
  { title: 'List', pageSize: 15, searchPlaceholder: 'Search...', selectable: true, draggable: true, filters: true, live: false },
)

const root = useTemplateRef<HTMLElement>('root')
const sizes = [...new Set([10, 15, 20, 50, 100, props.pageSize])].sort((a, b) => a - b)
const lead = (props.selectable ? 1 : 0) + (props.draggable ? 1 : 0)
const id = props.tableId || `oc-dt-${Math.random().toString(36).slice(2, 8)}`

onMounted(() => {
  if (root.value) bindDataTable(root.value)
})
</script>

<template>
  <div ref="root" class="oc-data-table oc-column-menu-scope" :id="id" :data-page-size="pageSize" :data-oc-live="live ? 'true' : undefined">
    <div class="oc-data-table-toolbar">
      <div class="oc-data-table-heading">
        <span class="oc-data-table-title">{{ title }}</span>
        <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" :popovertarget="`${id}-menu`" aria-label="Table actions">⚙</button>
        <div class="oc-dropdown-menu" :id="`${id}-menu`" popover>
          <button class="oc-dropdown-item" type="button" data-oc-export>Export CSV</button>
          <button class="oc-dropdown-item" type="button" data-oc-import>Import CSV</button>
          <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
          <div class="oc-dropdown-separator"></div>
          <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">Comfortable rows</button>
          <button class="oc-dropdown-item" type="button" data-oc-density="compact">Compact rows</button>
          <button class="oc-dropdown-item" type="button" data-oc-reset-widths>Reset column widths</button>
        </div>
      </div>
      <input class="oc-input oc-data-table-search" type="search" :placeholder="searchPlaceholder" :aria-label="`Search ${title}`">
      <div v-if="filters" class="oc-filter-pills" role="group" aria-label="Trash filter">
        <button class="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active only</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="all">Including trash</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="deleted">Trash only</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="archived">Archive only</button>
      </div>
      <div class="oc-data-table-view" role="group" aria-label="View">
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true">Table</button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="grid">Cards</button>
      </div>
      <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    <div class="oc-table-toolbar">
      <span class="oc-table-toolbar-spacer"></span>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" :popovertarget="`${id}-columns`">Columns</button>
    </div>
    <div class="oc-column-menu" :id="`${id}-columns`" popover>
      <p class="oc-column-menu-title">Visible columns</p>
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
              <th v-for="col in columns" :key="col.key" :data-oc-col="col.key" :data-oc-sort="col.numeric ? 'numeric' : 'text'" :data-numeric="col.numeric ? '' : undefined">
                <span class="oc-data-table-th">
                  <button v-if="col.sortable !== false" class="oc-table-sort" type="button">{{ col.header }}</button>
                  <template v-else>{{ col.header }}</template>
                  <span class="oc-data-table-resize" role="separator" aria-orientation="vertical" :aria-label="`Resize ${col.header}`"></span>
                </span>
              </th>
              <th data-oc-col="actions"><span class="oc-visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" data-oc-row :data-oc-key="row.key" :data-oc-status="row.status || 'active'" :data-oc-href="row.href">
              <td v-if="selectable" data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select :aria-label="`Select ${row.cells.name || row.key}`"></td>
              <td v-if="draggable" data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" :aria-label="`Move ${row.cells.name || row.key}`"></button></td>
              <td v-for="col in columns" :key="col.key" :data-oc-col="col.key" :data-numeric="col.numeric ? '' : undefined" :data-oc-value="row.values?.[col.key]">{{ row.cells[col.key] ?? '' }}</td>
              <td data-oc-col="actions" class="oc-table-actions"><button class="oc-table-row-action" type="button">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="oc-data-table-empty" hidden>No results</p>
    </div>
    <div class="oc-data-table-footer">
      <p class="oc-data-table-summary" data-oc-summary></p>
      <label class="oc-data-table-per-page">Rows per page
        <select class="oc-select" data-oc-page-size aria-label="Rows per page">
          <option v-for="n in sizes" :key="n" :value="n" :selected="n === pageSize">{{ n }}</option>
        </select>
      </label>
      <nav class="oc-data-table-pager" data-oc-pager aria-label="Pagination"></nav>
    </div>
  </div>
</template>
