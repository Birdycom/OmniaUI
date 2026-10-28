<script setup lang="ts">
/** CSS-only tooltip: wraps the default slot and shows `text` via data-tooltip. `multiline` keeps its line breaks;
 *  `heading` puts a title above `text` (.oc-tooltip__content); `side` is the preferred side (default top), with
 *  anchor positioning it flips when there is no room. */
defineProps<{ text: string; multiline?: boolean; heading?: string; side?: 'top' | 'bottom' | 'left' | 'right' }>()
</script>

<template>
  <span
    :class="['oc-tooltip', { 'oc-tooltip--multiline': multiline && !heading, [`oc-tooltip--${side}`]: side && side !== 'top' }]"
    :data-tooltip="heading ? undefined : text"
  >
    <slot />
    <span v-if="heading" class="oc-tooltip__content" role="tooltip"><span class="oc-tooltip__title">{{ heading }}</span>{{ text }}</span>
  </span>
</template>
