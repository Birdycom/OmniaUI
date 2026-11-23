<!-- File: packages/vue/src/blocks/OcBlockAboutTimeline.vue | Map: props -> media (+ badge slot) -> copy (title, default slot) -> OcTimeline -->
<script setup lang="ts">
/**
 * About section: picture with a badge next to the company story and a year timeline.
 * `title` + `highlight` (gradient part), or the `title` slot. Slots: title, default (paragraphs), badge (or the `badge` text prop).
 * `accent`: accent preset (oc-accent--{accent}) for the placeholder and timeline; `timelineAccent`: timeline in the accent color.
 * Classes: .oc-block-about (--reverse), -inner, -media, -badge, -copy, -title + .oc-timeline
 */
import OcTimeline from '../components/OcTimeline.vue'
import type { TimelineEntry } from '../components/OcTimeline.vue'
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    highlight?: string
    timeline?: TimelineEntry[]
    image?: string
    imageAlt?: string
    reverse?: boolean
    badge?: string
    accent?: string
    timelineAccent?: boolean
  }>(),
  { timeline: () => [], imageAlt: '', timelineAccent: false },
)
const titleId = useUid('oc-about-title')
</script>

<template>
  <section :class="['oc-block-about', reverse && 'oc-block-about--reverse', accent && `oc-accent--${accent}`]" :aria-labelledby="titleId">
    <div class="oc-block-about-inner">
      <figure class="oc-block-about-media" :aria-hidden="image ? undefined : 'true'">
        <img v-if="image" :src="image" :alt="imageAlt" loading="lazy" />
        <span v-if="$slots.badge || badge" class="oc-block-about-badge"><slot name="badge">{{ badge }}</slot></span>
      </figure>
      <div class="oc-block-about-copy">
        <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
        <h2 :id="titleId" class="oc-block-about-title">
          <slot name="title">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></slot>
        </h2>
        <slot />
        <OcTimeline v-if="timeline.length" :items="timeline" :accent="timelineAccent" />
      </div>
    </div>
  </section>
</template>
