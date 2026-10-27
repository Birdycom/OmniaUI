<!-- File: packages/vue/src/components/OcMediaCard.vue | Map: props -> article -> OcMediaThumb -> body (avatar, title + meta, menu) -> popover menu -->
<script setup lang="ts">
/**
 * Video feed card (same markup as snippets/media-card.html). Props: title, href (title link covers the card), meta,
 * avatar (initials), thumb (props for OcMediaThumb), compact. Slots: avatar (replaces initials), meta, menu (dropdown items;
 * shows the ⋮ button). Classes: .oc-media-card(--compact), __body, __avatar, __text, __title, __meta, __menu
 */
import OcMediaThumb from './OcMediaThumb.vue'
import { useUid } from '../composables/useUid'

defineProps<{ title: string; href: string; meta?: string; avatar?: string; thumb?: Record<string, unknown>; compact?: boolean }>()
const menuId = useUid('oc-media-card-menu')
</script>

<template>
  <article :class="['oc-media-card', compact && 'oc-media-card--compact']">
    <OcMediaThumb v-bind="thumb" />
    <div class="oc-media-card__body">
      <span v-if="avatar || $slots.avatar" class="oc-media-card__avatar" aria-hidden="true"><slot name="avatar">{{ avatar }}</slot></span>
      <div class="oc-media-card__text">
        <h3 class="oc-media-card__title"><a :href="href">{{ title }}</a></h3>
        <p v-if="meta || $slots.meta" class="oc-media-card__meta"><slot name="meta">{{ meta }}</slot></p>
      </div>
      <button v-if="$slots.menu" type="button" class="oc-media-card__menu" :popovertarget="menuId" aria-label="More actions">&#8942;</button>
    </div>
    <div v-if="$slots.menu" :id="menuId" class="oc-dropdown-menu" popover><slot name="menu" /></div>
  </article>
</template>
