<script setup lang="ts">
/**
 * Section title + grid of product cards, each with its own accent color (oc-accent--green|orange|violet|cyan...).
 * Classes: .oc-card-grid, .oc-product-card, -top, -name, -tagline, -summary, -more, .oc-icon-tile, .oc-pill
 */
export interface ProductItem {
  name: string
  tagline?: string
  summary?: string
  /** Pill text, e.g. "Own product" */
  tag?: string
  /** Glyph for the icon tile */
  icon?: string
  /** Accent name: green, orange, violet, cyan, ... */
  accent?: string
  href?: string
  more?: string
}
defineProps<{ eyebrow?: string; title?: string; highlight?: string; products: ProductItem[] }>()
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container">
      <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
      <h2 class="oc-display oc-display--md">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></h2>
      <div class="oc-card-grid">
        <a v-for="p in products" :key="p.name" :class="['oc-product-card', p.accent && `oc-accent--${p.accent}`]" :href="p.href ?? '#'">
          <div class="oc-product-card__top">
            <span class="oc-icon-tile" aria-hidden="true">{{ p.icon }}</span>
            <span v-if="p.tag" class="oc-pill">{{ p.tag }}</span>
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
