<script setup lang="ts">
/** CSS-only tooltip: wraps the default slot and shows `text` via data-tooltip. */
defineProps<{ text: string }>()
</script>

<template>
  <span class="oc-tooltip" :data-tooltip="text"><slot /></span>
</template>
