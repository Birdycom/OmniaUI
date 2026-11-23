<!-- File: packages/vue/src/components/OcShotGrid.vue | Map: div.oc-shot-grid (min, ratio) -> figure.oc-shot per item (link, lightbox button or plain image, caption) -> slot -> OcLightbox per item -->
<script setup lang="ts">
/**
 * Auto-fit grid of screenshots with captions (snippets/shot-grid.html). items: { src, alt, caption?, href? (default the image; false = no link), width?, height? }[].
 * Props: min (--oc-shot-min), ratio (--oc-shot-ratio), lightbox (0.17.0: every image is a button that opens it large in an
 * OcLightbox in the grid, after the figures). Slot: extra figure.oc-shot elements.
 */
import { ref } from 'vue'
import OcLightbox from './OcLightbox.vue'

export interface ShotItem {
  src: string
  alt: string
  caption?: string
  href?: string | false
  width?: number
  height?: number
}
withDefaults(defineProps<{ items?: ShotItem[]; min?: string; ratio?: string; lightbox?: boolean }>(), { items: () => [] })
const link = (item: ShotItem) => (item.href === false ? null : item.href ?? item.src)
const open = ref<number | null>(null)
</script>

<template>
  <div class="oc-shot-grid" :style="{ ...(min ? { '--oc-shot-min': min } : {}), ...(ratio ? { '--oc-shot-ratio': ratio } : {}) }">
    <figure v-for="(item, i) in items" :key="i" class="oc-shot">
      <button v-if="lightbox" type="button" :aria-label="`Open the screenshot: ${item.alt}`" @click="open = i"><img :src="item.src" :alt="item.alt" loading="lazy" :width="item.width ?? 640" :height="item.height ?? 400" /></button>
      <a v-else-if="link(item)" :href="link(item)!"><img :src="item.src" :alt="item.alt" loading="lazy" :width="item.width ?? 640" :height="item.height ?? 400" /></a>
      <img v-else :src="item.src" :alt="item.alt" loading="lazy" :width="item.width ?? 640" :height="item.height ?? 400" />
      <figcaption v-if="item.caption">{{ item.caption }}</figcaption>
    </figure>
    <slot />
    <!-- The dialogs sit in the grid but outside the figures, so the .oc-shot image rules do not reach the large view. -->
    <template v-if="lightbox">
      <OcLightbox
        v-for="(item, i) in items"
        :key="`view-${i}`"
        :images="[{ src: item.src, alt: item.alt, caption: item.caption }]"
        :title="item.caption"
        :label="item.alt"
        :thumbnails="false"
        :open="open === i"
        @update:open="(o: boolean) => (open = o ? i : open === i ? null : open)"
      />
    </template>
  </div>
</template>
