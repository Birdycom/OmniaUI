<!-- File: packages/vue/src/components/OcLinkCard.vue | Map: link -> tile (icon) -> title -> text (slot) -> more -->
<script setup lang="ts">
/** A card that is a whole link (snippets/feature-card.html). icon = webicon name; slots: default (text), icon. */
import OcWebicon from './OcWebicon.vue'
defineProps<{ title: string; href: string; icon?: string; accent?: string; more?: string }>()
</script>

<template>
  <a :class="['oc-link-card', accent && `oc-accent--${accent}`]" :href="href">
    <span v-if="icon || $slots.icon" class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">
      <slot name="icon"><OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /></slot>
    </span>
    <span class="oc-link-card__title">{{ title }}</span>
    <span v-if="$slots.default" class="oc-link-card__text"><slot /></span>
    <span v-if="more" class="oc-link-card__more">{{ more }}</span>
  </a>
</template>
