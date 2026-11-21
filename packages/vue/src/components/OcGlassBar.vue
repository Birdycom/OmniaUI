<!-- File: packages/vue/src/components/OcGlassBar.vue | Map: props (items, icons, label, lens) -> nav.oc-glass-bar -> links or buttons (icon slot per item), { sep: true } -> divider -> glass-lens.js after mount -->
<script setup lang="ts">
/** Liquid glass menu bar: items with an icon and a label; the current item sits in a raised bubble.
 *  Slots: icon-<index> (the icon of an item). Emits select(index) for items without href. A `{ sep: true }` entry draws a
 *  thin divider (.oc-glass-bar__sep); it counts in the index like an item. lens (default true): in Chromium the backdrop
 *  bends at the edge (glass-lens.js); elsewhere frosted glass. */
import { ref } from 'vue'
import { useGlassLens } from '../composables/useGlassLens'

export interface GlassBarItem { label: string; href?: string; current?: boolean }
const props = withDefaults(defineProps<{ items: (GlassBarItem | { sep: true })[]; icons?: boolean; label?: string; lens?: boolean }>(), { label: 'Main', lens: true })
defineEmits<{ select: [index: number] }>()
const root = ref<HTMLElement | null>(null)
useGlassLens(root, () => props.lens)
</script>

<template>
  <nav ref="root" :class="['oc-glass-bar', icons && 'oc-glass-bar--icons']" :aria-label="label" :data-oc-glass-lens="lens ? undefined : 'off'">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="'sep' in item" class="oc-glass-bar__sep" aria-hidden="true"></span>
      <a v-else-if="item.href != null" class="oc-glass-bar__item" :href="item.href" :aria-current="item.current ? 'page' : undefined" :aria-label="icons ? item.label : undefined"><slot :name="`icon-${i}`" /><span v-if="!icons">{{ item.label }}</span></a>
      <button v-else class="oc-glass-bar__item" type="button" :aria-pressed="item.current ?? false" :aria-label="icons ? item.label : undefined" @click="$emit('select', i)"><slot :name="`icon-${i}`" /><span v-if="!icons">{{ item.label }}</span></button>
    </template>
  </nav>
</template>
