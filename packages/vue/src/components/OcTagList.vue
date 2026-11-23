<!-- File: packages/vue/src/components/OcTagList.vue | Map: ul.oc-tag-list -> li per item -> default slot (own li) -->
<script setup lang="ts">
/** Wrapping row of rounded chips (tech stack, brands). Props: items, neutral, size (md|lg). Classes: .oc-tag-list(--neutral/--lg) */
withDefaults(defineProps<{ items?: string[]; neutral?: boolean; size?: 'md' | 'lg' }>(), { items: () => [], size: 'md' })
</script>

<template>
  <ul :class="['oc-tag-list', neutral && 'oc-tag-list--neutral', size === 'lg' && 'oc-tag-list--lg']">
    <li v-for="(item, i) in items" :key="i">{{ item }}</li>
    <slot />
  </ul>
</template>
