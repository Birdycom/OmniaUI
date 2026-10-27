<script setup lang="ts">
/** Key figures that count up when they scroll into view (CSS only). Classes: .oc-block-stats, -stat, -stat-value + .oc-counter, -stat-label */
import OcCounter from '../components/OcCounter.vue'

export interface CounterStat {
  to: number
  suffix?: string
  label: string
}
defineProps<{ items: CounterStat[] }>()
</script>

<template>
  <div class="oc-block-stats">
    <div v-for="item in items" :key="item.label" class="oc-block-stat">
      <OcCounter class="oc-block-stat-value" :to="item.to" :suffix="item.suffix" />
      <span class="oc-block-stat-label">{{ item.label }}</span>
    </div>
  </div>
</template>
