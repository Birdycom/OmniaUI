<!-- File: packages/vue/src/blocks/OcBlockProductGrid.vue | Map: props -> eyebrow, title (slot) -> grid of accent product cards -->
<script setup lang="ts">
/**
 * Section title + grid of product cards, each with its own accent color (oc-accent--green|orange|violet|cyan...).
 * `pill` is the label in the card top (`tag` still works); `icon` is a glyph or a webicon name (mdi:package-variant).
 * Slot: title. Classes: .oc-card-grid, .oc-product-card, -top, -name, -tagline, -summary, -more, .oc-icon-tile, .oc-pill
 */
import OcWebicon from '../components/OcWebicon.vue'

export interface ProductItem {
  name: string
  tagline?: string
  summary?: string
  /** Pill text, e.g. "Own product" (same as `tag`). */
  pill?: string
  tag?: string
  /** Glyph or webicon name for the icon tile */
  icon?: string
  /** Accent name: green, orange, violet, cyan, ... */
  accent?: string
  href?: string
  more?: string
}
defineProps<{ eyebrow?: string; title?: string; highlight?: string; products: ProductItem[] }>()
const isIcon = (v?: string) => typeof v === 'string' && v.includes(':')
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container">
      <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
      <h2 class="oc-display oc-display--md"><slot name="title">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></slot></h2>
      <div class="oc-card-grid">
        <a v-for="(p, i) in products" :key="i" :class="['oc-product-card', p.accent && `oc-accent--${p.accent}`]" :href="p.href ?? '#'">
          <div class="oc-product-card__top">
            <span v-if="p.icon" class="oc-icon-tile" aria-hidden="true"><OcWebicon v-if="isIcon(p.icon)" :name="p.icon" bare fallback="iconify" /><template v-else>{{ p.icon }}</template></span>
            <span v-if="p.pill ?? p.tag" class="oc-pill">{{ p.pill ?? p.tag }}</span>
          </div>
          <h3 class="oc-product-card__name">{{ p.name }}</h3>
          <p v-if="p.tagline" class="oc-product-card__tagline">{{ p.tagline }}</p>
          <p v-if="p.summary" class="oc-product-card__summary">{{ p.summary }}</p>
          <span v-if="p.more" class="oc-product-card__more">{{ p.more }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
