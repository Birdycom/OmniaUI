<script setup lang="ts">
/** Alert. Classes: .oc-alert--info/success/warning/danger. Default slot = description. */
withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'danger'
    title?: string
  }>(),
  { variant: 'info' },
)
</script>

<template>
  <div :class="['oc-alert', `oc-alert--${variant}`]" role="status">
    <h4 v-if="title || $slots.title" class="oc-alert-title"><slot name="title">{{ title }}</slot></h4>
    <p v-if="$slots.default" class="oc-alert-description"><slot /></p>
  </div>
</template>
