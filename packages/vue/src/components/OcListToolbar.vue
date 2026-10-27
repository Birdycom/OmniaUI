<!-- File: packages/vue/src/components/OcListToolbar.vue | Map: toolbar row -> search slot -> count -> spacer -> view radios (built-in icons) -> actions slot -->
<script setup lang="ts">
/**
 * Toolbar above a list. v-model:view picks the view ("cards", "table" or "list"); render the matching view yourself.
 * Slots: search, actions, view-icon (scoped { view } to replace the built-in icons).
 * Classes: .oc-list-toolbar(--sticky/--bordered), -search, -count, -spacer, -views, -view, -actions
 */
import { useUid } from '../composables/useUid'

withDefaults(
  defineProps<{
    count?: string
    views?: Array<{ value: string; label: string }>
    viewsLabel?: string
    sticky?: boolean
    bordered?: boolean
  }>(),
  { views: () => [], viewsLabel: 'View' },
)
const view = defineModel<string>('view', { default: 'cards' })
const name = useUid('oc-list-view')
</script>

<template>
  <div :class="['oc-list-toolbar', sticky && 'oc-list-toolbar--sticky', bordered && 'oc-list-toolbar--bordered']" role="toolbar">
    <div v-if="$slots.search" class="oc-list-toolbar-search"><slot name="search" /></div>
    <span v-if="count" class="oc-list-toolbar-count">{{ count }}</span>
    <span class="oc-list-toolbar-spacer"></span>
    <div v-if="views.length" class="oc-list-toolbar-views" role="radiogroup" :aria-label="viewsLabel">
      <label v-for="v in views" :key="v.value" class="oc-list-toolbar-view" :title="v.label">
        <input v-model="view" type="radio" :name="name" :value="v.value" :aria-label="v.label" />
        <slot name="view-icon" :view="v">
          <!-- Built-in icons for the three common views. -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <template v-if="v.value === 'cards'"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></template>
            <path v-else-if="v.value === 'table'" d="M3 5h18M3 12h18M3 19h18" />
            <path v-else d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </slot>
      </label>
    </div>
    <div v-if="$slots.actions" class="oc-list-toolbar-actions"><slot name="actions" /></div>
  </div>
</template>
