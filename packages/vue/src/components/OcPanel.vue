<!-- File: packages/vue/src/components/OcPanel.vue | Map: glow -> classes -> panel with the slot -->
<script setup lang="ts">
/** Framed panel for a form, a call to action or a feature (same markup as snippets/panel.html). glow: start | end | both. */
defineProps<{ glow?: 'start' | 'end' | 'both' }>()
</script>

<template>
  <div :class="['oc-panel', (glow === 'start' || glow === 'end') && 'oc-panel--glow', glow === 'end' && 'oc-panel--glow-end', glow === 'both' && 'oc-panel--glow-both']"><slot /></div>
</template>
