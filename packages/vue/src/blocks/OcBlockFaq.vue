<!-- File: packages/vue/src/blocks/OcBlockFaq.vue | Map: props -> section.oc-block-faq -> head -> accordion (details name) -> more slot -->
<script setup lang="ts">
/**
 * FAQ section: title + exclusive accordion on native <details name> (no JavaScript).
 * Slots: lead, default (own details items), more. Classes: .oc-block-faq (--split), -inner, -head, -title, -lead, -list, -more
 */
import { useUid } from '../composables/useUid'

export interface FaqItem {
  question: string
  answer: string
}
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    items?: FaqItem[]
    openIndex?: number
    split?: boolean
    name?: string
  }>(),
  { items: () => [], openIndex: 0 },
)
const titleId = useUid('oc-faq-title')
const autoGroup = useUid('oc-faq')
const group = props.name ?? autoGroup
</script>

<template>
  <section :class="['oc-block-faq', split && 'oc-block-faq--split']" :aria-labelledby="titleId">
    <div class="oc-block-faq-inner">
      <div class="oc-block-faq-head">
        <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
        <h2 :id="titleId" class="oc-block-faq-title">{{ title }}</h2>
        <p v-if="lead || $slots.lead" class="oc-block-faq-lead"><slot name="lead">{{ lead }}</slot></p>
      </div>
      <div class="oc-accordion oc-block-faq-list">
        <slot>
          <details v-for="(item, i) in items" :key="i" class="oc-accordion-item" :name="group" :open="i === openIndex">
            <summary class="oc-accordion-trigger">{{ item.question }}</summary>
            <div class="oc-accordion-content">{{ item.answer }}</div>
          </details>
        </slot>
      </div>
      <p v-if="$slots.more" class="oc-block-faq-more"><slot name="more" /></p>
    </div>
  </section>
</template>
