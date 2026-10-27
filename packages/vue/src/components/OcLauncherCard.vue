<script setup lang="ts">
/**
 * Large clickable card with icon, title and description. Renders <a> with `href`, <span> when disabled,
 * otherwise <button>. State: `current` (aria-current), `disabled` (aria-disabled).
 * Slots: icon, title (+ trailing badge), description, footer.
 */
import { computed } from 'vue'

const props = defineProps<{
  href?: string
  title?: string
  description?: string
  footer?: string
  current?: boolean
  disabled?: boolean
}>()
const tag = computed(() => (props.disabled ? 'span' : props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    class="oc-launcher"
    :href="tag === 'a' ? href : undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :aria-current="current ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <span v-if="$slots.icon" class="oc-launcher-icon" aria-hidden="true"><slot name="icon" /></span>
    <h3 class="oc-launcher-title"><slot name="title">{{ title }}</slot></h3>
    <p v-if="description || $slots.description" class="oc-launcher-description"><slot name="description">{{ description }}</slot></p>
    <span v-if="footer || $slots.footer" class="oc-launcher-footer"><slot name="footer">{{ footer }}</slot></span>
  </component>
</template>
