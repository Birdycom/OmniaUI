<!-- File: packages/vue/src/components/OcDocLayout.vue | Map: layout -> side column (slot aside) -> text (default slot) -->
<script setup lang="ts">
/** Document page with a side column (slot `aside`, e.g. a table of contents) next to the text (default slot). */
defineProps<{ end?: boolean }>()
</script>

<template>
  <div :class="['oc-doc-layout', end && 'oc-doc-layout--end']">
    <aside v-if="$slots.aside" class="oc-doc-layout__aside"><slot name="aside" /></aside>
    <div class="oc-doc-layout__main"><slot /></div>
  </div>
</template>
