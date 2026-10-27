<!-- File: packages/vue/src/components/OcMediaRow.vue | Map: props -> li row -> OcMediaThumb -> title link + meta -> menu button + popover -->
<script setup lang="ts">
/**
 * Compact media row (same markup as snippets/media-row.html). Put rows in
 * <ul class="oc-media-row-list"> or <ol class="oc-media-row-list oc-media-row-list--numbered"> (numbered playlist).
 * Props: title, href (link covers the row), meta, thumb (props for OcMediaThumb), current (aria-current).
 * Slots: meta, menu (dropdown items; shows the ⋮ button). Classes: .oc-media-row, __text, __title, __meta, __menu
 */
import OcMediaThumb from './OcMediaThumb.vue'
import { useUid } from '../composables/useUid'

defineProps<{ title: string; href: string; meta?: string; thumb?: Record<string, unknown>; current?: boolean }>()
const menuId = useUid('oc-media-row-menu')
</script>

<template>
  <li class="oc-media-row" :aria-current="current ? 'true' : undefined">
    <OcMediaThumb v-bind="thumb" />
    <div class="oc-media-row__text">
      <h3 class="oc-media-row__title"><a :href="href">{{ title }}</a></h3>
      <p v-if="meta || $slots.meta" class="oc-media-row__meta"><slot name="meta">{{ meta }}</slot></p>
    </div>
    <template v-if="$slots.menu">
      <button type="button" class="oc-media-row__menu" :popovertarget="menuId" aria-label="More actions">&#8942;</button>
      <div :id="menuId" class="oc-dropdown-menu" popover><slot name="menu" /></div>
    </template>
  </li>
</template>
