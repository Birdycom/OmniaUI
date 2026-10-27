<script setup lang="ts">
/**
 * Numbered steps (CSS counter) + an endless marquee of technologies (the list is rendered twice, the copy aria-hidden).
 * Classes: .oc-section-pad, .oc-container, .oc-eyebrow, .oc-display(--md), .oc-text-gradient, .oc-steps, .oc-marquee
 */
export interface ProcessStep {
  title: string
  text: string
}
defineProps<{
  eyebrow?: string
  title?: string
  highlight?: string
  steps: ProcessStep[]
  marquee?: string[]
  marqueeLabel?: string
}>()
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container">
      <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
      <h2 class="oc-display oc-display--md">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span></h2>
      <ol class="oc-steps">
        <li v-for="step in steps" :key="step.title">
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </li>
      </ol>
      <div v-if="marquee?.length" class="oc-marquee mt-4" :aria-label="marqueeLabel">
        <div class="oc-marquee__track">
          <span v-for="item in marquee" :key="item" class="oc-marquee__item">{{ item }}</span>
          <span v-for="item in marquee" :key="'copy-' + item" class="oc-marquee__item" aria-hidden="true">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
