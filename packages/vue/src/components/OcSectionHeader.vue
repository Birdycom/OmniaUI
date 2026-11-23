<!-- File: packages/vue/src/components/OcSectionHeader.vue | Map: props -> div.oc-section-header (title, source / scss / file / version badges, description) -> slot -->
<script setup lang="ts">
/**
 * Header for a content section (section-header page): title and badges on one row, the description below. Every part is optional.
 * Props: title, as (heading tag, default h2), source, scss, file, version, description. Slots: title, description, default (after the description).
 */
import OcBadgeSource from './OcBadgeSource.vue'
import OcVersionBadge from './OcVersionBadge.vue'

withDefaults(defineProps<{ title?: string; as?: string; source?: string; scss?: string; file?: string; version?: string; description?: string }>(), { as: 'h2' })
</script>

<template>
  <div class="oc-section-header">
    <component :is="as" v-if="title || $slots.title" class="oc-section-header__title"><slot name="title">{{ title }}</slot></component>
    <OcBadgeSource v-if="source" class="oc-section-header__badge-source">{{ source }}</OcBadgeSource>
    <OcBadgeSource v-if="scss" kind="scss" class="oc-section-header__badge-scss">{{ scss }}</OcBadgeSource>
    <OcBadgeSource v-if="file" kind="file" class="oc-section-header__badge-file">{{ file }}</OcBadgeSource>
    <OcVersionBadge v-if="version" class="oc-section-header__badge-version">{{ version }}</OcVersionBadge>
    <p v-if="description || $slots.description" class="oc-section-header__desc"><slot name="description">{{ description }}</slot></p>
    <slot />
  </div>
</template>
