<!-- File: packages/vue/src/components/OcStackCard.vue | Map: props -> article -> deck (OcMediaThumb cover + count) -> title link + meta -->
<script setup lang="ts">
/**
 * Stacked deck card for playlists / courses (same markup as snippets/stack-card.html).
 * Props: title, href (link covers the card), meta, count ("12 videos"), panel (side panel count), thumb (props for OcMediaThumb).
 * Slots: count (replaces the count text), meta. Classes: .oc-stack-card(--panel), __deck, __count, __title, __meta
 */
import OcMediaThumb from './OcMediaThumb.vue'

defineProps<{ title: string; href: string; meta?: string; count?: string; panel?: boolean; thumb?: Record<string, unknown> }>()
</script>

<template>
  <article :class="['oc-stack-card', panel && 'oc-stack-card--panel']">
    <div class="oc-stack-card__deck">
      <OcMediaThumb v-bind="thumb" />
      <span v-if="count || $slots.count" class="oc-stack-card__count"><slot name="count">{{ count }}</slot></span>
    </div>
    <div>
      <h3 class="oc-stack-card__title"><a :href="href">{{ title }}</a></h3>
      <p v-if="meta || $slots.meta" class="oc-stack-card__meta"><slot name="meta">{{ meta }}</slot></p>
    </div>
  </article>
</template>
