<script setup lang="ts">
/**
 * Button. Renders <a> when `href` is set, otherwise <button>.
 * Classes: .oc-btn + --secondary/--outline/--ghost/--link/--destructive/--success/--gradient/--glass,
 * --soft-primary/-success/-warning/-destructive/-info (row actions), --plain (icon only, no surface),
 * --xs/--sm/--lg, --icon, --pill, --inline (link button inside running text). `loading` sets aria-busy (spinner).
 */
withDefaults(
  defineProps<{
    variant?:
      | 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'gradient' | 'glass'
      | 'soft-primary' | 'soft-success' | 'soft-warning' | 'soft-destructive' | 'soft-info' | 'plain'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    icon?: boolean
    pill?: boolean
    inline?: boolean
    loading?: boolean
    disabled?: boolean
    href?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'default', size: 'md', type: 'button' },
)
</script>

<template>
  <a
    v-if="href"
    :href="href"
    :aria-busy="loading || undefined"
    :class="[
      'oc-btn',
      variant !== 'default' && `oc-btn--${variant}`,
      size !== 'md' && `oc-btn--${size}`,
      icon && 'oc-btn--icon',
      pill && 'oc-btn--pill',
      inline && 'oc-btn--inline',
    ]"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :aria-busy="loading || undefined"
    :disabled="disabled || loading"
    :class="[
      'oc-btn',
      variant !== 'default' && `oc-btn--${variant}`,
      size !== 'md' && `oc-btn--${size}`,
      icon && 'oc-btn--icon',
      pill && 'oc-btn--pill',
      inline && 'oc-btn--inline',
    ]"
  >
    <slot />
  </button>
</template>
