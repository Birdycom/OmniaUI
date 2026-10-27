<!-- File: packages/vue/src/blocks/OcBlockContactGrid.vue | Map: props -> head -> grid -> cards (mark, title, lines) -->
<script setup lang="ts">
/**
 * Contact info cards (e-mail, phone, address, hours). A card with `address: true` renders as <address>.
 * Slot: default (own cards). Classes: .oc-block-contact (--plain), -head, -heading, -lead, -grid, -card, -title, -line
 */
import { useUid } from '../composables/useUid'

export interface ContactGridLine {
  text: string
  href?: string
}
export interface ContactGridCard {
  title: string
  lines: ContactGridLine[]
  icon?: string
  accent?: string
  address?: boolean
}
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    lead?: string
    cards?: ContactGridCard[]
    plain?: boolean
  }>(),
  { cards: () => [] },
)
const titleId = useUid('oc-contact-title')
</script>

<template>
  <section :class="['oc-block-contact', plain && 'oc-block-contact--plain']" :aria-labelledby="title ? titleId : undefined">
    <div v-if="eyebrow || title || lead" class="oc-block-contact-head">
      <p v-if="eyebrow" class="oc-eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title" :id="titleId" class="oc-block-contact-heading">{{ title }}</h2>
      <p v-if="lead" class="oc-block-contact-lead">{{ lead }}</p>
    </div>
    <div class="oc-block-contact-grid">
      <slot>
        <component :is="card.address ? 'address' : 'article'" v-for="(card, i) in cards" :key="i" class="oc-block-contact-card">
          <span v-if="card.icon" :class="['oc-product-mark oc-product-mark--sm oc-product-mark--soft', card.accent && `oc-accent--${card.accent}`]" aria-hidden="true">{{ card.icon }}</span>
          <component :is="card.address ? 'span' : 'h3'" class="oc-block-contact-title">{{ card.title }}</component>
          <template v-for="(line, j) in card.lines" :key="j">
            <a v-if="line.href" class="oc-block-contact-line" :href="line.href">{{ line.text }}</a>
            <component :is="card.address ? 'span' : 'p'" v-else class="oc-block-contact-line">{{ line.text }}</component>
          </template>
        </component>
      </slot>
    </div>
  </section>
</template>
