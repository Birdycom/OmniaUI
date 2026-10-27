<script setup lang="ts">
/** Page header (the oc-hero used on every docs page): eyebrow, title, text, actions. Classes: .oc-hero, -eyebrow, -title, -text, -actions */
defineProps<{ eyebrow?: string; title: string; text?: string }>()
</script>

<template>
  <section class="oc-hero">
    <span v-if="eyebrow" class="oc-hero-eyebrow">{{ eyebrow }}</span>
    <h1 class="oc-hero-title">{{ title }}</h1>
    <p v-if="text" class="oc-hero-text">{{ text }}</p>
    <div v-if="$slots.actions" class="oc-hero-actions"><slot name="actions" /></div>
  </section>
</template>
