<!-- File: packages/vue/src/components/OcLazyImage.vue | Map: props -> figure.oc-lazy (ratio, preview) -> img loading=lazy -> loaded / error state -->
<script setup lang="ts">
/** An image that keeps its place, shows a shimmer (or a blurred preview) and fades in once loaded (same markup as
 *  snippets/lazy.html). Props: src, alt, width, height, ratio, preview, caption, loading. Slot: caption. */
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ src: string; alt: string; width?: number; height?: number; ratio?: string; preview?: string; caption?: string; loading?: 'lazy' | 'eager' }>(), { loading: 'lazy' })
const state = ref<'' | 'is-loaded' | 'is-error'>('')
const vars = computed(() => ({ ...(props.ratio ? { '--oc-lazy-ratio': props.ratio } : {}), ...(props.preview ? { '--oc-lazy-preview': `url(${props.preview})` } : {}) }))
</script>

<template>
  <figure :class="['oc-lazy', state]" :style="vars">
    <img :src="src" :alt="alt" :width="width" :height="height" :loading="loading" decoding="async" @load="state = 'is-loaded'" @error="state = 'is-error'">
    <figcaption v-if="caption || $slots.caption"><slot name="caption">{{ caption }}</slot></figcaption>
  </figure>
</template>
