<!-- File: packages/vue/src/components/OcBrandMark.vue | Map: link -> icon (slot) -> word (name + accent) -> tagline -->
<script setup lang="ts">
/** Logo from an icon and text (snippets/brand-mark.html). Slot icon: an <svg class="oc-brand-mark__icon"> or <img>. */
withDefaults(defineProps<{ name: string; accent?: string; tagline?: string; href?: string; size?: 'sm' | 'md' | 'lg' }>(), { href: '/', size: 'md' })
</script>

<template>
  <a :class="['oc-brand-mark', size !== 'md' && `oc-brand-mark--${size}`]" :href="href">
    <slot name="icon" />
    <span class="oc-brand-mark__text">
      <span class="oc-brand-mark__word">{{ name }}<span v-if="accent" class="oc-brand-mark__accent">{{ accent }}</span></span>
      <span v-if="tagline" class="oc-brand-mark__tagline">{{ tagline }}</span>
    </span>
  </a>
</template>
