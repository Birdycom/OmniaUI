<!-- File: packages/vue/src/components/OcGlassBar.vue | Map: props (items, icons, label) -> nav.oc-glass-bar -> links or buttons (icon slot per item) -->
<script setup lang="ts">
/** Liquid glass menu bar: items with an icon and a label; the current item sits in a raised bubble.
 *  Slots: icon-<index> (the icon of an item). Emits select(index) for items without href. */
export interface GlassBarItem { label: string; href?: string; current?: boolean }
withDefaults(defineProps<{ items: GlassBarItem[]; icons?: boolean; label?: string }>(), { label: 'Main' })
defineEmits<{ select: [index: number] }>()
</script>

<template>
  <nav :class="['oc-glass-bar', icons && 'oc-glass-bar--icons']" :aria-label="label">
    <template v-for="(item, i) in items" :key="i">
      <a v-if="item.href != null" class="oc-glass-bar__item" :href="item.href" :aria-current="item.current ? 'page' : undefined" :aria-label="icons ? item.label : undefined"><slot :name="`icon-${i}`" /><span v-if="!icons">{{ item.label }}</span></a>
      <button v-else class="oc-glass-bar__item" type="button" :aria-pressed="item.current ?? false" :aria-label="icons ? item.label : undefined" @click="$emit('select', i)"><slot :name="`icon-${i}`" /><span v-if="!icons">{{ item.label }}</span></button>
    </template>
  </nav>
</template>
