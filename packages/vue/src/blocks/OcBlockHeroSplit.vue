<script setup lang="ts">
/** Hero with text left and visual right. Slots: actions, visual. Classes: .oc-block-hero-split, -actions, -visual */
defineProps<{ title?: string; text?: string }>()
</script>

<template>
  <div class="oc-block-hero-split">
    <div>
      <h1 v-if="title">{{ title }}</h1>
      <p v-if="text">{{ text }}</p>
      <div v-if="$slots.actions" class="oc-block-hero-actions justify-start"><slot name="actions" /></div>
    </div>
    <div class="oc-block-hero-visual"><slot name="visual" /></div>
  </div>
</template>
