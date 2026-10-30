<!-- File: packages/vue/src/components/OcTitlebarButton.vue | Map: props (label, close) -> button.oc-titlebar__btn -> slot (icon) -->
<script setup lang="ts">
/** Compact icon button in the title bar; `label` names it for screen readers, `close` turns it red on hover.
 *  Classes: .oc-titlebar__btn(--close) */
defineProps<{ label: string; close?: boolean }>()
</script>

<template>
  <button type="button" :class="['oc-titlebar__btn', close && 'oc-titlebar__btn--close']" :aria-label="label" :title="label"><slot /></button>
</template>
