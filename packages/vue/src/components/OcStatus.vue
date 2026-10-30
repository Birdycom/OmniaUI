<!-- File: packages/vue/src/components/OcStatus.vue | Map: props (tone, meta) -> p.oc-status -> OcStatusDot + __text (slot) + __meta -->
<script setup lang="ts">
/** Status row: dot + one line of state text (slot, cuts off with …) + optional meta on the right.
 *  Classes: .oc-status, .oc-status__text, .oc-status__meta */
import OcStatusDot from './OcStatusDot.vue'

withDefaults(defineProps<{ tone?: 'default' | 'working' | 'waiting' | 'done' | 'error' | 'idle'; meta?: string }>(), { tone: 'default' })
</script>

<template>
  <p class="oc-status">
    <OcStatusDot :tone="tone" />
    <span class="oc-status__text"><slot /></span>
    <span v-if="meta || $slots.meta" class="oc-status__meta"><slot name="meta">{{ meta }}</slot></span>
  </p>
</template>
