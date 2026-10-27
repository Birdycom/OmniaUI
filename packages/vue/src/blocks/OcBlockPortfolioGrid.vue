<!-- File: packages/vue/src/blocks/OcBlockPortfolioGrid.vue | Map: props -> head (title, lead, link slot) -> grid of OcProjectCard -->
<script setup lang="ts">
/**
 * Portfolio section: heading, lead, "all projects" link and a grid of project cards.
 * `title` + `highlight` (gradient word). Slots: link, default (own cards). Classes: .oc-block-portfolio (--two), -head, -lead, -grid
 */
import OcProjectCard from '../components/OcProjectCard.vue'
import { useUid } from '../composables/useUid'

export interface PortfolioGridProject {
  href: string
  name: string
  type?: string
  meta?: string
  more?: string
  image?: string
  imageAlt?: string
  accent?: string
}
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    highlight?: string
    lead?: string
    projects?: PortfolioGridProject[]
    two?: boolean
  }>(),
  { projects: () => [] },
)
const titleId = useUid('oc-portfolio-title')
</script>

<template>
  <section :class="['oc-block-portfolio oc-section-pad', two && 'oc-block-portfolio--two']" :aria-labelledby="titleId">
    <div class="oc-container">
      <div class="oc-block-portfolio-head">
        <div>
          <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
          <h2 :id="titleId" class="oc-display oc-display--md">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></h2>
          <p v-if="lead" class="oc-block-portfolio-lead">{{ lead }}</p>
        </div>
        <slot name="link" />
      </div>
      <div class="oc-block-portfolio-grid">
        <slot>
          <OcProjectCard
            v-for="(p, i) in projects"
            :key="i"
            :class="p.accent && `oc-accent--${p.accent}`"
            :href="p.href"
            :name="p.name"
            :type="p.type"
            :meta="p.meta"
            :more="p.more ?? 'View project'"
            :image="p.image"
            :image-alt="p.imageAlt"
          />
        </slot>
      </div>
    </div>
  </section>
</template>
