<!-- File: packages/vue/src/components/OcTableCompact.vue | Map: wrapper div -> table.oc-table (thead from columns, tbody from rows, tfoot from footer) OR default slot -->
<script setup lang="ts">
/**
 * Small striped table for inside cards. Pass `columns` + `rows` (+ `footer` total row), or put your own
 * <table class="oc-table"> in the default slot. Scoped slot `cell` ({ row, column }) customises body cells.
 * Classes: .oc-table-compact(--bordered/--plain), .oc-table-compact-muted, [data-numeric], [data-wrap]
 */
export interface TableCompactColumn {
  key: string
  label: string
  numeric?: boolean
  wrap?: boolean
}

withDefaults(
  defineProps<{
    columns?: TableCompactColumn[]
    rows?: Array<Record<string, unknown>>
    footer?: Record<string, unknown>
    bordered?: boolean
    plain?: boolean
  }>(),
  { rows: () => [] },
)
// data-* attributes only when switched on (an empty string means "present").
const cellAttrs = (c: TableCompactColumn) => ({ 'data-numeric': c.numeric ? '' : undefined, 'data-wrap': c.wrap ? '' : undefined })
</script>

<template>
  <div :class="['oc-table-compact', bordered && 'oc-table-compact--bordered', plain && 'oc-table-compact--plain']">
    <table v-if="columns" class="oc-table">
      <thead>
        <tr><th v-for="c in columns" :key="c.key" v-bind="cellAttrs(c)">{{ c.label }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="c in columns" :key="c.key" v-bind="cellAttrs(c)"><slot name="cell" :row="row" :column="c">{{ row[c.key] }}</slot></td>
        </tr>
      </tbody>
      <tfoot v-if="footer">
        <tr><td v-for="c in columns" :key="c.key" v-bind="cellAttrs(c)">{{ footer[c.key] }}</td></tr>
      </tfoot>
    </table>
    <slot v-else />
  </div>
</template>
