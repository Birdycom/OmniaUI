<!-- File: packages/vue/src/components/OcMediaThumb.vue | Map: props -> <a>/<div> -> picture -> badge -> duration -> progress -->
<script setup lang="ts">
/**
 * 16:9 video thumbnail (same markup as snippets/media-thumb.html). href renders an <a>.
 * Props: src, alt, art (placeholder variant 1-6), duration, badge, live, progress (0-100), watched, ratio (video|square|portrait).
 * Default slot: extra overlay content. Classes: .oc-media-thumb(--square/--portrait, .is-watched), __badge(--live), __duration, __progress
 */
withDefaults(
  defineProps<{
    src?: string
    alt?: string
    art?: number
    href?: string
    duration?: string
    badge?: string
    live?: boolean
    progress?: number
    watched?: boolean
    ratio?: 'video' | 'square' | 'portrait'
  }>(),
  { alt: '', ratio: 'video' },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="['oc-media-thumb', ratio !== 'video' && `oc-media-thumb--${ratio}`, watched && 'is-watched']"
  >
    <img v-if="src" :src="src" :alt="alt" />
    <div v-else :class="['oc-media-art', art && art > 1 && `oc-media-art--${art}`]" />
    <span v-if="badge" :class="['oc-media-thumb__badge', live && 'oc-media-thumb__badge--live']">{{ badge }}</span>
    <span v-if="duration" class="oc-media-thumb__duration">{{ duration }}</span>
    <progress v-if="progress != null" class="oc-media-thumb__progress" :value="progress" max="100" :aria-label="`Watched ${progress}%`">{{ progress }}%</progress>
    <slot />
  </component>
</template>
