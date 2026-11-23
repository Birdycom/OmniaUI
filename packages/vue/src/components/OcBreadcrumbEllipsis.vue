<script setup lang="ts">
/**
 * Compound breadcrumb (0.18.0): the folded middle of a long trail. items: the hidden levels, in a menu under the "…"
 * button (a native popover, no script); or your own menu content in the default slot (.oc-dropdown-item links).
 * Without items or slot it is only a "…" mark. label: accessible name, {count} = number of hidden levels.
 * Put it in an OcBreadcrumbItem.
 */
import { computed, useSlots } from 'vue'
import OcWebicon from './OcWebicon.vue'
import { useUid } from '../composables/useUid'

export interface BreadcrumbEllipsisItem {
  label: string
  href?: string
  icon?: string
}
const props = defineProps<{ items?: BreadcrumbEllipsisItem[]; label?: string; id?: string }>()
const slots = useSlots()
const auto = useUid('oc-bc').replace(/[^a-zA-Z0-9_-]/g, '')
const menuId = computed(() => props.id ?? auto)
const count = computed(() => props.items?.length ?? 0)
const name = computed(() => (props.label ?? (count.value ? 'Show {count} more levels' : 'More levels')).replace('{count}', String(count.value)))
const hasMenu = computed(() => !!props.items || !!slots.default)
</script>

<template>
  <template v-if="hasMenu">
    <button type="button" class="oc-breadcrumb-ellipsis" :popovertarget="menuId" :aria-label="name"><OcWebicon name="mdi:dots-horizontal" bare fallback="iconify" /></button>
    <div :id="menuId" class="oc-dropdown-menu" popover="auto" role="menu">
      <slot>
        <a v-for="(item, i) in items" :key="i" class="oc-dropdown-item" role="menuitem" :href="item.href"
          ><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" />{{ item.label }}</a
        >
      </slot>
    </div>
  </template>
  <span v-else class="oc-breadcrumb-ellipsis" role="img" :aria-label="name"><OcWebicon name="mdi:dots-horizontal" bare fallback="iconify" /></span>
</template>
