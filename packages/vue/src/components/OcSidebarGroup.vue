<script setup lang="ts">
/** Group of sidebar items with an optional heading (`label`). In the docs sidebar: a p.oc-sidebar-group-label and the items, no wrapper. */
import { computed, inject, type Ref } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{ label?: string }>()
const variant = inject<Ref<'app' | 'docs'> | null>('oc-sidebar-variant', null)
const docs = computed(() => variant?.value === 'docs')
</script>

<template>
  <template v-if="docs">
    <p v-if="label" class="oc-sidebar-group-label" v-bind="$attrs">{{ label }}</p>
    <slot />
  </template>
  <div v-else class="oc-sidebar-group" v-bind="$attrs">
    <div v-if="label" class="oc-sidebar-group-label">{{ label }}</div>
    <slot />
  </div>
</template>
