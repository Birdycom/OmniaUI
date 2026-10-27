<script setup lang="ts">
/**
 * Portfolio grid: project cards with a browser frame around the screenshot.
 * `background` is any CSS background (use Omnia tokens, e.g. linear-gradient(135deg, var(--color-green-40), var(--color-teal-80))); `image` shows an img.
 * Classes: .oc-card-grid, .oc-product-card, .oc-browser-frame(__bar/__body), .oc-pill--accent
 */
export interface ShowcaseProject {
  name: string
  summary?: string
  tag?: string
  accent?: string
  href?: string
  background?: string
  image?: string
  more?: string
}
defineProps<{ eyebrow?: string; title?: string; highlight?: string; projects: ShowcaseProject[] }>()
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container">
      <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
      <h2 class="oc-display oc-display--md">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></h2>
      <div class="oc-card-grid" style="--oc-card-min: 26rem">
        <a v-for="p in projects" :key="p.name" :class="['oc-product-card', p.accent && `oc-accent--${p.accent}`, 'p-0 overflow-hidden']" :href="p.href ?? '#'">
          <span class="oc-browser-frame m-1">
            <span class="oc-browser-frame__bar"><i></i><i></i><i></i></span>
            <span class="oc-browser-frame__body" :style="p.background ? { background: p.background } : undefined">
              <img v-if="p.image" :src="p.image" alt="" />
            </span>
          </span>
          <span class="grid gap-0.5 p-1.5 pt-0">
            <span v-if="p.tag" class="oc-pill oc-pill--accent">{{ p.tag }}</span>
            <span class="oc-product-card__name">{{ p.name }}</span>
            <span v-if="p.summary" class="oc-product-card__summary">{{ p.summary }}</span>
            <span v-if="p.more" class="oc-product-card__more">{{ p.more }}</span>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
