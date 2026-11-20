<script setup lang="ts">
/**
 * Sidebar item: <a> with `href`, otherwise <button>. State: `current` (aria-current="page"), `disabled`.
 * Slots: icon (inline svg with class oc-sidebar-menu-icon), default (label). `badge` shows a count pill.
 * In a collapsed sidebar the label shows as a tooltip (`tooltip`, default: the text of the label; false: none).
 * active (0.17.0): the section that holds the current page (.is-active). In the docs sidebar the text stands without a
 * label span and without a tooltip.
 */
import { computed, inject, useSlots, type Ref } from 'vue'

const props = defineProps<{
  href?: string
  current?: boolean
  active?: boolean
  disabled?: boolean
  large?: boolean
  badge?: string | number
  tooltip?: string | false
}>()
const slots = useSlots()
const variant = inject<Ref<'app' | 'docs'> | null>('oc-sidebar-variant', null)
const docs = computed(() => variant?.value === 'docs')
const tip = computed(() => {
  if (props.tooltip === false || (docs.value && props.tooltip === undefined)) return undefined
  if (props.tooltip) return props.tooltip
  const text = (slots.default?.() ?? []).map((n) => (typeof n.children === 'string' ? n.children : '')).join('').trim()
  return text || undefined
})
const tag = computed(() => (props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    :class="['oc-sidebar-menu-button', large && 'oc-sidebar-menu-button--lg', active && 'is-active', tip && 'oc-tooltip oc-tooltip--right']"
    :data-tooltip="tip"
    :href="href"
    :type="tag === 'button' ? 'button' : undefined"
    :aria-current="current ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot name="icon" />
    <slot v-if="docs" />
    <span v-else class="oc-sidebar-menu-label"><slot /></span>
    <span v-if="badge !== undefined" class="oc-sidebar-menu-badge">{{ badge }}</span>
  </component>
</template>
