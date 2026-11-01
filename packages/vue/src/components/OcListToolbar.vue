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
          <!-- Built-in webicons for the three common views (mdi:view-grid-outline, mdi:table, mdi:format-list-bulleted). -->
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path v-if="v.value === 'cards'" d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z" />
            <path v-else-if="v.value === 'table'" d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4v4h6V8zm8 0v4h6V8zm-8 6v4h6v-4zm8 0v4h6v-4z" />
            <path v-else d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5" />
          </svg>
        </slot>
      </label>
    </div>
    <div v-if="$slots.actions" class="oc-list-toolbar-actions"><slot name="actions" /></div>
  </div>
</template>
