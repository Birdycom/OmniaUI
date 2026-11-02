<!-- File: packages/vue/src/components/OcStock.vue | Map: level -> default text -> dot, text and note -->
<script setup lang="ts">
/** Stock status with a colored dot (same markup as snippets/stock.html). Default slot = the text. */
const props = withDefaults(defineProps<{ level?: 'ok' | 'low' | 'out' | 'order'; badge?: boolean; note?: string }>(), { level: 'ok' })
const TEXT = { ok: 'In stock', low: 'Low stock', out: 'Out of stock', order: 'On order' } as const
</script>

<template>
  <span :class="['oc-stock', badge && 'oc-stock--badge']" :data-level="props.level === 'ok' ? undefined : props.level">
    <slot>{{ TEXT[props.level] }}</slot>
    <span v-if="note" class="oc-stock__note"> · {{ note }}</span>
  </span>
</template>
