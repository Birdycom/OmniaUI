<script setup lang="ts">
/**
 * Panel of the compound OcTabs (0.17.0): .oc-tab-panel[role=tabpanel], .is-active when `value` is selected.
 * force-mount (default true) keeps the content in the DOM while hidden; false renders only the active panel's content.
 * Classes: .oc-tab-panel, .is-active
 */
import { computed, inject } from 'vue'
import { idPart, tabsKey } from '../composables/keys-d3'

const props = withDefaults(defineProps<{ value: string; forceMount?: boolean }>(), { forceMount: true })
const ctx = inject(tabsKey, null)
const on = computed(() => ctx?.value.value === props.value)
const base = ctx?.base ?? 'oc-tabs'
</script>

<template>
  <div
    :id="`${base}-${idPart(value)}`"
    :class="['oc-tab-panel', on && 'is-active']"
    role="tabpanel"
    :aria-labelledby="`${base}-tab-${idPart(value)}`"
    tabindex="0"
    :data-state="on ? 'active' : 'inactive'"
  >
    <slot v-if="on || forceMount" />
  </div>
</template>
