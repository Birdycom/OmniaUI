<script setup lang="ts">
/**
 * Landing hero: eyebrow, display title with a gradient word, lead, buttons and a code window with floating icon tiles.
 * `title` + `highlight` (gradient word) + `titleEnd`, or the `title` slot. Slots: lead, actions, visual (replaces the code window).
 * Classes: .oc-section-pad, .oc-container, .oc-split, .oc-eyebrow, .oc-display, .oc-text-gradient, .oc-lead, .oc-code-window
 */
defineProps<{
  eyebrow?: string
  title?: string
  highlight?: string
  titleEnd?: string
  lead?: string
  code?: string
  codeTitle?: string
}>()
</script>

<template>
  <section class="oc-section-pad">
    <div class="oc-container oc-split">
      <div>
        <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
        <h1 class="oc-display">
          <slot name="title">{{ title }} <span v-if="highlight" class="oc-text-gradient">{{ highlight }}</span>{{ titleEnd }}</slot>
        </h1>
        <p v-if="lead || $slots.lead" class="oc-lead"><slot name="lead">{{ lead }}</slot></p>
        <div v-if="$slots.actions" class="flex flex-wrap gap-1 mt-2"><slot name="actions" /></div>
      </div>
      <div class="relative p-2">
        <slot name="visual">
          <span class="oc-icon-tile oc-icon-tile--float oc-accent--green absolute" style="inset: -0.5rem auto auto 8%" aria-hidden="true">&#9670;</span>
          <span class="oc-icon-tile oc-icon-tile--float oc-accent--violet absolute" style="inset: 0 6% auto auto; animation-delay: -2s" aria-hidden="true">&#9673;</span>
          <span class="oc-icon-tile oc-icon-tile--float oc-accent--orange absolute" style="inset: auto 10% -0.5rem auto; animation-delay: -4s" aria-hidden="true">&#9650;</span>
          <div class="oc-code-window">
            <div class="oc-code-window__bar"><i></i><i></i><i></i><span v-if="codeTitle" class="oc-code-window__title">{{ codeTitle }}</span></div>
            <pre class="oc-code-window__body">{{ code }}</pre>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>
