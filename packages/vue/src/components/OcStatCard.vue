<!-- File: packages/vue/src/components/OcStatCard.vue | Map: card (div / a / button) -> icon slot -> body (value + trend, label) -->
<script setup lang="ts">
/**
 * Compact KPI tile. With `href` it is a link, with `button` a button (listen to @click), otherwise a div.
 * Put several in a <div class="oc-stat-card-grid">. Slots: icon.
 * Classes: .oc-stat-card(--accent/--success/--warning/--stripe), -icon, -body, -value, -label, -trend(--up/--down)
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string | number
    label: string
    trend?: string
    trendDirection?: 'up' | 'down'
    tone?: 'default' | 'accent' | 'success' | 'warning'
    stripe?: boolean
    href?: string
    button?: boolean
  }>(),
  { trendDirection: 'up', tone: 'default' },
)
const tag = computed(() => (props.href ? 'a' : props.button ? 'button' : 'div'))
</script>

<template>
  <component
    :is="tag"
    :class="['oc-stat-card', tone !== 'default' && `oc-stat-card--${tone}`, stripe && 'oc-stat-card--stripe']"
    :href="href"
    :type="button && !href ? 'button' : undefined"
  >
    <span v-if="$slots.icon" class="oc-stat-card-icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="oc-stat-card-body">
      <span class="oc-stat-card-value">{{ value }}<span v-if="trend" :class="['oc-stat-card-trend', `oc-stat-card-trend--${trendDirection}`]">{{ trend }}</span></span>
      <span class="oc-stat-card-label">{{ label }}</span>
    </span>
  </component>
</template>
