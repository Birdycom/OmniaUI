<script setup lang="ts">
/**
 * Hero over the full width with a video or photo behind the text (.oc-hero-media). `type` defaults to video for
 * .mp4 / .webm / .ogv / .mov. A video gets the poster and plays only without reduced motion (the source has
 * media="(prefers-reduced-motion: no-preference)"). `scrim`: start (default) | end | full | none. `align`: start | center | end.
 * Slot: default (text, buttons).
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    type?: 'video' | 'image'
    poster?: string
    /** MIME type of the video source (default from the extension). */
    mediaType?: string
    /** Alternative text of an image; empty (default) = decorative. */
    alt?: string
    scrim?: 'start' | 'end' | 'full' | 'none'
    align?: 'start' | 'center' | 'end'
  }>(),
  { alt: '', scrim: 'start', align: 'start' },
)

const VIDEO = /\.(mp4|webm|ogv|mov)(\?.*)?$/i
const MIME: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', mov: 'video/quicktime' }
const isVideo = computed(() => (props.type ?? (VIDEO.test(props.src) ? 'video' : 'image')) === 'video')
const sourceType = computed(() => {
  if (props.mediaType) return props.mediaType
  const ext = props.src.match(VIDEO)?.[1]?.toLowerCase()
  return ext ? MIME[ext] : undefined
})
const classes = computed(() => [
  'oc-hero-media',
  props.scrim === 'full' ? 'oc-hero-media--scrim' : props.scrim !== 'none' && `oc-hero-media--scrim-${props.scrim}`,
  props.align !== 'start' && `oc-hero-media--${props.align}`,
])
</script>

<template>
  <section :class="classes">
    <video v-if="isVideo" class="oc-hero-media__media" :poster="poster" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
      <source :src="src" :type="sourceType" media="(prefers-reduced-motion: no-preference)" />
    </video>
    <img v-else class="oc-hero-media__media" :src="src" :alt="alt" />
    <div class="oc-hero-media__content"><slot /></div>
  </section>
</template>
