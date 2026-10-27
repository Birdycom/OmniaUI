<script setup lang="ts">
/** Group of sidebar items with an optional heading (`label`). */
defineProps<{ label?: string }>()
</script>

<template>
  <div class="oc-sidebar-group">
    <div v-if="label" class="oc-sidebar-group-label">{{ label }}</div>
    <slot />
  </div>
</template>
