<!-- File: packages/vue/src/components/OcProductMark.vue | Map: props (size, accent, soft, glow, cover) -> span.oc-product-mark -->
<script setup lang="ts">
/**
 * Squircle app-icon tile in the accent gradient. Slot: glyph, <img alt=""> or SVG. Decorative (aria-hidden).
 * Classes: .oc-product-mark (--sm, --lg, --xl, --soft, --glow, --cover) + .oc-accent--*
 */
withDefaults(
  defineProps<{
    size?: 'sm' | 'default' | 'lg' | 'xl'
    accent?: 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'violet' | 'yellow'
    soft?: boolean
    glow?: boolean
    cover?: boolean
  }>(),
  { size: 'default' },
)
</script>

<template>
  <span
    :class="[
      'oc-product-mark',
      size !== 'default' && `oc-product-mark--${size}`,
      soft && 'oc-product-mark--soft',
      glow && 'oc-product-mark--glow',
      cover && 'oc-product-mark--cover',
      accent && `oc-accent--${accent}`,
    ]"
    aria-hidden="true"
  ><slot /></span>
</template>
