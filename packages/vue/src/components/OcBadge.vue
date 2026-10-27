<script setup lang="ts">
/** Badge. Classes: .oc-badge + --secondary/--outline/--destructive/--success/--warning/--info */
withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <span :class="['oc-badge', variant !== 'default' && `oc-badge--${variant}`]"><slot /></span>
</template>
