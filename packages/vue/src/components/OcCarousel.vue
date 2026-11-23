<!-- File: packages/vue/src/components/OcCarousel.vue | Map: props (label, per view, loop, dots) -> slides from the default slot (OcCarouselItem or any node, numbered) -> loop buttons -> fallback dots -> carousel.js after mount -->
<script setup lang="ts">
/**
 * CSS scroll-snap carousel with ::scroll-button arrows and ::scroll-marker dots (same markup as
 * packages/ui/snippets/carousel.html and carousel-loop.html). Every node in the default slot is a slide (an
 * OcCarouselItem keeps its own attributes). per: halves | thirds. loop: real prev / next buttons that wrap around.
 * dots: fallback links for browsers without ::scroll-marker (default on). carousel.js wires both after mount.
 * Classes: .oc-carousel(--halves/--thirds/--loop), -viewport, -item, -prev, -next, -dots, -dot
 */
import { Comment, Fragment, Text, onMounted, onUpdated, ref, useAttrs, useSlots } from 'vue'
import type { VNode } from 'vue'
import { bindCarousel, bindDots } from '../../../ui/src/carousel.js'
import { useUid } from '../composables/useUid'
import OcCarouselItem from './OcCarouselItem.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    per?: 'halves' | 'thirds'
    loop?: boolean
    dots?: boolean
    dotsLabel?: string
    labels?: { previous?: string; next?: string }
  }>(),
  { label: 'Carousel', dots: true, dotsLabel: 'Choose a slide' },
)
const slots = useSlots()
const attrs = useAttrs()
const base = (attrs.id as string | undefined) ?? useUid('oc-carousel')
const root = ref<HTMLElement | null>(null)

function flat(nodes: VNode[]): VNode[] {
  return nodes.flatMap((n) => {
    if (n.type === Fragment) return flat((n.children as VNode[]) ?? [])
    if (n.type === Comment) return []
    if (n.type === Text && !String(n.children ?? '').trim()) return []
    return [n]
  })
}
const slides = () => flat(slots.default?.() ?? [])
const isItem = (n: VNode) => n.type === OcCarouselItem
const slideId = (n: VNode, i: number) => (isItem(n) && (n.props?.id as string | undefined)) || `${base}-slide-${i + 1}`

function wire() {
  if (!root.value) return
  if (props.loop) bindCarousel(root.value)
  if (props.dots) bindDots(root.value)
}
onMounted(wire)
onUpdated(wire)
</script>

<template>
  <div ref="root" :class="['oc-carousel', per && `oc-carousel--${per}`, loop && 'oc-carousel--loop']">
    <template v-for="list in [slides()]" :key="list.length">
      <div :id="`${base}-viewport`" class="oc-carousel-viewport" tabindex="0" role="region" aria-roledescription="carousel" :aria-label="label">
        <template v-for="(node, i) in list" :key="i">
          <component :is="node" v-if="isItem(node)" :id="slideId(node, i)" :index="i" :total="list.length" />
          <OcCarouselItem v-else :id="slideId(node, i)" :index="i" :total="list.length"><component :is="node" /></OcCarouselItem>
        </template>
      </div>
      <template v-if="loop">
        <button class="oc-carousel-prev" type="button" :aria-controls="`${base}-viewport`" :aria-label="labels?.previous ?? 'Previous slide'">&larr;</button>
        <button class="oc-carousel-next" type="button" :aria-controls="`${base}-viewport`" :aria-label="labels?.next ?? 'Next slide'">&rarr;</button>
      </template>
      <nav v-if="dots && list.length" class="oc-carousel-dots" :aria-label="dotsLabel">
        <a v-for="(node, i) in list" :key="i" class="oc-carousel-dot" :href="`#${slideId(node, i)}`" :aria-label="`Slide ${i + 1}`"></a>
      </nav>
    </template>
  </div>
</template>
