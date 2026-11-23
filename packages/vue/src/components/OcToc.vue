<!-- File: packages/vue/src/components/OcToc.vue | Map: nav.oc-toc -> title -> groups (label + list) or one list -> slot -> scroll-spy (toc.js) -->
<script setup lang="ts">
/**
 * "On this page" list of heading links (snippets/toc.html; groups as in doc-layout.html).
 * Props: items ({ href, label, sub?, current? }[]), groups ({ label, items }[]), title, label (aria-label), spy (toc.js, default true), line.
 * Classes: .oc-toc, .oc-toc-title, .oc-toc-group-label, ul.oc-toc-list, li.oc-toc-item--sub, a.oc-toc-link[aria-current]
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { initToc } from '../../../ui/src/toc.js'

export interface TocItem {
  href: string
  label: string
  sub?: boolean
  current?: boolean
}
export interface TocGroup {
  label: string
  items: TocItem[]
}

const props = withDefaults(
  defineProps<{ items?: TocItem[]; groups?: TocGroup[]; title?: string; label?: string; spy?: boolean; line?: number }>(),
  { label: 'On this page', spy: true },
)
const el = ref<HTMLElement | null>(null)
let stop: (() => void) | undefined

onMounted(() => {
  const nav = el.value
  if (!props.spy || !nav) return
  // A scope that holds only this nav, so a second table of contents is not started twice.
  stop = initToc({ ownerDocument: nav.ownerDocument, querySelectorAll: () => [nav] } as unknown as ParentNode)
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <nav ref="el" class="oc-toc" :aria-label="label" :data-oc-toc-line="line">
    <p v-if="title" class="oc-toc-title">{{ title }}</p>
    <template v-for="(group, g) in groups ?? []" :key="g">
      <p class="oc-toc-group-label">{{ group.label }}</p>
      <ul class="oc-toc-list">
        <li v-for="(item, i) in group.items" :key="i" :class="item.sub ? 'oc-toc-item--sub' : undefined">
          <a class="oc-toc-link" :href="item.href" :aria-current="item.current ? 'true' : undefined">{{ item.label }}</a>
        </li>
      </ul>
    </template>
    <ul v-if="items" class="oc-toc-list">
      <li v-for="(item, i) in items" :key="i" :class="item.sub ? 'oc-toc-item--sub' : undefined">
        <a class="oc-toc-link" :href="item.href" :aria-current="item.current ? 'true' : undefined">{{ item.label }}</a>
      </li>
    </ul>
    <slot />
  </nav>
</template>
