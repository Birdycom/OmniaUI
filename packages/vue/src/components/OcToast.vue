<script setup lang="ts">
/**
 * One notification. Emits `dismiss`. role="alert" for errors, role="status" otherwise.
 * Slots: icon, title, default (description). Classes: .oc-toast--success/error/warning/info, -icon, -body,
 * -title, -description, -close
 */
const glyphs = { success: '✓', error: '!', warning: '!', info: 'i' } as const

withDefaults(
  defineProps<{
    variant?: 'success' | 'error' | 'warning' | 'info'
    title?: string
    description?: string
    dismissible?: boolean
    dismissLabel?: string
  }>(),
  { variant: 'info', dismissible: true, dismissLabel: 'Dismiss' },
)
defineEmits<{ dismiss: [] }>()
</script>

<template>
  <div :class="['oc-toast', `oc-toast--${variant}`]" :role="variant === 'error' ? 'alert' : 'status'">
    <span class="oc-toast-icon" aria-hidden="true"><slot name="icon">{{ glyphs[variant] }}</slot></span>
    <div class="oc-toast-body">
      <p class="oc-toast-title"><slot name="title">{{ title }}</slot></p>
      <p v-if="description || $slots.default" class="oc-toast-description"><slot>{{ description }}</slot></p>
    </div>
    <button v-if="dismissible" class="oc-toast-close" type="button" :aria-label="dismissLabel" @click="$emit('dismiss')">&times;</button>
  </div>
</template>
