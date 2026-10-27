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
  }>(),
  {
    code: '',
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
const angle = (i: number) => `--oc-orbit-angle: ${(360 / props.marks.length) * i}deg`
const visualStyle = computed(() => (props.duration ? `--oc-orbit-duration: ${props.duration}` : undefined))
</script>

<template>
  <section class="oc-block-orbit oc-section-pad">
    <div class="oc-container oc-split">
      <div>
        <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
        <h1 class="oc-display">
          <slot name="title">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span>{{ titleEnd }}</slot>
        </h1>
        <p v-if="lead || $slots.lead" class="oc-lead"><slot name="lead">{{ lead }}</slot></p>
        <div v-if="$slots.actions" class="flex flex-wrap gap-1 mt-2"><slot name="actions" /></div>
      </div>
      <div class="oc-block-orbit-visual" :style="visualStyle">
        <div class="oc-block-orbit-ring" aria-hidden="true">
          <span v-for="(mark, i) in marks" :key="i" class="oc-block-orbit-mark" :style="angle(i)">
            <span :class="['oc-product-mark oc-product-mark--sm', `oc-accent--${mark.accent}`]">{{ mark.glyph }}</span>
          </span>
        </div>
        <slot name="center">
          <div class="oc-code-window oc-block-orbit-center">
            <div class="oc-code-window__bar"><i></i><i></i><i></i><span v-if="codeTitle" class="oc-code-window__title">{{ codeTitle }}</span></div>
            <pre class="oc-code-window__body">{{ code }}</pre>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>
