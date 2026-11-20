<!-- File: packages/vue/src/components/OcResizable.vue | Map: props (vertical, box) -> div.oc-resizable with OcResizablePanel children -->
<script setup lang="ts">
/**
 * Resizable panels with CSS resize, no JavaScript (same markup as packages/ui/snippets/resizable.html). Give it a
 * block-size. vertical: panels on top of each other. box: one box that resizes in both directions.
 * Classes: .oc-resizable(--vertical), .oc-resizable-box
 */
defineProps<{ vertical?: boolean; box?: boolean }>()
</script>

<template>
  <div :class="[box && 'oc-resizable-box', 'oc-resizable', vertical && 'oc-resizable--vertical']"><slot /></div>
</template>
