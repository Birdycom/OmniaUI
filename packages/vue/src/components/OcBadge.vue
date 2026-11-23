<script setup lang="ts">
/**
 * Badge. Classes: .oc-badge + --secondary/--outline/--destructive/--success/--warning/--info
 * icon: webicon name before the text (or slot `icon`). title: tooltip; on a badge without text also its accessible name.
 * module (0.17.0): data-module (blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name): a default
 * badge takes the solid module colour; variant="module" is the soft tint (also from a module on an ancestor).
 */
import { computed, useSlots } from 'vue'
import OcWebicon from './OcWebicon.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'module'
    icon?: string
    title?: string
    module?: string
  }>(),
  { variant: 'default' },
)
const slots = useSlots()
const iconOnly = computed(() => !!(props.icon || slots.icon) && !slots.default)
</script>

<template>
  <span
    :class="['oc-badge', variant !== 'default' && `oc-badge--${variant}`]"
    :title="title"
    :data-module="module || undefined"
    :role="iconOnly && title ? 'img' : undefined"
    :aria-label="iconOnly && title ? title : undefined"
  >
    <slot name="icon"><OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /></slot><slot />
  </span>
</template>
