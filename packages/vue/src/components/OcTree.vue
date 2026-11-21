<!-- File: packages/vue/src/components/OcTree.vue | Map: box (+ head row) -> list -> item: folder (details/summary + nested OcTree) or leaf (div row) -> row: icon, label, count, actions -->
<script setup lang="ts">
/**
 * Nested tree list on details / summary. Renders itself recursively for child lists (`nested`).
 * Per item: icon (webicon name) and actions ({ label, icon?, text?, href?, tone? }[]: icon buttons that emit `action`).
 * Slots (scoped, { item }): icon, actions (replace the item props); plus `head-actions` for the head row.
 * Classes: .oc-tree(--quiet/--flush/--ellipsis), .oc-tree-head, ul.oc-tree-list, details.oc-tree-node, .oc-tree-row(.is-muted),
 * .oc-tree-icon, .oc-tree-label, .oc-tree-count, .oc-tree-actions, .oc-table-actions-icon
 */
import OcWebicon from './OcWebicon.vue'

export interface OcTreeAction {
  /** Accessible name and hover title, e.g. "Rename Quote v2.pdf". */
  label: string
  /** Webicon name; `text` is shown when there is no icon. */
  icon?: string
  text?: string
  href?: string
  tone?: 'default' | 'primary' | 'success' | 'destructive'
  /** Your own key, passed back with the `action` event. */
  name?: string
}
export interface OcTreeItem {
  label: string
  href?: string
  /** Webicon name ("mdi:folder-outline"). */
  icon?: string
  count?: string | number
  actions?: OcTreeAction[]
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
  /** Long names end in an ellipsis (full name in the label's title) instead of scrolling sideways. */
  ellipsis?: boolean
  /** Internal: render only the list (used for child lists). */
  nested?: boolean
}>()
const emit = defineEmits<{ action: [action: OcTreeAction, item: OcTreeItem] }>()
// Typed slots: the component renders itself, so TypeScript cannot infer these on its own.
defineSlots<{
  icon?(props: { item: OcTreeItem }): unknown
  actions?(props: { item: OcTreeItem }): unknown
  'head-actions'?(): unknown
}>()

const actionClass = (a: OcTreeAction) => ['oc-table-actions-icon', a.tone && a.tone !== 'default' && `oc-table-actions-icon--${a.tone}`]
/** A button inside a summary would toggle the folder: stop that, then report the action. */
function run(e: Event, action: OcTreeAction, item: OcTreeItem) {
  e.preventDefault()
  emit('action', action, item)
}
</script>

<template>
  <ul v-if="nested" class="oc-tree-list">
    <li v-for="(item, i) in items" :key="i">
      <details v-if="item.children?.length" class="oc-tree-node" :open="item.open">
        <summary :class="['oc-tree-row', item.muted && 'is-muted']" :aria-current="item.current && !item.href ? 'true' : undefined">
          <span v-if="$slots.icon || item.icon" class="oc-tree-icon" aria-hidden="true"><slot name="icon" :item="item"><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" /></slot></span>
          <span class="oc-tree-label" :title="item.label">{{ item.label }}</span>
          <span v-if="item.count != null" class="oc-tree-count">{{ item.count }}</span>
          <span v-if="$slots.actions || item.actions?.length" class="oc-tree-actions">
            <slot name="actions" :item="item">
              <template v-for="(a, j) in item.actions" :key="j">
                <a v-if="a.href" :class="actionClass(a)" :href="a.href" :aria-label="a.label" :title="a.label"><OcWebicon v-if="a.icon" :name="a.icon" bare fallback="iconify" /><template v-else>{{ a.text }}</template></a>
                <button v-else :class="actionClass(a)" type="button" :aria-label="a.label" :title="a.label" @click="run($event, a, item)"><OcWebicon v-if="a.icon" :name="a.icon" bare fallback="iconify" /><template v-else>{{ a.text }}</template></button>
              </template>
            </slot>
          </span>
        </summary>
        <OcTree :items="item.children" nested @action="(a, it) => emit('action', a, it)">
          <template v-if="$slots.icon" #icon="{ item: child }"><slot name="icon" :item="child" /></template>
          <template v-if="$slots.actions" #actions="{ item: child }"><slot name="actions" :item="child" /></template>
        </OcTree>
      </details>
      <div v-else :class="['oc-tree-row', item.muted && 'is-muted']" :aria-current="item.current && !item.href ? 'true' : undefined">
        <span v-if="$slots.icon || item.icon" class="oc-tree-icon" aria-hidden="true"><slot name="icon" :item="item"><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" /></slot></span>
        <a v-if="item.href" class="oc-tree-label" :href="item.href" :title="item.label" :aria-current="item.current ? 'true' : undefined">{{ item.label }}</a>
        <span v-else class="oc-tree-label" :title="item.label">{{ item.label }}</span>
        <span v-if="item.count != null" class="oc-tree-count">{{ item.count }}</span>
        <span v-if="$slots.actions || item.actions?.length" class="oc-tree-actions">
          <slot name="actions" :item="item">
            <template v-for="(a, j) in item.actions" :key="j">
              <a v-if="a.href" :class="actionClass(a)" :href="a.href" :aria-label="a.label" :title="a.label"><OcWebicon v-if="a.icon" :name="a.icon" bare fallback="iconify" /><template v-else>{{ a.text }}</template></a>
              <button v-else :class="actionClass(a)" type="button" :aria-label="a.label" :title="a.label" @click="run($event, a, item)"><OcWebicon v-if="a.icon" :name="a.icon" bare fallback="iconify" /><template v-else>{{ a.text }}</template></button>
            </template>
          </slot>
        </span>
      </div>
    </li>
  </ul>
  <div v-else :class="['oc-tree', quiet && 'oc-tree--quiet', flush && 'oc-tree--flush', ellipsis && 'oc-tree--ellipsis']">
    <div v-if="head" class="oc-tree-row oc-tree-head">
      <span class="oc-tree-label">{{ head }}</span>
      <span v-if="$slots['head-actions']" class="oc-tree-actions"><slot name="head-actions" /></span>
    </div>
    <OcTree :items="items" nested @action="(a, it) => emit('action', a, it)">
      <template v-if="$slots.icon" #icon="{ item: child }"><slot name="icon" :item="child" /></template>
      <template v-if="$slots.actions" #actions="{ item: child }"><slot name="actions" :item="child" /></template>
    </OcTree>
  </div>
</template>
