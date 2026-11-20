<script setup lang="ts">
/** Centered hero with badge, headline, text and actions. Classes: .oc-block-hero, -badge, -actions. headingLevel 2 renders the title as h2 (same look). */
withDefaults(defineProps<{ badge?: string; title?: string; text?: string; headingLevel?: 1 | 2 }>(), { headingLevel: 1 })
</script>

<template>
  <div class="oc-block-hero">
    <span v-if="badge" class="oc-block-hero-badge">{{ badge }}</span>
    <component :is="headingLevel === 2 ? 'h2' : 'h1'" v-if="title">{{ title }}</component>
    <p v-if="text">{{ text }}</p>
    <div v-if="$slots.actions" class="oc-block-hero-actions"><slot name="actions" /></div>
  </div>
</template>
