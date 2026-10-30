<script setup lang="ts">
/**
 * Button. Renders <a> when `href` is set, otherwise <button>.
 * Classes: .oc-btn + --secondary/--outline/--ghost/--link/--destructive/--success/--gradient/--glass,
 * --xs/--sm/--lg, --icon, --pill, --inline (link button inside running text)
 */
withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'gradient' | 'glass'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    icon?: boolean
    pill?: boolean
    inline?: boolean
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
