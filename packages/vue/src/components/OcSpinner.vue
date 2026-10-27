<script setup lang="ts">
/** Loading ring (inherits currentColor). With a `label` it is a role=status; without one it is aria-hidden (e.g. inside a button). Classes: .oc-spinner(--sm/--lg/--xl/--primary/--muted) */
defineProps<{ size?: 'sm' | 'md' | 'lg' | 'xl'; color?: 'primary' | 'muted'; label?: string }>()
</script>

<template>
  <span
    :class="['oc-spinner', size && size !== 'md' && `oc-spinner--${size}`, color && `oc-spinner--${color}`]"
    :role="label ? 'status' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  ></span>
</template>
