<script setup lang="ts">
/**
 * Breadcrumb. Pass `items` (the last one is the current page) or use the default slot.
 * `icon` per item is a webicon name (mdi:home-outline …), drawn as inline SVG (OcWebicon); separator="chevron" puts › between.
 */
import OcWebicon from './OcWebicon.vue'
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}
withDefaults(defineProps<{ items?: BreadcrumbItem[]; label?: string; separator?: 'slash' | 'chevron' }>(), {
  items: () => [],
  label: 'Breadcrumb',
  separator: 'slash',
})
</script>

<template>
  <nav :class="['oc-breadcrumb', separator === 'chevron' && 'oc-breadcrumb--chevron']" :aria-label="label">
    <slot>
      <template v-for="(item, i) in items" :key="i">
        <a v-if="item.href && i < items.length - 1" class="oc-breadcrumb-item" :href="item.href"
          ><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" />{{ item.label }}</a
        >
        <span v-else class="oc-breadcrumb-item" aria-current="page"
          ><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" />{{ item.label }}</span
        >
      </template>
    </slot>
  </nav>
</template>
