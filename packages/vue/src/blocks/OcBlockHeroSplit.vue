<script setup lang="ts">
/** Hero with text left and visual right. Slots: actions, visual. Classes: .oc-block-hero-split, -actions, -visual. headingLevel 2 renders the title as h2 (same look). */
withDefaults(defineProps<{ title?: string; text?: string; headingLevel?: 1 | 2 }>(), { headingLevel: 1 })
</script>

<template>
  <div class="oc-block-hero-split">
    <div>
      <component :is="headingLevel === 2 ? 'h2' : 'h1'" v-if="title">{{ title }}</component>
      <p v-if="text">{{ text }}</p>
      <div v-if="$slots.actions" class="oc-block-hero-actions justify-start"><slot name="actions" /></div>
    </div>
    <div class="oc-block-hero-visual"><slot name="visual" /></div>
  </div>
</template>
