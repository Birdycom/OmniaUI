<script setup lang="ts">
/** Call to action banner. Slot `actions` holds the buttons (inside .oc-block-hero-actions). */
defineProps<{ title?: string; text?: string }>()
</script>

<template>
  <div class="oc-block-cta">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <div v-if="$slots.actions" class="oc-block-hero-actions"><slot name="actions" /></div>
  </div>
</template>
