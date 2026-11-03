<!-- File: packages/vue/src/components/OcFeatureCard.vue | Map: tile (icon) -> title -> text (slot) -->
<script setup lang="ts">
/** Service or feature card (snippets/feature-card.html). icon = webicon name; slots: default (text), icon. */
withDefaults(defineProps<{ title: string; icon?: string; accent?: string; headingLevel?: 2 | 3 | 4 }>(), { headingLevel: 3 })
</script>

<template>
  <article class="oc-feature-card">
    <span v-if="icon || $slots.icon" :class="['oc-icon-tile oc-icon-tile--sm', accent && `oc-accent--${accent}`]" aria-hidden="true">
      <slot name="icon"><iconify-icon :icon="icon" /></slot>
    </span>
    <component :is="`h${headingLevel}`" class="oc-feature-card__title">{{ title }}</component>
    <p v-if="$slots.default" class="oc-feature-card__text"><slot /></p>
  </article>
</template>
