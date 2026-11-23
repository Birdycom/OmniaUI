<script setup lang="ts">
/**
 * Breadcrumb. Pass `items` (the last one is the current page) or use the default slot: plain .oc-breadcrumb-item markup
 * or the compound parts (0.18.0: OcBreadcrumbList, OcBreadcrumbItem, OcBreadcrumbLink, OcBreadcrumbPage,
 * OcBreadcrumbSeparator, OcBreadcrumbEllipsis).
 * `icon` per item is a webicon name (mdi:home-outline …), drawn as inline SVG (OcWebicon); separator="chevron" puts › between.
 * maxItems (0.18.0): a longer trail folds its middle into a "…" button with a menu of the hidden levels; itemsBefore (1)
 * and itemsAfter (2, the current page included) say how many levels stay. ellipsisLabel: name of the button ({count}).
 */
import { computed, provide } from 'vue'
import OcWebicon from './OcWebicon.vue'
import OcBreadcrumbEllipsis from './OcBreadcrumbEllipsis.vue'
import { breadcrumbKey, collapseBreadcrumb } from '../composables/keys-breadcrumb'
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}
const props = withDefaults(
  defineProps<{
    items?: BreadcrumbItem[]
    label?: string
    separator?: 'slash' | 'chevron'
    maxItems?: number
    itemsBefore?: number
    itemsAfter?: number
    ellipsisLabel?: string
  }>(),
  {
    items: () => [],
    label: 'Breadcrumb',
    separator: 'slash',
    itemsBefore: 1,
    itemsAfter: 2,
  },
)
provide(breadcrumbKey, { separator: props.separator, inList: false })

interface Row { item?: BreadcrumbItem; i: number; hidden?: BreadcrumbItem[] }
/** Rows to draw: an item with its index, or the ellipsis with the hidden levels. */
const rows = computed<Row[]>(() => {
  const all: Row[] = props.items.map((item, i) => ({ item, i }))
  const folded = collapseBreadcrumb(all, props.maxItems, props.itemsBefore, props.itemsAfter)
  if (!folded) return all
  return [...folded[0], { i: -1, hidden: folded[1].map((r) => r.item!) }, ...folded[2]]
})
const last = computed(() => props.items.length - 1)
</script>

<template>
  <nav :class="['oc-breadcrumb', separator === 'chevron' && 'oc-breadcrumb--chevron']" :aria-label="label">
    <slot>
      <template v-for="row in rows" :key="row.i">
        <span v-if="row.hidden" class="oc-breadcrumb-item"><OcBreadcrumbEllipsis :items="row.hidden" :label="ellipsisLabel" /></span>
        <a v-else-if="row.item!.href && row.i < last" class="oc-breadcrumb-item" :href="row.item!.href"
          ><OcWebicon v-if="row.item!.icon" :name="row.item!.icon" bare fallback="iconify" />{{ row.item!.label }}</a
        >
        <span v-else class="oc-breadcrumb-item" :aria-current="row.i === last ? 'page' : undefined"
          ><OcWebicon v-if="row.item!.icon" :name="row.item!.icon" bare fallback="iconify" />{{ row.item!.label }}</span
        >
      </template>
    </slot>
  </nav>
</template>
