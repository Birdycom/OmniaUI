<!-- File: packages/vue/src/components/OcShotGrid.vue | Map: div.oc-shot-grid (min, ratio) -> figure.oc-shot per item (link or plain image, caption) -> slot -->
<script setup lang="ts">
/**
 * Auto-fit grid of screenshots with captions (snippets/shot-grid.html). items: { src, alt, caption?, href? (default the image; false = no link), width?, height? }[].
 * Props: min (--oc-shot-min), ratio (--oc-shot-ratio). Slot: extra figure.oc-shot elements.
 */
export interface ShotItem {
  src: string
  alt: string
  caption?: string
  href?: string | false
  width?: number
  height?: number
}
withDefaults(defineProps<{ items?: ShotItem[]; min?: string; ratio?: string }>(), { items: () => [] })
const link = (item: ShotItem) => (item.href === false ? null : item.href ?? item.src)
</script>

<template>
  <div class="oc-shot-grid" :style="{ ...(min ? { '--oc-shot-min': min } : {}), ...(ratio ? { '--oc-shot-ratio': ratio } : {}) }">
    <figure v-for="(item, i) in items" :key="i" class="oc-shot">
      <a v-if="link(item)" :href="link(item)!"><img :src="item.src" :alt="item.alt" loading="lazy" :width="item.width ?? 640" :height="item.height ?? 400" /></a>
      <img v-else :src="item.src" :alt="item.alt" loading="lazy" :width="item.width ?? 640" :height="item.height ?? 400" />
      <figcaption v-if="item.caption">{{ item.caption }}</figcaption>
    </figure>
    <slot />
  </div>
</template>
