<!-- File: packages/vue/src/components/OcLanguageSelect.vue | Map: types + props -> template (label pill: icon slot + native select) -->
<script setup lang="ts">
/**
 * Compact language / currency switcher. v-model = selected value. Slot `icon` replaces the globe / symbol.
 * Same markup as packages/ui/snippets/language-select.html. class/style on the pill, other attributes on the select.
 */
import { useAttrsSplit } from '../composables/useAttrsSplit'

export interface LanguageSelectItem {
  value: string
  label: string
}

defineOptions({ inheritAttrs: false })
defineProps<{
  options: LanguageSelectItem[]
  /** aria-label of the select (default "Language" / "Currency") */
  label?: string
  currency?: boolean
  ghost?: boolean
  /** Text icon, e.g. "€" (default: globe, or € with `currency`) */
  icon?: string
}>()
const model = defineModel<string>()
const { root, control } = useAttrsSplit()
</script>

<template>
  <label v-bind="root" :class="['oc-language-select', ghost && 'oc-language-select--ghost', currency && 'oc-language-select--currency']">
    <span class="oc-language-select-icon" aria-hidden="true">
      <slot name="icon">
        <template v-if="icon || currency">{{ icon ?? '€' }}</template>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
      </slot>
    </span>
    <select v-bind="control" v-model="model" class="oc-language-select-control" :aria-label="label ?? (currency ? 'Currency' : 'Language')">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>
