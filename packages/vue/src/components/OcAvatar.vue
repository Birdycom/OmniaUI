<script setup lang="ts">
/** Avatar (initials via the default slot, or an image via `src`). Classes: .oc-avatar--sm/lg/xl */
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl'
    src?: string
    alt?: string
  }>(),
  { size: 'md', alt: '' },
)
</script>

<template>
  <span :class="['oc-avatar', size !== 'md' && `oc-avatar--${size}`]">
    <img v-if="src" :src="src" :alt="alt" />
    <slot v-else />
  </span>
</template>
