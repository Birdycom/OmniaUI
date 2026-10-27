<script setup lang="ts">
/**
 * Horizontal navigation links with optional dropdown children, wrapped in a <nav>.
 * Pass `items` (see OcNavmenuList) or put your own <li> elements in the default slot.
 */
import OcNavmenuList, { type NavmenuItem } from './OcNavmenuList.vue'

withDefaults(defineProps<{ items?: NavmenuItem[]; label?: string }>(), {
  items: () => [],
  label: 'Navigation',
})
</script>

<template>
  <nav :aria-label="label">
    <OcNavmenuList :items="items"><slot /></OcNavmenuList>
  </nav>
</template>
