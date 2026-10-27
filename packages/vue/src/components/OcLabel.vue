<script setup lang="ts">
/** Form label. `for` links it to a control. Classes: .oc-label(--required/--inline/--muted) */
defineProps<{ for?: string; required?: boolean; inline?: boolean; muted?: boolean }>()
</script>

<template>
  <label :class="['oc-label', required && 'oc-label--required', inline && 'oc-label--inline', muted && 'oc-label--muted']" :for="$props.for">
    <slot />
  </label>
</template>
