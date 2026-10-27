<script setup lang="ts">
/** Key figures row. Classes: .oc-block-stats, -stat, -stat-value, -stat-label */
export interface StatItem {
  value: string
  label: string
}
defineProps<{ items: StatItem[] }>()
</script>

<template>
  <div class="oc-block-stats">
    <div v-for="item in items" :key="item.label" class="oc-block-stat">
      <div class="oc-block-stat-value">{{ item.value }}</div>
      <div class="oc-block-stat-label">{{ item.label }}</div>
    </div>
  </div>
</template>
