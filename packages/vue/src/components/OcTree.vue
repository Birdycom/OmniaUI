<!-- File: packages/vue/src/components/OcTree.vue | Map: box (+ head row) -> list -> item: folder (details/summary + nested OcTree) or leaf (div row) -->
<script setup lang="ts">
/**
 * Nested tree list on details / summary. Renders itself recursively for child lists (`nested`).
 * Slots (scoped, { item }): icon, actions; plus `head-actions` for the head row.
 * Classes: .oc-tree(--quiet/--flush), .oc-tree-head, ul.oc-tree-list, details.oc-tree-node, .oc-tree-row(.is-muted),
 * .oc-tree-icon, .oc-tree-label, .oc-tree-count, .oc-tree-actions
 */
export interface OcTreeItem {
  label: string
  href?: string
  count?: string | number
  children?: OcTreeItem[]
  open?: boolean
  current?: boolean
  muted?: boolean
}

defineOptions({ name: 'OcTree' })
defineProps<{
  items: OcTreeItem[]
  head?: string
  quiet?: boolean
  flush?: boolean
  /** Internal: render only the list (used for child lists). */
  nested?: boolean
}>()
// Typed slots: the component renders itself, so TypeScript cannot infer these on its own.
defineSlots<{
  icon?(props: { item: OcTreeItem }): unknown
  actions?(props: { item: OcTreeItem }): unknown
  'head-actions'?(): unknown
}>()
</script>

<template>
  <ul v-if="nested" class="oc-tree-list">
    <li v-for="(item, i) in items" :key="i">
      <details v-if="item.children?.length" class="oc-tree-node" :open="item.open">
        <summary :class="['oc-tree-row', item.muted && 'is-muted']" :aria-current="item.current && !item.href ? 'true' : undefined">
          <span v-if="$slots.icon" class="oc-tree-icon" aria-hidden="true"><slot name="icon" :item="item" /></span>
          <span class="oc-tree-label">{{ item.label }}</span>
          <span v-if="item.count != null" class="oc-tree-count">{{ item.count }}</span>
          <span v-if="$slots.actions" class="oc-tree-actions"><slot name="actions" :item="item" /></span>
        </summary>
        <OcTree :items="item.children" nested>
          <template v-if="$slots.icon" #icon="{ item: child }"><slot name="icon" :item="child" /></template>
          <template v-if="$slots.actions" #actions="{ item: child }"><slot name="actions" :item="child" /></template>
        </OcTree>
      </details>
      <div v-else :class="['oc-tree-row', item.muted && 'is-muted']" :aria-current="item.current && !item.href ? 'true' : undefined">
        <span v-if="$slots.icon" class="oc-tree-icon" aria-hidden="true"><slot name="icon" :item="item" /></span>
        <a v-if="item.href" class="oc-tree-label" :href="item.href" :aria-current="item.current ? 'true' : undefined">{{ item.label }}</a>
        <span v-else class="oc-tree-label">{{ item.label }}</span>
        <span v-if="item.count != null" class="oc-tree-count">{{ item.count }}</span>
        <span v-if="$slots.actions" class="oc-tree-actions"><slot name="actions" :item="item" /></span>
      </div>
    </li>
  </ul>
  <div v-else :class="['oc-tree', quiet && 'oc-tree--quiet', flush && 'oc-tree--flush']">
    <div v-if="head" class="oc-tree-row oc-tree-head">
      <span class="oc-tree-label">{{ head }}</span>
      <span v-if="$slots['head-actions']" class="oc-tree-actions"><slot name="head-actions" /></span>
    </div>
    <OcTree :items="items" nested>
      <template v-if="$slots.icon" #icon="{ item: child }"><slot name="icon" :item="child" /></template>
      <template v-if="$slots.actions" #actions="{ item: child }"><slot name="actions" :item="child" /></template>
    </OcTree>
  </div>
</template>
