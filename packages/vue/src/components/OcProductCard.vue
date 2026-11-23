<!-- File: packages/vue/src/components/OcProductCard.vue | Map: a or article.oc-product-card -> top slot -> name + badge -> tagline -> summary -> more -> fly-in (fly.js) -->
<script setup lang="ts">
/**
 * Product or service card with a hover lift and an accent glow (the product cards of snippets/fly-in.html).
 * Props: name, href (a link; else an article), tagline, summary (or the default slot), more, badge ("New"), accent,
 * headingLevel, fly (.oc-reveal--fly, started with fly.js), flyX (own --oc-fly-x). Slot: top (row above the name).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { initFly } from '../../../ui/src/fly.js'

const props = withDefaults(
  defineProps<{
    name: string
    href?: string
    tagline?: string
    summary?: string
    more?: string
    badge?: string
    accent?: string
    headingLevel?: 2 | 3 | 4
    fly?: boolean
    flyX?: string
  }>(),
  { headingLevel: 3 },
)
const el = ref<HTMLElement | null>(null)
let stop: (() => void) | undefined

onMounted(() => {
  const card = el.value
  if (!props.fly || !card) return
  // A scope with only this card: fly.js still reads its row from the parent, and no card is watched twice.
  stop = initFly({ ownerDocument: card.ownerDocument, querySelectorAll: (sel: string) => (card.matches(sel) ? [card] : []) } as unknown as ParentNode)
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <component
    :is="href !== undefined ? 'a' : 'article'"
    ref="el"
    :href="href"
    :class="['oc-product-card', fly && 'oc-reveal--fly', accent && `oc-accent--${accent}`]"
    :style="flyX ? { '--oc-fly-x': flyX } : undefined"
  >
    <div v-if="$slots.top" class="oc-product-card__top"><slot name="top" /></div>
    <component :is="`h${headingLevel}`" class="oc-product-card__name">{{ name }}<template v-if="badge"> <span class="oc-product-card__badge oc-pill oc-pill--accent">{{ badge }}</span></template></component>
    <p v-if="tagline" class="oc-product-card__tagline">{{ tagline }}</p>
    <p v-if="summary || $slots.default" class="oc-product-card__summary"><slot>{{ summary }}</slot></p>
    <span v-if="more" class="oc-product-card__more">{{ more }}</span>
  </component>
</template>
