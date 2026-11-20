<!-- File: packages/vue/src/components/OcResizablePanel.vue | Map: props (resizable) -> div.oc-resizable-panel -->
<script setup lang="ts">
/** One pane of OcResizable. `resizable` gives it the resize grip; the others take the remaining space. Class: .oc-resizable-panel(--resizable) */
defineProps<{ resizable?: boolean }>()
</script>

<template>
  <div :class="['oc-resizable-panel', resizable && 'oc-resizable-panel--resizable']"><slot /></div>
</template>
