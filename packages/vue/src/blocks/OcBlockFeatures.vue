<script setup lang="ts">
/** Feature grid with icons. Slot `icon` (scoped: { item }) overrides the glyph. Classes: .oc-block-features, -grid, .oc-block-feature-card, -icon */
export interface FeatureItem {
  icon?: string
  title: string
  text: string
}
defineProps<{ title?: string; description?: string; items: FeatureItem[] }>()
</script>

<template>
  <div class="oc-block-features">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div class="oc-block-features-grid">
      <div v-for="(item, i) in items" :key="i" class="oc-block-feature-card">
        <div class="oc-block-feature-icon"><slot name="icon" :item="item">{{ item.icon }}</slot></div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </div>
</template>
