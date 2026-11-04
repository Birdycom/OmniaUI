<!-- File: packages/vue/src/components/OcTintCard.vue | Map: card (a or article) -> corner art -> head (title + arrow chip) -> text (slot) -> meta -->
<script setup lang="ts">
/** Link card tinted in one color, with a large drifting webicon in the corner (snippets/tint-card.html).
 *  icon = webicon name (or slot `icon`); tone = primary|success|warning|destructive|info|muted; slots: default (text), icon, meta. */
withDefaults(
  defineProps<{
    title: string
    href?: string
    icon?: string
    tone?: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted'
    meta?: string
    size?: 'md' | 'lg'
    headingLevel?: 2 | 3 | 4
    noArrow?: boolean
    /** Pro shape (.oc-tint-card--fill, needs OmniaUI Pro CSS). */
    fill?: boolean
  }>(),
  { headingLevel: 3 },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'article'"
    :href="href"
    :class="['oc-tint-card', tone && tone !== 'primary' && `oc-tint-card--${tone}`, size === 'lg' && 'oc-tint-card--lg', fill && 'oc-tint-card--fill']"
  >
    <span v-if="$slots.icon" class="oc-tint-card__art" aria-hidden="true"><slot name="icon" /></span>
    <iconify-icon v-else-if="icon" class="oc-tint-card__art" :icon="icon" aria-hidden="true" />
    <div class="oc-tint-card__head">
      <component :is="`h${headingLevel}`" class="oc-tint-card__title">{{ title }}</component>
      <span v-if="!noArrow" class="oc-tint-card__go" aria-hidden="true"><iconify-icon icon="material-symbols:arrow-outward-rounded" /></span>
    </div>
    <p v-if="$slots.default" class="oc-tint-card__text"><slot /></p>
    <p v-if="meta || $slots.meta" class="oc-tint-card__meta"><slot name="meta">{{ meta }}</slot></p>
  </component>
</template>
