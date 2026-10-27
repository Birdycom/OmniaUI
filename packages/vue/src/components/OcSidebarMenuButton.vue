<script setup lang="ts">
/**
 * Sidebar item: <a> with `href`, otherwise <button>. State: `current` (aria-current="page"), `disabled`.
 * Slots: icon (inline svg with class oc-sidebar-menu-icon), default (label). `badge` shows a count pill.
 */
import { computed } from 'vue'

const props = defineProps<{
  href?: string
  current?: boolean
  disabled?: boolean
  large?: boolean
  badge?: string | number
}>()
const tag = computed(() => (props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    :class="['oc-sidebar-menu-button', large && 'oc-sidebar-menu-button--lg']"
    :href="href"
    :type="tag === 'button' ? 'button' : undefined"
    :aria-current="current ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot name="icon" />
    <span class="oc-sidebar-menu-label"><slot /></span>
    <span v-if="badge !== undefined" class="oc-sidebar-menu-badge">{{ badge }}</span>
  </component>
</template>
