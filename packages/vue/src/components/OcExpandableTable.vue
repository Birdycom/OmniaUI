<!-- File: packages/vue/src/components/OcExpandableTable.vue | Map: wrapper -> table (first rows, dimmed row, hidden rows) or slot -> toggle label -->
<script setup lang="ts">
/**
 * Table that shows the first rows; "Show more" reveals the rest, CSS only (snippets/expandable-table.html).
 * Pass columns + rows (+ visible, default 10), or your own <table> with the row classes in the default slot.
 * Scoped slot `cell` ({ row, column }) for rich cells. Props: tableClass (default oc-table-ref), moreLabel, lessLabel, full, buttonVariant, defaultOpen.
 */
export interface ExpandableTableColumn {
  key: string
  label: string
}
const props = withDefaults(
  defineProps<{
    columns?: ExpandableTableColumn[]
    rows?: Array<Record<string, unknown>>
    visible?: number
    tableClass?: string
    moreLabel?: string
    lessLabel?: string
    full?: boolean
    buttonVariant?: 'secondary' | 'outline' | 'ghost'
    defaultOpen?: boolean
  }>(),
  { rows: () => [], visible: 10, tableClass: 'oc-table-ref', moreLabel: 'Show more', lessLabel: 'Show less', full: true, buttonVariant: 'secondary' },
)
// The last visible row fades, the rows after it hide until the toggle is checked.
const rowClass = (i: number) =>
  i === props.visible - 1 && props.rows.length > props.visible ? 'oc-expandable-table__row-dimmed' : i >= props.visible ? 'oc-expandable-table__row-more' : undefined
</script>

<template>
  <div class="oc-expandable-table">
    <table v-if="columns" :class="tableClass">
      <thead><tr><th v-for="c in columns" :key="c.key">{{ c.label }}</th></tr></thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i" :class="rowClass(i)">
          <td v-for="c in columns" :key="c.key"><slot name="cell" :row="row" :column="c">{{ row[c.key] }}</slot></td>
        </tr>
      </tbody>
    </table>
    <slot v-else />
    <div :class="['oc-expandable-table__wrap', full && 'oc-expandable-table__wrap--full']">
      <label :class="['oc-btn', `oc-btn--${buttonVariant}`, 'oc-expandable-table__trigger']">
        <input type="checkbox" class="oc-expandable-table__toggle" :checked="defaultOpen" />
        <span class="oc-expandable-table__more">{{ moreLabel }}</span>
        <span class="oc-expandable-table__less">{{ lessLabel }}</span>
      </label>
    </div>
  </div>
</template>
