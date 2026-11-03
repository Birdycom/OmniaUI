<!-- File: packages/vue/src/components/OcReading.vue | Map: span.oc-reading (+ level) -> value (slot) -->
<script setup lang="ts">
/** A small measured value ("57 °C") in tabular numbers. level: cool (default), warm, hot. */
defineProps<{ level?: 'cool' | 'warm' | 'hot' }>()
</script>

<template>
  <span :class="['oc-reading', level && level !== 'cool' && `oc-reading--${level}`]"><slot /></span>
</template>
