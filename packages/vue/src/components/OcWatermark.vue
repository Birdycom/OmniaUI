<!-- File: packages/vue/src/components/OcWatermark.vue | Map: props (text, variant, tone, repeat) -> span.oc-watermark (text once or tiled) -->
<script setup lang="ts">
/**
 * Light text over its positioned parent (put it last inside an element with class="relative"). Click-through and
 * aria-hidden. A logo or icon goes in the "mark" slot (<img> or <svg>) instead of text. Classes: .oc-watermark + --straight/--tile/--corner/--corner-top, --light/--primary/--destructive
 */
withDefaults(
  defineProps<{
    text?: string
    variant?: 'diagonal' | 'straight' | 'tile' | 'corner' | 'corner-top'
    tone?: 'default' | 'light' | 'primary' | 'destructive'
    repeat?: number
    mono?: boolean
  }>(),
  { text: 'Concept', variant: 'diagonal', tone: 'default', repeat: 12, mono: false },
)
</script>

<template>
  <span
    :class="['oc-watermark', variant !== 'diagonal' && `oc-watermark--${variant}`, tone !== 'default' && `oc-watermark--${tone}`, mono && 'oc-watermark--mono']"
    aria-hidden="true"
  >
    <template v-for="i in (variant === 'tile' ? Math.max(1, repeat) : 1)" :key="i">
      <slot v-if="$slots.mark" name="mark" />
      <span v-else><slot>{{ text }}</slot></span>
    </template>
  </span>
</template>
