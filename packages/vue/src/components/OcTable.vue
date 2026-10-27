<script setup lang="ts">
/**
 * Data table: sortable header (v-model:sort), row selection (v-model:selected), row actions, empty state,
 * density modifiers. Slots: `cell-<key>` (scoped: { row, value }), `actions` (scoped: { row }), `empty`.
 * Classes: .oc-table-wrap > .oc-table(--striped/--compact/--borderless/--sticky), .oc-table-sort,
 * .oc-table-actions, .oc-table-empty; aria-sort / aria-selected / data-numeric attributes.
 */
import { computed, useSlots } from 'vue'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  numeric?: boolean
  width?: string
}
export interface TableSort {
  key: string
  direction: 'ascending' | 'descending'
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: Record<string, any>[]
    rowKey?: string
    caption?: string
    striped?: boolean
    compact?: boolean
    borderless?: boolean
    sticky?: boolean
    selectable?: boolean
    actionsLabel?: string
    selectAllLabel?: string
  }>(),
  { rowKey: 'id', actionsLabel: 'Actions', selectAllLabel: 'Select all' },
)
const selected = defineModel<(string | number)[]>('selected', { default: () => [] })
const sort = defineModel<TableSort | null>('sort', { default: null })
const slots = useSlots()

const hasActions = computed(() => !!slots.actions)
const colspan = computed(() => props.columns.length + (props.selectable ? 1 : 0) + (hasActions.value ? 1 : 0))
const allSelected = computed(() => props.rows.length > 0 && props.rows.every((r) => selected.value.includes(r[props.rowKey])))

function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked ? props.rows.map((r) => r[props.rowKey]) : []
}
function toggleRow(id: string | number, checked: boolean) {
  selected.value = checked ? [...selected.value, id] : selected.value.filter((x) => x !== id)
}
function ariaSort(key: string) {
  return sort.value?.key === key ? sort.value.direction : undefined
}
function toggleSort(e: Event, key: string) {
  e.preventDefault()
  const next = sort.value?.key === key && sort.value.direction === 'ascending' ? 'descending' : 'ascending'
  sort.value = { key, direction: next }
}
function rowLabel(row: Record<string, any>) {
  return `Select ${String(row[props.columns[0]?.key] ?? '')}`.trim()
}
</script>

<template>
  <div class="oc-table-wrap">
    <table
      :class="['oc-table', striped && 'oc-table--striped', compact && 'oc-table--compact', borderless && 'oc-table--borderless', sticky && 'oc-table--sticky']"
    >
      <caption v-if="caption">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-if="selectable" style="width: 2.5rem">
            <input class="oc-checkbox" type="checkbox" :checked="allSelected" :aria-label="selectAllLabel" @change="toggleAll" />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :aria-sort="ariaSort(col.key)"
            :data-numeric="col.numeric ? '' : undefined"
            :style="col.width ? { width: col.width } : undefined"
          >
            <a v-if="col.sortable" class="oc-table-sort" :href="`?sort=${col.key}`" @click="toggleSort($event, col.key)">{{ col.label }}</a>
            <template v-else>{{ col.label }}</template>
          </th>
          <th v-if="hasActions"><span class="oc-visually-hidden">{{ actionsLabel }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row[rowKey]"
          :aria-selected="selected.includes(row[rowKey]) ? 'true' : undefined"
        >
          <td v-if="selectable">
            <input
              class="oc-checkbox"
              type="checkbox"
              :checked="selected.includes(row[rowKey])"
              :aria-label="rowLabel(row)"
              @change="toggleRow(row[rowKey], ($event.target as HTMLInputElement).checked)"
            />
          </td>
          <td v-for="col in columns" :key="col.key" :data-numeric="col.numeric ? '' : undefined">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
          </td>
          <td v-if="hasActions" class="oc-table-actions"><slot name="actions" :row="row" /></td>
        </tr>
        <tr v-if="rows.length === 0 && $slots.empty" class="oc-table-empty">
          <td :colspan="colspan"><slot name="empty" :row="{}" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
