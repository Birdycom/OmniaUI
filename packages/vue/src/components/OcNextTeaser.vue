<!-- File: packages/vue/src/components/OcNextTeaser.vue | Map: props -> a.oc-next-teaser -> label -> name (mark slot) -> tagline -->
<script setup lang="ts">
/**
 * "Next product" teaser card. Slots: mark (e.g. an OcProductMark size="sm"), name, tagline.
 * Classes: .oc-next-teaser (--prev), __label, __name, __tagline
 */
withDefaults(
  defineProps<{
    href: string
    label?: string
    name?: string
    tagline?: string
    prev?: boolean
  }>(),
  { label: 'Next product' },
)
</script>

<template>
  <a :class="['oc-next-teaser', prev && 'oc-next-teaser--prev']" :href="href">
    <span v-if="label" class="oc-next-teaser__label">{{ label }}</span>
    <span class="oc-next-teaser__name"><slot name="mark" /><slot name="name">{{ name }}</slot></span>
    <span v-if="tagline || $slots.tagline" class="oc-next-teaser__tagline"><slot name="tagline">{{ tagline }}</slot></span>
  </a>
</template>
