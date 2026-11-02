<!-- File: packages/vue/src/components/OcGallery.vue | Map: images (max 8) -> stage with slides -> thumbnail radios -->
<script setup lang="ts">
/** Product photos with thumbnails (same markup as snippets/gallery.html), CSS only: radios and :has(). */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'

export interface GalleryImage { src: string; alt: string; thumb?: string; thumbAlt?: string }
const props = withDefaults(defineProps<{ images: GalleryImage[]; label?: string; badge?: string; side?: boolean; name?: string }>(), { label: 'Photos' })
const group = props.name ?? useUid('oc-gallery')
const list = computed(() => props.images.slice(0, 8))
</script>

<template>
  <div :class="['oc-gallery', side && 'oc-gallery--side']">
    <div class="oc-gallery__stage">
      <span v-if="badge" class="oc-badge oc-badge--destructive oc-gallery__badge">{{ badge }}</span>
      <figure v-for="(img, i) in list" :key="i" class="oc-gallery__slide"><img :src="img.src" :alt="img.alt" :loading="i ? 'lazy' : undefined"></figure>
    </div>
    <fieldset v-if="list.length > 1" class="oc-gallery__thumbs">
      <legend>{{ label }}</legend>
      <label v-for="(img, i) in list" :key="i" class="oc-gallery__thumb">
        <input type="radio" :name="group" :checked="i === 0">
        <img :src="img.thumb ?? img.src" :alt="img.thumbAlt ?? img.alt">
      </label>
    </fieldset>
  </div>
</template>
