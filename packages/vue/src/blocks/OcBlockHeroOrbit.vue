<!-- File: packages/vue/src/blocks/OcBlockHeroOrbit.vue | Map: props + default marks -> copy -> visual (ring with marks + center slot / code window) -->
<script setup lang="ts">
/**
 * Hero with a code window and product marks that orbit around it (reduced motion: they stand still).
 * `title` + `highlight` + `titleEnd`, or the `title` slot. Slots: lead, actions, center (replaces the code window;
 * give it class="oc-block-orbit-center"). Classes: .oc-block-orbit-visual, -ring, -mark (--oc-orbit-angle), -center
 */
import { computed } from 'vue'

export interface HeroOrbitMark {
  glyph: string
  accent: string
  /** Own angle in degrees (0.17.0); without it the marks are spread evenly from `startAngle`. */
  angle?: number
}
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    highlight?: string
    titleEnd?: string
    lead?: string
    code?: string
    codeTitle?: string
    marks?: HeroOrbitMark[]
    duration?: string
    /** 0.17.0: 2 renders an h2.oc-display--md. */
    headingLevel?: 1 | 2
    /** 0.17.0: wider copy column (.oc-split--lead). */
    splitLead?: boolean
    /** 0.17.0: marks float around the window (.oc-block-orbit-visual--float). */
    float?: boolean
    /** 0.17.0: angle of the first mark in degrees. */
    startAngle?: number
    /** 0.17.0: mark size (md = the normal product mark). */
    markSize?: 'sm' | 'md' | 'lg'
    /** 0.17.0: soft marks (.oc-product-mark--soft). */
    softMarks?: boolean
    /** 0.17.0: a big product mark in the center instead of the code window (the center slot still wins). */
    centerMark?: { glyph: string; accent?: string }
  }>(),
  {
    code: '',
    headingLevel: 1,
    startAngle: 0,
    markSize: 'sm',
    marks: () => [
      { glyph: '◆', accent: 'green' },
      { glyph: '◉', accent: 'violet' },
      { glyph: '▲', accent: 'orange' },
      { glyph: '★', accent: 'cyan' },
      { glyph: '♥', accent: 'red' },
      { glyph: '☀', accent: 'yellow' },
    ],
  },
)
// Spread the marks evenly over the ring.
const angle = (i: number) =>
  props.float ? undefined : `--oc-orbit-angle: ${props.marks[i]?.angle ?? props.startAngle + (360 / props.marks.length) * i}deg`
const markClass = computed(() => ['oc-product-mark', props.markSize !== 'md' && `oc-product-mark--${props.markSize}`, props.softMarks && 'oc-product-mark--soft'])
const heading = computed(() => (props.headingLevel === 2 ? 'h2' : 'h1'))
const visualStyle = computed(() => (props.duration ? `--oc-orbit-duration: ${props.duration}` : undefined))
</script>

<template>
  <section class="oc-block-orbit oc-section-pad">
    <div :class="['oc-container oc-split', splitLead && 'oc-split--lead']">
      <div>
        <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
        <component :is="heading" :class="['oc-display', headingLevel === 2 && 'oc-display--md']">
          <slot name="title">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span>{{ titleEnd }}</slot>
        </component>
        <p v-if="lead || $slots.lead" class="oc-lead"><slot name="lead">{{ lead }}</slot></p>
        <div v-if="$slots.actions" class="flex flex-wrap gap-1 mt-2"><slot name="actions" /></div>
      </div>
      <div :class="['oc-block-orbit-visual', float && 'oc-block-orbit-visual--float']" :style="visualStyle">
        <div class="oc-block-orbit-ring" aria-hidden="true">
          <span v-for="(mark, i) in marks" :key="i" class="oc-block-orbit-mark" :style="angle(i)">
            <span :class="[markClass, `oc-accent--${mark.accent}`]">{{ mark.glyph }}</span>
          </span>
        </div>
        <slot name="center">
          <span v-if="centerMark" :class="['oc-block-orbit-center oc-product-mark oc-product-mark--xl', centerMark.accent && `oc-accent--${centerMark.accent}`]" style="inline-size: var(--oc-mark-size)" aria-hidden="true">{{ centerMark.glyph }}</span>
          <div v-else class="oc-code-window oc-block-orbit-center">
            <div class="oc-code-window__bar"><i></i><i></i><i></i><span v-if="codeTitle" class="oc-code-window__title">{{ codeTitle }}</span></div>
            <pre class="oc-code-window__body">{{ code }}</pre>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>
