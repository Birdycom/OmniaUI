<!-- File: packages/vue/src/components/OcSortableList.vue | Map: props -> ul/ol.oc-sortable-list -> li.oc-sortable-item[data-id] (grip, slot, arrows) -> bindSortableList (move: false) -> update:items + reorder -->
<script setup lang="ts" generic="T">
/**
 * Sortable list (0.18.0): reorder with a finger, pen or mouse (pointer events, works on a tablet) or the keyboard (Space to pick up,
 * arrows to move, Space to drop, Escape to cancel), announced in a live region. v-model:items gets the new order; @reorder
 * gets { items, from, to }. Slot `item` ({ item, index }) for the content of a row. `ordered`: ol with positions; `arrows`: up / down buttons.
 * Classes: .oc-sortable-list, li.oc-sortable-item, .oc-sortable-row-grip, .oc-sortable-item__body, .oc-sortable-item__arrows,
 * .oc-sortable-item--grabbed / --dragging, .oc-dropline, .oc-drag-ghost
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { bindSortableList } from '../../../ui/src/sortable-list.js'
import OcWebicon from './OcWebicon.vue'

const props = withDefaults(
  defineProps<{
    items: T[]
    getKey?: (item: T, index: number) => string
    getLabel?: (item: T) => string
    ordered?: boolean
    arrows?: boolean
    gripLabel?: (label: string) => string
    messages?: { grabbed?: string; moved?: string; dropped?: string; cancelled?: string }
    upLabel?: string
    downLabel?: string
  }>(),
  { getKey: undefined, getLabel: undefined, gripLabel: undefined, messages: undefined, upLabel: 'Move up', downLabel: 'Move down' },
)
const emit = defineEmits<{ 'update:items': [items: T[]]; reorder: [move: { items: T[]; from: number; to: number }] }>()

const keyOf = (item: T, index: number): string => {
  if (props.getKey) return props.getKey(item, index)
  if (item && typeof item === 'object' && 'id' in (item as object)) return String((item as unknown as { id: unknown }).id)
  return typeof item === 'string' || typeof item === 'number' ? String(item) : String(index)
}
const labelOf = (item: T): string => {
  if (props.getLabel) return props.getLabel(item)
  if (item && typeof item === 'object' && 'label' in (item as object)) return String((item as unknown as { label: unknown }).label)
  return String(item)
}

const list = ref<HTMLElement | null>(null)
let api: { destroy: () => void } | undefined
onMounted(() => {
  if (!list.value) return
  api = bindSortableList(list.value, {
    move: false,
    messages: props.messages,
    onReorder: (from: number, to: number) => {
      const next = props.items.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      emit('update:items', next)
      emit('reorder', { items: next, from, to })
    },
  })
})
onBeforeUnmount(() => api?.destroy())
</script>

<template>
  <component :is="ordered ? 'ol' : 'ul'" ref="list" class="oc-sortable-list">
    <li v-for="(item, i) in items" :key="keyOf(item, i)" class="oc-sortable-item" :data-id="keyOf(item, i)" :data-label="labelOf(item)">
      <button type="button" class="oc-sortable-row-grip" :aria-label="gripLabel ? gripLabel(labelOf(item)) : `Move ${labelOf(item)}`"></button>
      <span class="oc-sortable-item__body"><slot name="item" :item="item" :index="i">{{ labelOf(item) }}</slot></span>
      <span v-if="arrows" class="oc-sortable-item__arrows">
        <button type="button" data-oc-move="up" :aria-label="`${upLabel}: ${labelOf(item)}`" :disabled="i === 0"><OcWebicon name="mdi:chevron-up" /></button>
        <button type="button" data-oc-move="down" :aria-label="`${downLabel}: ${labelOf(item)}`" :disabled="i === items.length - 1"><OcWebicon name="mdi:chevron-down" /></button>
      </span>
    </li>
  </component>
</template>
