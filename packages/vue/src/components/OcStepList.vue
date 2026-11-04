<!-- File: packages/vue/src/components/OcStepList.vue | Map: ol.oc-step-list -> one li per item (or the default slot) -->
<script setup lang="ts">
/** Compact numbered list of steps (snippets/step-list.html). items = the steps as text; or put <li> elements in the default slot. */
withDefaults(defineProps<{ items?: string[]; size?: 'md' | 'sm' }>(), { items: () => [] })
</script>

<template>
  <ol :class="['oc-step-list', size === 'sm' && 'oc-step-list--sm']">
    <li v-for="(item, i) in items" :key="i">{{ item }}</li>
    <slot />
  </ol>
</template>
