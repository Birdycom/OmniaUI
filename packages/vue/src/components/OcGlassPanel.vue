<!-- File: packages/vue/src/components/OcGlassPanel.vue | Map: props (strong) -> div.oc-glass-panel -> default slot -->
<script setup lang="ts">
/** A lighter layer inside a glass sheet. Classes: .oc-glass-panel(--strong) */
defineProps<{ strong?: boolean }>()
</script>

<template>
  <div :class="['oc-glass-panel', strong && 'oc-glass-panel--strong']"><slot /></div>
</template>
