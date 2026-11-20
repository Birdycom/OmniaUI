<!-- File: packages/vue/src/components/OcLazyImage.vue | Map: props -> figure.oc-lazy (ratio, preview) -> img loading=lazy -> loaded / error state -->
<script setup lang="ts">
/** An image that keeps its place, shows a shimmer (or a blurred preview) and fades in once loaded (same markup as
 *  snippets/lazy.html). Props: src, alt, width, height, ratio, preview, caption, loading, thumb (.oc-lazy--thumb, a small
 *  square for a table row). Without src only the placeholder is shown (role="img", alt as its name). Slot: caption. */
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ src?: string; alt: string; width?: number; height?: number; ratio?: string; preview?: string; caption?: string; loading?: 'lazy' | 'eager'; thumb?: boolean }>(), { loading: 'lazy', thumb: false })
const state = ref<'' | 'is-loaded' | 'is-error'>('')
const vars = computed(() => ({ ...(props.ratio ? { '--oc-lazy-ratio': props.ratio } : {}), ...(props.preview ? { '--oc-lazy-preview': `url(${props.preview})` } : {}) }))
</script>

<template>
  <figure :class="['oc-lazy', thumb && 'oc-lazy--thumb', state]" :style="vars" :role="src ? undefined : 'img'" :aria-label="src ? undefined : alt">
    <img v-if="src" :src="src" :alt="alt" :width="width" :height="height" :loading="loading" decoding="async" @load="state = 'is-loaded'" @error="state = 'is-error'">
    <figcaption v-if="caption || $slots.caption"><slot name="caption">{{ caption }}</slot></figcaption>
  </figure>
</template>
