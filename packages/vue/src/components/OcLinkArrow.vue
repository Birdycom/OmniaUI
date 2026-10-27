<!-- File: packages/vue/src/components/OcLinkArrow.vue | Map: props (direction, tone, size) -> a.oc-link-arrow -->
<script setup lang="ts">
/** Text link with a moving arrow. Classes: .oc-link-arrow + --back/--external, --accent/--muted, --sm/--lg */
withDefaults(
  defineProps<{
    href: string
    direction?: 'forward' | 'back' | 'external'
    tone?: 'default' | 'accent' | 'muted'
    size?: 'sm' | 'default' | 'lg'
  }>(),
  { direction: 'forward', tone: 'default', size: 'default' },
)
</script>

<template>
  <a
    :class="[
      'oc-link-arrow',
      direction !== 'forward' && `oc-link-arrow--${direction}`,
      tone !== 'default' && `oc-link-arrow--${tone}`,
      size !== 'default' && `oc-link-arrow--${size}`,
    ]"
    :href="href"
  ><slot /></a>
</template>
