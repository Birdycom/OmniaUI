<script setup lang="ts">
/**
 * Badge. Classes: .oc-badge + --secondary/--outline/--destructive/--success/--warning/--info/--module/--readonly
 * icon: webicon name before the text (or slot `icon`); `false` hides the icon of a status. title: tooltip; on a badge
 * without text also its accessible name.
 * module (0.17.0): data-module (blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name): a default
 * badge takes the solid module colour; variant="module" is the soft tint (also from a module on an ancestor).
 * status (0.17.1): a ready-made status (paid, pending, overdue, draft, sent, cancelled, approved, rejected, active, inactive,
 * archived, failed, refunded, scheduled, in-progress, done, read-only, working, waiting, error, idle): .oc-badge--status +
 * data-status, its webicon and its English label (the default slot replaces the label).
 * variant="readonly" (0.17.1): a read-only value chip (a contact, an account); the text is cut off with an ellipsis.
 */
import { computed, useSlots } from 'vue'
import OcWebicon from './OcWebicon.vue'
import { badgeStatuses } from '../badgeStatus'
import type { BadgeStatus } from '../badgeStatus'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'module' | 'readonly'
    status?: BadgeStatus | (string & {})
    icon?: string | false
    title?: string
    module?: string
  }>(),
  { variant: 'default', icon: undefined },
)
const slots = useSlots()
const preset = computed(() => (props.status ? badgeStatuses[props.status as BadgeStatus] : undefined))
const shownIcon = computed(() => (props.icon === undefined ? preset.value?.icon : props.icon || undefined))
const kind = computed(() => (props.status ? 'status' : props.variant))
const label = computed(() => (slots.default ? undefined : preset.value?.label))
const iconOnly = computed(() => !!(shownIcon.value || slots.icon) && !slots.default && !label.value)
</script>

<template>
  <span
    :class="['oc-badge', kind !== 'default' && `oc-badge--${kind}`]"
    :title="title"
    :data-status="status || undefined"
    :data-module="module || undefined"
    :role="iconOnly && title ? 'img' : undefined"
    :aria-label="iconOnly && title ? title : undefined"
  >
    <slot name="icon"><OcWebicon v-if="shownIcon" :name="shownIcon" bare fallback="iconify" /></slot
    ><span v-if="kind === 'readonly' && (slots.default || label)"><slot>{{ label }}</slot></span
    ><slot v-else>{{ label }}</slot>
  </span>
</template>
