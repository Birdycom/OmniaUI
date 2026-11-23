<script setup lang="ts">
/**
 * Horizontal navigation links with optional dropdown children, wrapped in a <nav>.
 * Pass `items` (see OcNavmenuList) or put your own <li> elements in the default slot.
 * variant="site": outlined pill links (.oc-navmenu--site). Dropdown children may hold { group } headings.
 */
import OcNavmenuList, { type NavmenuItem } from './OcNavmenuList.vue'

withDefaults(defineProps<{ items?: NavmenuItem[]; label?: string; variant?: 'site' }>(), {
  items: () => [],
  label: 'Navigation',
})
</script>

<template>
  <nav :aria-label="label">
    <OcNavmenuList :items="items" :variant="variant"><slot /></OcNavmenuList>
  </nav>
</template>
