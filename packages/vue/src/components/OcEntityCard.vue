<!-- File: packages/vue/src/components/OcEntityCard.vue | Map: props -> article -> grid (frame | body: eyebrow, title, description, facts) -> footer -->
<script setup lang="ts">
/**
 * Framed media cell + detail column (same markup as snippets/entity-card.html).
 * Props: title, eyebrow, description, src / alt or glyph (frame content), contain, facts ([key, value][]), stacked, size (sm|md).
 * Slots: media (frame content), default (extra body content), footer. Classes: .oc-entity-card(--stacked/--sm), __grid,
 * __frame(--contain), __glyph, __body, __eyebrow, __title, __description, __facts, __footer
 */
withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    src?: string
    alt?: string
    glyph?: string
    contain?: boolean
    facts?: [string, string][]
    stacked?: boolean
    size?: 'sm' | 'md'
  }>(),
  { alt: '', size: 'md' },
)
</script>

<template>
  <article :class="['oc-entity-card', stacked && 'oc-entity-card--stacked', size === 'sm' && 'oc-entity-card--sm']">
    <div class="oc-entity-card__grid">
      <div :class="['oc-entity-card__frame', contain && 'oc-entity-card__frame--contain']">
        <slot name="media">
          <img v-if="src" :src="src" :alt="alt" />
          <span v-else-if="glyph" class="oc-entity-card__glyph" aria-hidden="true">{{ glyph }}</span>
        </slot>
      </div>
      <div class="oc-entity-card__body">
        <p v-if="eyebrow" class="oc-entity-card__eyebrow">{{ eyebrow }}</p>
        <h3 class="oc-entity-card__title">{{ title }}</h3>
        <p v-if="description" class="oc-entity-card__description">{{ description }}</p>
        <dl v-if="facts?.length" class="oc-entity-card__facts">
          <template v-for="([k, v], i) in facts" :key="i"><dt>{{ k }}</dt><dd>{{ v }}</dd></template>
        </dl>
        <slot />
      </div>
    </div>
    <div v-if="$slots.footer" class="oc-entity-card__footer"><slot name="footer" /></div>
  </article>
</template>
