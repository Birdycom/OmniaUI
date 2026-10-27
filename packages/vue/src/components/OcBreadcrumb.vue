<script setup lang="ts">
/** Breadcrumb. Pass `items` (the last one is the current page) or use the default slot. */
export interface BreadcrumbItem {
  label: string
  href?: string
}
withDefaults(defineProps<{ items?: BreadcrumbItem[]; label?: string }>(), {
  items: () => [],
  label: 'Breadcrumb',
})
</script>

<template>
  <nav class="oc-breadcrumb" :aria-label="label">
    <slot>
      <template v-for="(item, i) in items" :key="i">
        <a v-if="item.href && i < items.length - 1" class="oc-breadcrumb-item" :href="item.href">{{ item.label }}</a>
        <span v-else class="oc-breadcrumb-item" aria-current="page">{{ item.label }}</span>
      </template>
    </slot>
  </nav>
</template>
