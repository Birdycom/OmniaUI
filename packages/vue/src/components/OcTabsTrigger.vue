<script setup lang="ts">
/**
 * Tab of the compound OcTabs (0.17.0): button.oc-tab-trigger[role=tab] that selects `value`. icon = webicon name before the
 * label, count (+ count-tone) after it. Classes: .oc-tab-trigger, .oc-data-table-tab-count(--success/--info/--warning)
 */
import { computed, inject } from 'vue'
import { idPart, tabsKey } from '../composables/keys-d3'
import { revealTab } from '../../../ui/src/tabs.js'
import OcWebicon from './OcWebicon.vue'

const props = defineProps<{
  value: string
  icon?: string
  count?: string | number
  countTone?: 'success' | 'info' | 'warning'
  disabled?: boolean
}>()
const ctx = inject(tabsKey, null)
const on = computed(() => ctx?.value.value === props.value)
const base = ctx?.base ?? 'oc-tabs'
</script>

<template>
  <button
    :id="`${base}-tab-${idPart(value)}`"
    class="oc-tab-trigger"
    type="button"
    role="tab"
    :aria-selected="on ? 'true' : 'false'"
    :aria-controls="`${base}-${idPart(value)}`"
    :tabindex="on || !ctx?.value.value ? 0 : -1"
    :data-state="on ? 'active' : 'inactive'"
    :disabled="disabled || undefined"
    @click="ctx?.select(value); revealTab($event.currentTarget as HTMLElement)"
  >
    <OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /><slot /><span
      v-if="count != null && count !== ''"
      :class="['oc-data-table-tab-count', countTone && `oc-data-table-tab-count--${countTone}`]"
    >{{ count }}</span>
  </button>
</template>
