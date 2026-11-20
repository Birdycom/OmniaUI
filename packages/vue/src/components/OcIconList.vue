<!-- File: packages/vue/src/components/OcIconList.vue | Map: variant -> ul.oc-icon-list (icon rows | --points: tile + title + text) | ul.oc-list--accent -->
<script setup lang="ts">
/**
 * Lists for a company site (snippets/icon-list.html). items: { icon? (webicon name), text?, title? (points), accent? (tile) }[].
 * variant: icons (rows with an icon in a frame), points (icon tile, title, text), accent (disc list with accent markers). accent: tile accent.
 */
import OcWebicon from './OcWebicon.vue'

export interface IconListItem {
  icon?: string
  text?: string
  title?: string
  accent?: string
}
withDefaults(defineProps<{ items: IconListItem[]; variant?: 'icons' | 'points' | 'accent'; accent?: string }>(), { variant: 'icons' })
</script>

<template>
  <ul v-if="variant === 'accent'" class="oc-list--accent">
    <li v-for="(item, i) in items" :key="i">{{ item.text }}</li>
  </ul>
  <ul v-else :class="['oc-icon-list', variant === 'points' && 'oc-icon-list--points']">
    <li v-for="(item, i) in items" :key="i">
      <template v-if="variant === 'points'">
        <span :class="['oc-icon-tile oc-icon-tile--sm', (item.accent ?? accent) && `oc-accent--${item.accent ?? accent}`]" aria-hidden="true"><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" /></span>
        <span v-if="item.title" class="oc-icon-list__title">{{ item.title }}</span>
        <span v-if="item.text" class="oc-icon-list__text">{{ item.text }}</span>
      </template>
      <template v-else><OcWebicon v-if="item.icon" :name="item.icon" bare fallback="iconify" />{{ item.text }}</template>
    </li>
  </ul>
</template>
