<script setup lang="ts">
/** Centered hero with badge, headline, text and actions. Classes: .oc-block-hero, -badge, -actions */
defineProps<{ badge?: string; title?: string; text?: string }>()
</script>

<template>
  <div class="oc-block-hero">
    <span v-if="badge" class="oc-block-hero-badge">{{ badge }}</span>
    <h1 v-if="title">{{ title }}</h1>
    <p v-if="text">{{ text }}</p>
    <div v-if="$slots.actions" class="oc-block-hero-actions"><slot name="actions" /></div>
  </div>
</template>
